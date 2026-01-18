/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    NOTIFICATION SERVICE                                   ║
 * ║          Enterprise Browser Capability - Toast & Desktop Alerts          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/notification/NotificationService
 * @description Browser-based notification service
 *
 * COMPLIANCE CHECKLIST:
 * [✓] Is this logic imperative? YES - manages browser notifications
 * [✓] Does it touch browser or SDK APIs? YES - Notification API, Audio
 * [✓] Is it stateless? NO - manages notification queue (ephemeral)
 * [✓] Is it injectable? YES - implements IService
 * [✓] Does it avoid domain knowledge? YES - generic notifications
 * [✓] Does it avoid React imports? YES - no React dependencies
 */

import { BaseService, type ServiceConfig } from "../core/ServiceLifecycle";
import { IdGenerator, TimerManager } from "../core/factories/Utilities";
import { EventEmitter } from "../core/factories";
import { defaultStorage } from "../infrastructure/adapters/StorageAdapter";
import { TIMEOUTS } from "@/config/ports.config";

// ============================================================================
// TYPES
// ============================================================================

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: number;
  duration?: number;
  actions?: NotificationAction[];
  groupKey?: string;
  icon?: string;
  sound?: boolean;
  desktop?: boolean;
  read?: boolean;
}

export interface NotificationGroup {
  groupKey: string;
  notifications: Notification[];
  count: number;
  latestTimestamp: number;
  collapsed: boolean;
}

export type NotificationListener = (notifications: Notification[]) => void;

export interface NotificationServiceConfig extends ServiceConfig {
  maxNotifications?: number;
  desktopEnabled?: boolean;
  soundEnabled?: boolean;
}

// ============================================================================
// NOTIFICATION SERVICE INTERFACE
// ============================================================================

export interface NotificationService {
  show(notification: Omit<Notification, "id" | "timestamp">): string;
  dismiss(id: string): void;
  dismissAll(): void;
  markAsRead(id: string): void;
  markAllAsRead(): void;
  getAll(): Notification[];
  getUnreadCount(): number;
  getGrouped(): (Notification | NotificationGroup)[];
  addListener(listener: NotificationListener): () => void;
  requestDesktopPermission(): Promise<boolean>;
  setSoundEnabled(enabled: boolean): void;
  getSoundEnabled(): boolean;
  getDesktopEnabled(): boolean;
}

// ============================================================================
// BROWSER NOTIFICATION SERVICE
// ============================================================================

export class BrowserNotificationService
  extends BaseService<NotificationServiceConfig>
  implements NotificationService
{
  private notifications: Notification[] = [];
  private eventEmitter = new EventEmitter<Notification[]>({
    serviceName: 'NotificationService',
    maxListeners: 1000
  });
  private maxNotifications: number = 50;
  private desktopEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private desktopPermission: NotificationPermission = "default";
  private idGen = new IdGenerator('notif');
  private timers = new TimerManager();
  private desktopNotifications = new Map<string, Notification>();

  constructor() {
    super("NotificationService");
  }

  protected override onConfigure(config: NotificationServiceConfig): void {
    this.maxNotifications = config.maxNotifications ?? 50;
    this.desktopEnabled = config.desktopEnabled ?? true;
    this.soundEnabled = config.soundEnabled ?? true;
  }

  protected override onStart(): void {
    // Check desktop notification permission
    if ("Notification" in window) {
      this.desktopPermission = Notification.permission;
    }
    
    // Load preferences from storage
    try {
      const soundPref = defaultStorage.getItem("notification_sound");
      if (soundPref !== null) {
        this.soundEnabled = soundPref === "true";
      }
    } catch (error) {
      this.warn("Failed to load sound preference:", error);
    }
  }

  protected override onStop(): void {
    this.dismissAll();
    this.timers.clearAll();
  }

  show(notification: Omit<Notification, "id" | "timestamp">): string {
    this.ensureRunning();

    const id = this.idGen.short();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.push(fullNotification);

    // Prune old notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift();
    }

    // Show desktop notification if enabled
    if (
      fullNotification.desktop &&
      this.desktopEnabled &&
      this.desktopPermission === "granted"
    ) {
      this.showDesktopNotification(fullNotification);
    }

    // Play sound if enabled
    if (fullNotification.sound && this.soundEnabled) {
      this.playSound(fullNotification.priority);
    }

    // Auto-dismiss if duration specified
    if (fullNotification.duration && fullNotification.duration > 0) {
      this.timers.setTimeout(() => {
        this.dismiss(id);
      }, fullNotification.duration);
    }

    this.notifyListeners();

    return id;
  }

  dismiss(id: string): void {
    this.ensureRunning();

    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  dismissAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  markAsRead(id: string): void {
    this.ensureRunning();

    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.ensureRunning();
    
    let changed = false;
    this.notifications.forEach((n) => {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    });
    
    if (changed) {
      this.notifyListeners();
    }
  }

  getUnreadCount(): number {
    this.ensureRunning();
    return this.notifications.filter((n) => !n.read).length;
  }

  getGrouped(): (Notification | NotificationGroup)[] {
    this.ensureRunning();
    
    try {
      const groups = new Map<string, Notification[]>();
      const ungrouped: Notification[] = [];

      // Group notifications by groupKey
      this.notifications.forEach((notification) => {
        if (notification.groupKey) {
          const existing = groups.get(notification.groupKey) || [];
          existing.push(notification);
          groups.set(notification.groupKey, existing);
        } else {
          ungrouped.push(notification);
        }
      });

      // Convert to array with groups
      const result: (Notification | NotificationGroup)[] = [...ungrouped];

      groups.forEach((notifications, groupKey) => {
        if (notifications.length >= 3) {
          // Create collapsed group
          result.push({
            groupKey,
            notifications,
            count: notifications.length,
            latestTimestamp: Math.max(...notifications.map((n) => n.timestamp)),
            collapsed: true,
          });
        } else {
          // Add individually
          result.push(...notifications);
        }
      });

      // Sort by timestamp (newest first)
      return result.sort((a, b) => {
        const aTime = "latestTimestamp" in a ? a.latestTimestamp : a.timestamp;
        const bTime = "latestTimestamp" in b ? b.latestTimestamp : b.timestamp;
        return bTime - aTime;
      });
    } catch (error) {
      this.error("Failed to group notifications:", error);
      return [];
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      defaultStorage.setItem("notification_sound", String(enabled));
    } catch (error) {
      this.warn("Failed to save sound preference:", error);
    }
  }

  getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  getDesktopEnabled(): boolean {
    return this.desktopEnabled && this.desktopPermission === "granted";
  }

  getAll(): Notification[] {
    this.ensureRunning();
    return [...this.notifications];
  }

  addListener(listener: NotificationListener): () => void {
    this.ensureRunning();
    return this.eventEmitter.subscribe(listener);
  }

  async requestDesktopPermission(): Promise<boolean> {
    this.ensureRunning();

    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      this.desktopPermission = "granted";
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.desktopPermission = permission;
      return permission === "granted";
    } catch (error) {
      this.error("Failed to request desktop permission:", error);
      return false;
    }
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private showDesktopNotification(notification: Notification): void {
    try {
      const desktopNotif = new Notification(notification.title, {
        body: notification.message ?? "",
        ...(notification.icon ? { icon: notification.icon } : {}),
        tag: notification.id,
      });

      // Auto-close after duration
      if (notification.duration) {
        this.timers.setTimeout(() => desktopNotif.close(), notification.duration);
      }
    } catch (error) {
      this.error("Failed to show desktop notification:", error);
    }
  }

  private playSound(priority: NotificationPriority): void {
    try {
      type AudioContextType = typeof AudioContext;
      const AudioContextConstructor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: AudioContextType })
          .webkitAudioContext;
      if (!AudioContextConstructor) return;

      const audioContext = new AudioContextConstructor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Map priority to frequency
      const frequencies = {
        low: 300,
        normal: 400,
        high: 500,
        urgent: 600,
      };

      oscillator.frequency.value = frequencies[priority];
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      this.error("Failed to play sound:", error);
    }
  }

  private notifyListeners(): void {
    const notifications = this.getAll();
    this.eventEmitter.notify(notifications);
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

const NOTIFICATION_SUCCESS_DISMISS_MS = TIMEOUTS.NOTIFICATION_SUCCESS || 3000;
const NOTIFICATION_AUTO_DISMISS_MS = TIMEOUTS.NOTIFICATION_ERROR || 5000;

/**
 * Get the notification service instance from ServiceRegistry
 * @private
 */
function getNotificationService(): BrowserNotificationService {
  const { ServiceRegistry } = require("../core/ServiceRegistry");
  return ServiceRegistry.get<BrowserNotificationService>("NotificationService");
}

/**
 * Convenience functions for common notification patterns
 * Provides semantic shortcuts for info, success, warning, error, and undo
 *
 * @example
 * notify.success('Saved', 'Document saved successfully');
 * notify.error('Failed', 'Upload failed', { desktop: true });
 * notify.withUndo('Deleted', 'Item deleted', () => restoreItem());
 */
export const notify = {
  /**
   * Info notification (normal priority, no auto-dismiss)
   */
  info: (
    title: string,
    message?: string,
    options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "read">>,
  ) => {
    return getNotificationService().show({
      title,
      message: message ?? "",
      type: "info",
      priority: "normal",
      ...options,
    });
  },

  /**
   * Success notification (normal priority, auto-dismiss)
   */
  success: (
    title: string,
    message?: string,
    options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "read">>,
  ) => {
    return getNotificationService().show({
      title,
      message: message ?? "",
      type: "success",
      priority: "normal",
      duration: NOTIFICATION_SUCCESS_DISMISS_MS,
      ...options,
    });
  },

  /**
   * Warning notification (high priority, auto-dismiss)
   */
  warning: (
    title: string,
    message?: string,
    options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "read">>,
  ) => {
    return getNotificationService().show({
      title,
      message: message ?? "",
      type: "warning",
      priority: "high",
      duration: NOTIFICATION_AUTO_DISMISS_MS,
      ...options,
    });
  },

  /**
   * Error notification (urgent priority, persistent)
   */
  error: (
    title: string,
    message?: string,
    options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "read">>,
  ) => {
    return getNotificationService().show({
      title,
      message: message ?? "",
      type: "error",
      priority: "urgent",
      duration: 0, // Persistent
      ...options,
    });
  },

  /**
   * Notification with Undo action (success type, 5s duration)
   */
  withUndo: (
    title: string,
    message: string,
    onUndo: () => void,
    options?: Partial<Omit<Notification, "id" | "timestamp" | "type" | "read">>,
  ) => {
    return getNotificationService().show({
      title,
      message,
      type: "success",
      priority: "normal",
      duration: 5000,
      actions: [
        {
          label: "Undo",
          onClick: onUndo,
          variant: "primary",
        },
      ],
      ...options,
    });
  },
}
