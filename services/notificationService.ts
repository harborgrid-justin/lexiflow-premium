import { WebSocketService, websocketManager } from './websocketService';

/**
 * Notification Service
 *
 * Manages real-time notifications using WebSocket
 * Provides methods for receiving notifications, managing preferences, and handling push notifications
 */

export type NotificationType =
  | 'case_update'
  | 'document_upload'
  | 'deadline_reminder'
  | 'task_assignment'
  | 'message'
  | 'invoice'
  | 'system'
  | 'alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  caseUpdates: boolean;
  documentUploads: boolean;
  deadlineReminders: boolean;
  taskAssignments: boolean;
  messages: boolean;
  invoices: boolean;
}

export type NotificationEventHandler<T = any> = (data: T) => void;

class NotificationService {
  private ws: WebSocketService | null = null;
  private notificationHandlers: Set<NotificationEventHandler<Notification>> = new Set();
  private countHandlers: Set<NotificationEventHandler<number>> = new Set();
  private preferencesHandlers: Set<NotificationEventHandler<NotificationPreferences>> = new Set();
  private currentUserId: string | null = null;
  private unreadCount: number = 0;

  /**
   * Initialize notification service
   */
  async initialize(config: { apiUrl: string; token?: string; userId?: string }): Promise<void> {
    this.currentUserId = config.userId || null;

    // Create WebSocket connection for notifications
    this.ws = websocketManager.getConnection('notifications', {
      url: config.apiUrl,
      namespace: '/notifications',
      auth: {
        token: config.token,
        userId: config.userId,
      },
      autoConnect: true,
    });

    this.ws.connect();
    this.setupEventHandlers();

    // Wait for connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      const unsubscribe = this.ws!.onStatusChange((status) => {
        if (status === 'connected') {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        } else if (status === 'error') {
          clearTimeout(timeout);
          unsubscribe();
          reject(new Error('Connection failed'));
        }
      });
    });
  }

  /**
   * Disconnect from notification service
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    if (!this.ws) throw new Error('Notification service not initialized');

    await this.ws.emitWithAck('notification:mark_read', { notificationId });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    if (!this.ws) throw new Error('Notification service not initialized');

    await this.ws.emitWithAck('notification:mark_all_read', {});
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    if (!this.ws) throw new Error('Notification service not initialized');

    await this.ws.emitWithAck('notification:delete', { notificationId });
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    if (!this.ws) throw new Error('Notification service not initialized');

    await this.ws.emitWithAck('notification:preferences:update', { preferences });
  }

  /**
   * Get current unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Request browser push notification permission
   */
  async requestPushPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support push notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Show browser push notification
   */
  showPushNotification(notification: Notification): void {
    if (!('Notification' in window)) {
      console.warn('Browser does not support push notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        data: {
          url: notification.actionUrl,
          notificationId: notification.id,
        },
      };

      const browserNotification = new Notification(notification.title, options);

      browserNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }

        browserNotification.close();
      };
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound(priority: NotificationPriority = 'normal'): void {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = priority === 'urgent' ? 1.0 : 0.5;
      audio.play().catch((error) => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  /**
   * Subscribe to new notifications
   */
  onNotification(handler: NotificationEventHandler<Notification>): () => void {
    this.notificationHandlers.add(handler);
    return () => {
      this.notificationHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to unread count changes
   */
  onCountChange(handler: NotificationEventHandler<number>): () => void {
    this.countHandlers.add(handler);
    // Immediately call with current count
    handler(this.unreadCount);
    return () => {
      this.countHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to preferences changes
   */
  onPreferencesChange(handler: NotificationEventHandler<NotificationPreferences>): () => void {
    this.preferencesHandlers.add(handler);
    return () => {
      this.preferencesHandlers.delete(handler);
    };
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    // New notification
    this.ws.on('notification:new', (notification: Notification) => {
      console.log('[NotificationService] New notification:', notification);

      // Update handlers
      this.notificationHandlers.forEach((handler) => {
        try {
          handler(notification);
        } catch (error) {
          console.error('[NotificationService] Error in notification handler:', error);
        }
      });

      // Show push notification if enabled
      if (notification.priority && ['high', 'urgent'].includes(notification.priority)) {
        this.showPushNotification(notification);
        this.playNotificationSound(notification.priority);
      }

      // Increment unread count
      this.incrementUnreadCount();
    });

    // Notification marked as read
    this.ws.on('notification:read', (data: { notificationId: string; readAt: string }) => {
      console.log('[NotificationService] Notification marked as read:', data.notificationId);
      this.decrementUnreadCount();
    });

    // All notifications marked as read
    this.ws.on('notification:all_read', () => {
      console.log('[NotificationService] All notifications marked as read');
      this.setUnreadCount(0);
    });

    // Notification deleted
    this.ws.on('notification:deleted', (data: { notificationId: string }) => {
      console.log('[NotificationService] Notification deleted:', data.notificationId);
    });

    // Unread count update
    this.ws.on('notification:count', (data: { count: number }) => {
      console.log('[NotificationService] Unread count:', data.count);
      this.setUnreadCount(data.count);
    });

    // Count needs update (fetch from API)
    this.ws.on('notification:count:update', () => {
      // In production, fetch count from REST API
      console.log('[NotificationService] Count update requested');
    });

    // Preferences updated
    this.ws.on(
      'notification:preferences:updated',
      (data: { preferences: NotificationPreferences }) => {
        console.log('[NotificationService] Preferences updated:', data.preferences);

        this.preferencesHandlers.forEach((handler) => {
          try {
            handler(data.preferences);
          } catch (error) {
            console.error('[NotificationService] Error in preferences handler:', error);
          }
        });
      },
    );
  }

  /**
   * Set unread count
   */
  private setUnreadCount(count: number): void {
    this.unreadCount = count;
    this.notifyCountChange();
  }

  /**
   * Increment unread count
   */
  private incrementUnreadCount(): void {
    this.unreadCount++;
    this.notifyCountChange();
  }

  /**
   * Decrement unread count
   */
  private decrementUnreadCount(): void {
    if (this.unreadCount > 0) {
      this.unreadCount--;
      this.notifyCountChange();
    }
  }

  /**
   * Notify count change handlers
   */
  private notifyCountChange(): void {
    this.countHandlers.forEach((handler) => {
      try {
        handler(this.unreadCount);
      } catch (error) {
        console.error('[NotificationService] Error in count handler:', error);
      }
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.isConnected() || false;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default notificationService;
