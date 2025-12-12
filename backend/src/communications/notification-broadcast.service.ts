import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationType {
  CASE_UPDATE = 'case_update',
  DOCUMENT_SHARED = 'document_shared',
  COMMENT_MENTION = 'comment_mention',
  DEADLINE_REMINDER = 'deadline_reminder',
  TASK_ASSIGNED = 'task_assigned',
  SYSTEM_ALERT = 'system_alert',
  MESSAGE = 'message',
  COLLABORATION_INVITE = 'collaboration_invite',
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  actionText?: string;
  userId: string;
  createdAt: Date;
  expiresAt?: Date;
  read: boolean;
}

export interface BroadcastOptions {
  userIds?: string[];
  roles?: string[];
  caseId?: string;
  organizationId?: string;
  excludeUserIds?: string[];
  persistent?: boolean;
  expiresIn?: number; // milliseconds
}

@Injectable()
export class NotificationBroadcastService {
  private readonly logger = new Logger(NotificationBroadcastService.name);
  private servers = new Map<string, Server>(); // namespace -> server
  private notificationQueue: Notification[] = [];
  private persistentNotifications = new Map<string, Notification[]>(); // userId -> notifications

  registerServer(namespace: string, server: Server) {
    this.servers.set(namespace, server);
    this.logger.log(`Registered server for namespace: ${namespace}`);
  }

  /**
   * Broadcast notification to specific users
   */
  async broadcastToUsers(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
    options?: { persistent?: boolean; expiresIn?: number },
  ): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      read: false,
    };

    if (options?.expiresIn) {
      fullNotification.expiresAt = new Date(
        Date.now() + options.expiresIn,
      );
    }

    // Store persistent notifications
    if (options?.persistent) {
      userIds.forEach((userId) => {
        if (!this.persistentNotifications.has(userId)) {
          this.persistentNotifications.set(userId, []);
        }
        this.persistentNotifications.get(userId)!.push(fullNotification);
      });
    }

    // Broadcast via WebSocket
    const server = this.getServer('notifications');
    if (server) {
      userIds.forEach((userId) => {
        server.to(`user:${userId}`).emit('notification:new', fullNotification);
      });
    }

    this.logger.log(
      `Broadcasted ${notification.type} notification to ${userIds.length} users`,
    );
  }

  /**
   * Broadcast notification to all users in a case
   */
  async broadcastToCase(
    caseId: string,
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'read'>,
    options?: BroadcastOptions,
  ): Promise<void> {
    const server = this.getServer('notifications');
    if (!server) {
      this.logger.warn('No notification server registered');
      return;
    }

    const fullNotification = {
      ...notification,
      id: this.generateId(),
      userId: '', // Will be set per user
      createdAt: new Date(),
      read: false,
    };

    // Emit to case room
    server.to(`case:${caseId}`).emit('notification:new', fullNotification);

    this.logger.log(
      `Broadcasted ${notification.type} notification to case ${caseId}`,
    );
  }

  /**
   * Broadcast urgent alert
   */
  async broadcastUrgentAlert(
    notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'priority'>,
    options: BroadcastOptions,
  ): Promise<void> {
    const urgentNotification: Notification = {
      ...notification,
      id: this.generateId(),
      priority: NotificationPriority.URGENT,
      createdAt: new Date(),
      read: false,
    };

    if (options.userIds) {
      await this.broadcastToUsers(options.userIds, urgentNotification, {
        persistent: true,
      });
    }

    // Also send system-wide alert
    const server = this.getServer('notifications');
    if (server) {
      server.emit('notification:urgent', urgentNotification);
    }

    this.logger.warn(`Broadcasted URGENT alert: ${notification.title}`);
  }

  /**
   * Broadcast to organization
   */
  async broadcastToOrganization(
    organizationId: string,
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'read'>,
    options?: BroadcastOptions,
  ): Promise<void> {
    const server = this.getServer('notifications');
    if (!server) {
      return;
    }

    const fullNotification = {
      ...notification,
      id: this.generateId(),
      userId: '',
      createdAt: new Date(),
      read: false,
    };

    server
      .to(`org:${organizationId}`)
      .emit('notification:new', fullNotification);

    this.logger.log(
      `Broadcasted notification to organization ${organizationId}`,
    );
  }

  /**
   * Broadcast to role
   */
  async broadcastToRole(
    role: string,
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'read'>,
    organizationId?: string,
  ): Promise<void> {
    const server = this.getServer('notifications');
    if (!server) {
      return;
    }

    const fullNotification = {
      ...notification,
      id: this.generateId(),
      userId: '',
      createdAt: new Date(),
      read: false,
    };

    const room = organizationId
      ? `role:${organizationId}:${role}`
      : `role:${role}`;

    server.to(room).emit('notification:new', fullNotification);

    this.logger.log(`Broadcasted notification to role ${role}`);
  }

  /**
   * Send system-wide announcement
   */
  async broadcastSystemAnnouncement(
    announcement: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'read' | 'type'>,
    options?: { persistent?: boolean; expiresIn?: number },
  ): Promise<void> {
    const server = this.getServer('notifications');
    if (!server) {
      return;
    }

    const notification: Notification = {
      ...announcement,
      type: NotificationType.SYSTEM_ALERT,
      id: this.generateId(),
      userId: '',
      createdAt: new Date(),
      read: false,
    };

    if (options?.expiresIn) {
      notification.expiresAt = new Date(Date.now() + options.expiresIn);
    }

    // Broadcast to all connected clients
    server.emit('notification:announcement', notification);

    this.logger.log(`Broadcasted system announcement: ${announcement.title}`);
  }

  /**
   * Get pending notifications for user
   */
  getPendingNotifications(userId: string): Notification[] {
    const notifications = this.persistentNotifications.get(userId) || [];

    // Filter out expired notifications
    const now = Date.now();
    const valid = notifications.filter(
      (n) => !n.expiresAt || n.expiresAt.getTime() > now,
    );

    this.persistentNotifications.set(userId, valid);

    return valid.filter((n) => !n.read);
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): void {
    const notifications = this.persistentNotifications.get(userId);
    if (!notifications) {
      return;
    }

    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead(userId: string): void {
    const notifications = this.persistentNotifications.get(userId);
    if (notifications) {
      notifications.forEach((n) => (n.read = true));
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(userId: string, notificationId: string): void {
    const notifications = this.persistentNotifications.get(userId);
    if (!notifications) {
      return;
    }

    const filtered = notifications.filter((n) => n.id !== notificationId);
    this.persistentNotifications.set(userId, filtered);
  }

  /**
   * Clear all notifications for user
   */
  clearAllNotifications(userId: string): void {
    this.persistentNotifications.delete(userId);
  }

  /**
   * Get notification counts
   */
  getNotificationCounts(userId: string): {
    total: number;
    unread: number;
    byPriority: Record<NotificationPriority, number>;
  } {
    const notifications = this.getPendingNotifications(userId);
    const unread = notifications.filter((n) => !n.read);

    const byPriority = {
      [NotificationPriority.LOW]: 0,
      [NotificationPriority.NORMAL]: 0,
      [NotificationPriority.HIGH]: 0,
      [NotificationPriority.URGENT]: 0,
    };

    unread.forEach((n) => {
      byPriority[n.priority]++;
    });

    return {
      total: notifications.length,
      unread: unread.length,
      byPriority,
    };
  }

  /**
   * Schedule notification for later
   */
  scheduleNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
    userIds: string[],
    delay: number,
  ): void {
    setTimeout(() => {
      this.broadcastToUsers(userIds, notification, { persistent: true });
    }, delay);

    this.logger.log(
      `Scheduled notification for ${userIds.length} users in ${delay}ms`,
    );
  }

  private getServer(namespace: string): Server | undefined {
    return this.servers.get(namespace);
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up expired notifications (should be called periodically)
   */
  cleanupExpiredNotifications(): void {
    const now = Date.now();
    let cleanedCount = 0;

    this.persistentNotifications.forEach((notifications, userId) => {
      const valid = notifications.filter(
        (n) => !n.expiresAt || n.expiresAt.getTime() > now,
      );

      cleanedCount += notifications.length - valid.length;

      if (valid.length === 0) {
        this.persistentNotifications.delete(userId);
      } else {
        this.persistentNotifications.set(userId, valid);
      }
    });

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired notifications`);
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalUsers: number;
    totalNotifications: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalNotifications = 0;

    this.persistentNotifications.forEach((notifications) => {
      totalNotifications += notifications.length;

      notifications.forEach((n) => {
        byType[n.type] = (byType[n.type] || 0) + 1;
        byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
      });
    });

    return {
      totalUsers: this.persistentNotifications.size,
      totalNotifications,
      byType,
      byPriority,
    };
  }
}
