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
  getAll(): Notification[];
  addListener(listener: NotificationListener): () => void;
  requestDesktopPermission(): Promise<boolean>;
}

// ============================================================================
// BROWSER NOTIFICATION SERVICE
// ============================================================================

export class BrowserNotificationService
  extends BaseService<NotificationServiceConfig>
  implements NotificationService
{
  private notifications: Notification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private maxNotifications: number = 50;
  private desktopEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private desktopPermission: NotificationPermission = "default";

  constructor() {
    super("NotificationService");
  }

  protected override onConfigure(config: NotificationServiceConfig): void {
    this.maxNotifications = config.maxNotifications ?? 50;
    this.desktopEnabled = config.desktopEnabled ?? true;
    this.soundEnabled = config.soundEnabled ?? true;
  }

  protected override async onStart(): Promise<void> {
    // Check desktop notification permission
    if ("Notification" in window) {
      this.desktopPermission = Notification.permission;
    }
  }

  protected override async onStop(): Promise<void> {
    this.dismissAll();
  }

  show(notification: Omit<Notification, "id" | "timestamp">): string {
    this.ensureRunning();

    const id = this.generateId();
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
      setTimeout(() => {
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

  getAll(): Notification[] {
    this.ensureRunning();
    return [...this.notifications];
  }

  addListener(listener: NotificationListener): () => void {
    this.ensureRunning();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
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

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private showDesktopNotification(notification: Notification): void {
    try {
      const desktopNotif = new Notification(notification.title, {
        body: notification.message ?? "",
        ...(notification.icon ? { icon: notification.icon } : {}),
        tag: notification.id,
      });

      // Auto-close after duration
      if (notification.duration) {
        setTimeout(() => desktopNotif.close(), notification.duration);
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
    this.listeners.forEach((listener) => {
      try {
        listener(notifications);
      } catch (error) {
        this.error("Listener error:", error);
      }
    });
  }
}
