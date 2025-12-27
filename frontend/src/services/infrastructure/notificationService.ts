/**
 * Notification Service - Enterprise notification management with grouping, priority, and actions
 * Production-grade toast, desktop, and in-app notification system
 * 
 * @module services/infrastructure/notificationService
 * @description Comprehensive notification service providing:
 * - Multi-tier notification system (toast, desktop, in-app panel)
 * - Priority-based delivery (low, normal, high, urgent)
 * - Automatic grouping (3+ similar → collapsed group with count)
 * - Action buttons (Undo, View, Open, Dismiss with callbacks)
 * - Desktop Notifications API integration with permission management
 * - Audio feedback with priority-based frequencies
 * - Auto-dismiss with configurable durations
 * - Read/unread tracking for notification panel
 * - Persistent storage via localStorage
 * - Real-time listener subscriptions
 * 
 * @architecture
 * - Pattern: Singleton + Observer (pub/sub)
 * - Storage: In-memory array with localStorage persistence
 * - Listeners: Set-based subscription management
 * - Grouping: Map-based aggregation by groupKey
 * - Desktop API: Browser Notification API with permission flow
 * 
 * @performance
 * - Notification limit: configurable (default 20× NOTIFICATION_MAX_DISPLAY)
 * - Auto-eviction: oldest notifications removed when limit exceeded
 * - Grouping threshold: 3+ notifications → single group entry
 * - Efficient sorting: O(n log n) on grouped results only
 * 
 * @security
 * - Desktop permission: requested on init (user consent required)
 * - XSS prevention: notification content should be sanitized before display
 * - Action callbacks: executed in user context (no elevation)
 * - LocalStorage: preferences only (no sensitive data)
 * 
 * @usage
 * ```typescript
 * // Initialize on app startup
 * await NotificationService.init();
 * 
 * // Show notifications
 * notify.success('Saved', 'Document saved successfully');
 * notify.error('Failed', 'Upload failed', { desktop: true });
 * notify.withUndo('Deleted', 'Item deleted', () => restoreItem());
 * 
 * // Subscribe to updates
 * const unsubscribe = NotificationService.subscribe(notifications => {
 *   console.log(`${notifications.length} notifications`);
 * });
 * 
 * // Cleanup
 * unsubscribe();
 * ```
 */

// UUID generation inline
function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

import { NOTIFICATION_MAX_DISPLAY } from '@/config/master.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Notification priority levels
 * Determines visual styling, sound frequency, and desktop behavior
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification types aligned with semantic colors
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Action button configuration for interactive notifications
 */
export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * Core notification entity
 */
export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: number;
  duration?: number; // Auto-dismiss after ms (0 = persistent)
  actions?: NotificationAction[];
  groupKey?: string; // For grouping similar notifications
  icon?: string;
  sound?: boolean;
  desktop?: boolean; // Show desktop notification
  read?: boolean;
}

/**
 * Grouped notification container (3+ similar notifications)
 */
export interface NotificationGroup {
  groupKey: string;
  notifications: Notification[];
  count: number;
  latestTimestamp: number;
  collapsed: boolean;
}

/**
 * Listener callback signature
 */
type NotificationListener = (notifications: Notification[]) => void;

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

/**
 * NotificationServiceClass
 * Singleton service managing notification lifecycle and delivery
 */
class NotificationServiceClass {
  private notifications: Notification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private soundEnabled: boolean = true;
  private desktopEnabled: boolean = false;
  private maxNotifications: number = NOTIFICATION_MAX_DISPLAY * 20;
  private initialized: boolean = false;
  private autoDismissTimers: Map<string, NodeJS.Timeout> = new Map();
  private desktopNotifications: Map<string, globalThis.Notification> = new Map();

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  /**
   * Initialize notification service
   * Requests desktop permission and loads user preferences
   * 
   * @returns Promise<void>
   * @throws Error if initialization fails
   * 
   * @example
   * await NotificationService.init();
   */
  async init(): Promise<void> {
    try {
      // Request desktop notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.desktopEnabled = permission === 'granted';
        console.log(`[NotificationService] Desktop notifications: ${permission}`);
      }

      // Load preferences from localStorage
      try {
        const soundPref = localStorage.getItem('notification_sound');
        if (soundPref !== null) {
          this.soundEnabled = soundPref === 'true';
        }
      } catch (error) {
        console.warn('[NotificationService] Failed to load preferences:', error);
      }

      this.initialized = true;
      console.log('[NotificationService] Initialized successfully');
    } catch (error) {
      console.error('[NotificationService.init] Error:', error);
      throw error;
    }
  }

  // =============================================================================
  // VALIDATION (Private)
  // =============================================================================

  /**
   * Validate notification object
   * @private
   */
  private validateNotification(notification: Partial<Notification>, methodName: string): void {
    if (!notification.title || false) {
      throw new Error(`[NotificationService.${methodName}] Invalid title parameter`);
    }
    if (notification.type && !['info', 'success', 'warning', 'error'].includes(notification.type)) {
      throw new Error(`[NotificationService.${methodName}] Invalid type parameter`);
    }
    if (notification.priority && !['low', 'normal', 'high', 'urgent'].includes(notification.priority)) {
      throw new Error(`[NotificationService.${methodName}] Invalid priority parameter`);
    }
  }

  /**
   * Validate notification ID
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || false) {
      throw new Error(`[NotificationService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate priority parameter
   * @private
   */
  private validatePriority(priority: NotificationPriority, methodName: string): void {
    if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
      throw new Error(`[NotificationService.${methodName}] Invalid priority parameter`);
    }
  }

  // =============================================================================
  // NOTIFICATION MANAGEMENT
  // =============================================================================

  /**
   * Add new notification to system
   * Handles sound, desktop notifications, and auto-dismiss
   * 
   * @param notification - Notification configuration without id/timestamp/read
   * @returns string - Generated notification ID
   * @throws Error if validation fails
   */
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    try {
      this.validateNotification(notification, 'add');

      const id = generateId();
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
        read: false,
      };

      // Add to array (newest first)
      this.notifications.unshift(newNotification);

      // Enforce limit (evict oldest)
      if (this.notifications.length > this.maxNotifications) {
        this.notifications = this.notifications.slice(0, this.maxNotifications);
        console.debug(`[NotificationService] Evicted old notifications (limit: ${this.maxNotifications})`);
      }

      // Play sound if enabled
      if (notification.sound !== false && this.soundEnabled) {
        this.playSound(notification.priority);
      }

      // Show desktop notification if enabled
      if (notification.desktop && this.desktopEnabled) {
        this.showDesktopNotification(newNotification);
      }

      // Notify listeners
      this.notifyListeners();

      // Auto-dismiss if duration is set
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          this.remove(id);
          this.autoDismissTimers.delete(id);
        }, notification.duration);
        this.autoDismissTimers.set(id, timer);
      }

      return id;
    } catch (error) {
      console.error('[NotificationService.add] Error:', error);
      throw error;
    }
  }

  /**
   * Remove notification by ID
   *
   * @param id - Notification ID
   * @throws Error if validation fails
   */
  remove(id: string): void {
    try {
      this.validateId(id, 'remove');
      const before = this.notifications.length;
      this.notifications = this.notifications.filter(n => n.id !== id);

      // Clear auto-dismiss timer if exists
      const timer = this.autoDismissTimers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.autoDismissTimers.delete(id);
      }

      // Close desktop notification if exists
      const desktopNotif = this.desktopNotifications.get(id);
      if (desktopNotif) {
        desktopNotif.close();
        this.desktopNotifications.delete(id);
      }

      if (this.notifications.length < before) {
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[NotificationService.remove] Error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * 
   * @param id - Notification ID
   * @throws Error if validation fails
   */
  markAsRead(id: string): void {
    try {
      this.validateId(id, 'markAsRead');
      const notification = this.notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[NotificationService.markAsRead] Error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    try {
      let changed = false;
      this.notifications.forEach(n => {
        if (!n.read) {
          n.read = true;
          changed = true;
        }
      });
      if (changed) {
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[NotificationService.markAllAsRead] Error:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    try {
      const count = this.notifications.length;
      this.notifications = [];

      // Clear all auto-dismiss timers
      this.autoDismissTimers.forEach(timer => clearTimeout(timer));
      this.autoDismissTimers.clear();

      // Close all desktop notifications
      this.desktopNotifications.forEach(notif => notif.close());
      this.desktopNotifications.clear();

      if (count > 0) {
        this.notifyListeners();
        console.log(`[NotificationService] Cleared ${count} notifications`);
      }
    } catch (error) {
      console.error('[NotificationService.clearAll] Error:', error);
      throw error;
    }
  }

  // =============================================================================
  // QUERIES
  // =============================================================================

  /**
   * Get all notifications
   * 
   * @returns Notification[] - Copy of notification array
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notification count
   * 
   * @returns number - Count of unread notifications
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Get grouped notifications
   * Groups 3+ similar notifications by groupKey
   * 
   * @returns (Notification | NotificationGroup)[] - Sorted array with groups
   */
  getGrouped(): (Notification | NotificationGroup)[] {
    try {
      const groups = new Map<string, Notification[]>();
      const ungrouped: Notification[] = [];

      // Group notifications by groupKey
      this.notifications.forEach(notification => {
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
            latestTimestamp: Math.max(...notifications.map(n => n.timestamp)),
            collapsed: true,
          });
        } else {
          // Add individually
          result.push(...notifications);
        }
      });

      // Sort by timestamp (newest first)
      return result.sort((a, b) => {
        const aTime = 'latestTimestamp' in a ? a.latestTimestamp : a.timestamp;
        const bTime = 'latestTimestamp' in b ? b.latestTimestamp : b.timestamp;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('[NotificationService.getGrouped] Error:', error);
      return [];
    }
  }

  // =============================================================================
  // SUBSCRIPTIONS
  // =============================================================================

  /**
   * Subscribe to notification updates
   * 
   * @param listener - Callback receiving notification array
   * @returns () => void - Unsubscribe function
   * @throws Error if validation fails
   */
  subscribe(listener: NotificationListener): () => void {
    if (typeof listener !== 'function') {
      throw new Error('[NotificationService.subscribe] Listener must be a function');
    }
    try {
      this.listeners.add(listener);
      listener(this.notifications);

      // Return unsubscribe function
      return () => {
        this.listeners.delete(listener);
      };
    } catch (error) {
      console.error('[NotificationService.subscribe] Error:', error);
      throw error;
    }
  }

  // =============================================================================
  // PREFERENCES
  // =============================================================================

  /**
   * Enable/disable sound notifications
   * 
   * @param enabled - Sound enabled state
   */
  setSoundEnabled(enabled: boolean): void {
    try {
      this.soundEnabled = enabled;
      localStorage.setItem('notification_sound', String(enabled));
      console.log(`[NotificationService] Sound: ${enabled}`);
    } catch (error) {
      console.warn('[NotificationService.setSoundEnabled] Failed to save preference:', error);
    }
  }

  /**
   * Get sound enabled state
   * 
   * @returns boolean - Sound enabled state
   */
  getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Get desktop notification enabled state
   * 
   * @returns boolean - Desktop enabled state
   */
  getDesktopEnabled(): boolean {
    return this.desktopEnabled;
  }

  /**
   * Get initialization state
   * 
   * @returns boolean - Initialization complete
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  // =============================================================================
  // AUDIO & DESKTOP (Private)
  // =============================================================================

  /**
   * Play notification sound with priority-based frequency
   * @private
   */
  private playSound(priority: NotificationPriority): void {
    try {
      this.validatePriority(priority, 'playSound');
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different priorities
      const frequencies: Record<NotificationPriority, number> = {
        low: 440,     // A4
        normal: 523,  // C5
        high: 659,    // E5
        urgent: 880,  // A5
      };

      oscillator.frequency.value = frequencies[priority];
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('[NotificationService.playSound] Error:', error);
    }
  }

  /**
   * Show desktop notification via Browser API
   * @private
   */
  private showDesktopNotification(notification: Notification): void {
    if (!this.desktopEnabled || !('Notification' in window)) return;

    try {
      const desktopNotification = new globalThis.Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });

      // Track desktop notification for cleanup
      this.desktopNotifications.set(notification.id, desktopNotification);

      desktopNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        desktopNotification.close();
        this.desktopNotifications.delete(notification.id);
      };

      desktopNotification.onclose = () => {
        this.desktopNotifications.delete(notification.id);
      };
    } catch (error) {
      console.warn('[NotificationService.showDesktopNotification] Error:', error);
    }
  }

  /**
   * Notify all listeners of state change
   * @private
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.notifications);
      } catch (error) {
        console.error('[NotificationService.notifyListeners] Listener error:', error);
      }
    });
  }

  /**
   * Dispose of the notification service and cleanup all resources
   * Call this when shutting down to prevent memory leaks
   */
  dispose(): void {
    console.log('[NotificationService] Disposing and cleaning up resources');

    // Clear all auto-dismiss timers
    this.autoDismissTimers.forEach(timer => clearTimeout(timer));
    this.autoDismissTimers.clear();

    // Close all desktop notifications
    this.desktopNotifications.forEach(notif => {
      try {
        notif.close();
      } catch (error) {
        console.warn('[NotificationService] Error closing desktop notification:', error);
      }
    });
    this.desktopNotifications.clear();

    // Clear all listeners
    this.listeners.clear();

    // Clear all notifications
    this.notifications = [];

    this.initialized = false;
  }
}

// Export singleton instance
export const NotificationService = new NotificationServiceClass();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

import { NOTIFICATION_SUCCESS_DISMISS_MS, NOTIFICATION_AUTO_DISMISS_MS } from '@/config/master.config';

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
  info: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'info',
      priority: 'normal',
      ...options,
    });
  },

  /**
   * Success notification (normal priority, auto-dismiss)
   */
  success: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'success',
      priority: 'normal',
      duration: NOTIFICATION_SUCCESS_DISMISS_MS,
      ...options,
    });
  },

  /**
   * Warning notification (high priority, auto-dismiss)
   */
  warning: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'warning',
      priority: 'high',
      duration: NOTIFICATION_AUTO_DISMISS_MS,
      ...options,
    });
  },

  /**
   * Error notification (urgent priority, persistent)
   */
  error: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'error',
      priority: 'urgent',
      duration: 0, // Persistent
      ...options,
    });
  },

  /**
   * Notification with Undo action (success type, 5s duration)
   */
  withUndo: (title: string, message: string, onUndo: () => void, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'success',
      priority: 'normal',
      duration: 5000,
      actions: [
        {
          label: 'Undo',
          onClick: onUndo,
          variant: 'primary',
        },
      ],
      ...options,
    });
  },
};

export default NotificationService;

