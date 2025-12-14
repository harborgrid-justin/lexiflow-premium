/**
 * @module services/notificationService
 * @category Services
 * @description Enhanced notification service with grouping, priority, and action buttons.
 * 
 * FEATURES:
 * - Notification grouping (3+ similar → "5 new emails")
 * - Priority levels (urgent, deadline, FYI)
 * - Action buttons (Undo, View, Open, Dismiss)
 * - Desktop notifications API integration
 * - Sound alerts (optional)
 * - Persistent notification panel
 */

// UUID generation inline
function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

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

export interface NotificationGroup {
  groupKey: string;
  notifications: Notification[];
  count: number;
  latestTimestamp: number;
  collapsed: boolean;
}

type NotificationListener = (notifications: Notification[]) => void;

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationServiceClass {
  private notifications: Notification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private soundEnabled: boolean = true;
  private desktopEnabled: boolean = false;
  private maxNotifications: number = 100;

  /**
   * Initialize service
   */
  async init(): Promise<void> {
    // Request desktop notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.desktopEnabled = permission === 'granted';
    }

    // Load preferences from localStorage
    try {
      const soundPref = localStorage.getItem('notification_sound');
      if (soundPref !== null) {
        this.soundEnabled = soundPref === 'true';
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Add notification
   */
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    };

    // Add to array
    this.notifications.unshift(newNotification);

    // Limit total notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
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
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  /**
   * Remove notification
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Mark as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Get grouped notifications
   */
  getGrouped(): (Notification | NotificationGroup)[] {
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
        // Create group
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

    // Sort by timestamp
    return result.sort((a, b) => {
      const aTime = 'latestTimestamp' in a ? a.latestTimestamp : a.timestamp;
      const bTime = 'latestTimestamp' in b ? b.latestTimestamp : b.timestamp;
      return bTime - aTime;
    });
  }

  /**
   * Subscribe to notifications
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.notifications);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Set sound enabled
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('notification_sound', String(enabled));
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Get sound enabled
   */
  getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Play notification sound
   */
  private playSound(priority: NotificationPriority): void {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different priorities
      const frequencies: Record<NotificationPriority, number> = {
        low: 440,
        normal: 523,
        high: 659,
        urgent: 880,
      };

      oscillator.frequency.value = frequencies[priority];
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      console.warn('Failed to play notification sound:', err);
    }
  }

  /**
   * Show desktop notification
   */
  private showDesktopNotification(notification: Notification): void {
    if (!this.desktopEnabled || !('Notification' in window)) return;

    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
      });

      desktopNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        desktopNotification.close();
      };
    } catch (err) {
      console.warn('Failed to show desktop notification:', err);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.notifications);
    });
  }
}

// Export singleton instance
export const NotificationService = new NotificationServiceClass();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const notify = {
  info: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'info',
      priority: 'normal',
      ...options,
    });
  },

  success: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'success',
      priority: 'normal',
      duration: 3000,
      ...options,
    });
  },

  warning: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'type' | 'read'>>) => {
    return NotificationService.add({
      title,
      message,
      type: 'warning',
      priority: 'high',
      duration: 5000,
      ...options,
    });
  },

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

  withUndo: (title: string, message: string, onUndo: () => void, options?: Partial<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
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
