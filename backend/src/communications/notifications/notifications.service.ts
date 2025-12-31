import { Injectable, Logger, NotFoundException, ForbiddenException, OnModuleDestroy } from '@nestjs/common';
import {
  CreateNotificationDto,
  NotificationPreferencesDto,
  NotificationQueryDto,
} from './dto';

/**
 * Notifications Service
 *
 * Manages system and user notifications including:
 * - Creating and sending notifications
 * - Managing notification preferences
 * - Tracking read/unread status
 * - Filtering and pagination
 *
 * @class NotificationsService
 */
/**
 * ╔=================================================================================================================╗
 * ║NOTIFICATIONS                                                                                                    ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private notifications: Map<string, any> = new Map();
   
  private preferences: Map<string, NotificationPreferencesDto> = new Map();
  
  // Memory optimization
  private readonly MAX_NOTIFICATIONS = 10000;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private cleanupTimer: NodeJS.Timeout;

  constructor() {
    this.logger.log('NotificationsService initialized with in-memory storage');
    this.cleanupTimer = setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
    this.notifications.clear();
    this.preferences.clear();
    this.logger.log('NotificationsService destroyed, memory cleared');
  }

  private cleanup() {
    const now = Date.now();
    const TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    let removedCount = 0;

    // Remove old notifications
    for (const [id, notification] of this.notifications.entries()) {
      if (now - new Date(notification.createdAt).getTime() > TTL) {
        this.notifications.delete(id);
        removedCount++;
      }
    }
    
    // Enforce max size if still too large
    if (this.notifications.size > this.MAX_NOTIFICATIONS) {
      // Sort by date and remove oldest
      const sorted = Array.from(this.notifications.entries())
        .sort(([, a], [, b]) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            
      const toRemove = sorted.slice(0, this.notifications.size - this.MAX_NOTIFICATIONS);
      toRemove.forEach(([id]) => this.notifications.delete(id));
      removedCount += toRemove.length;
    }

    if (removedCount > 0) {
      this.logger.debug(`Cleanup: Removed ${removedCount} old notifications`);
    }
  }

  /**
   * Get all notifications for a user
   */
  async findAll(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, unreadOnly, type } = query;
    
    let userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);

    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    if (type) {
      userNotifications = userNotifications.filter(n => n.type === type);
    }

    userNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = userNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = userNotifications.slice(startIndex, endIndex);

    this.logger.debug(`Retrieved ${data.length} notifications for user ${userId} (page ${page}/${totalPages})`);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.read)
      .length;
    
    this.logger.debug(`User ${userId} has ${count} unread notifications`);
    return count;
  }

  /**
   * Create a new notification
   */
  async create(createDto: CreateNotificationDto) {
    const userPreferences = this.preferences.get(createDto.userId) || this.getDefaultPreferences();
    
    if (!this.shouldSendNotification(createDto.type, userPreferences)) {
      this.logger.debug(`Notification skipped due to user preferences: ${createDto.type}`);
      return null;
    }

    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...createDto,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notifications.set((notification as any).id, notification);
    
    // Quick check to avoid growing too large between cleanups
    if (this.notifications.size > this.MAX_NOTIFICATIONS + 100) {
      this.cleanup();
    }
    
    this.logger.log(`Notification created: ${(notification as any).id} for user ${createDto.userId}`);

    if (userPreferences.pushEnabled) {
      await this.sendPushNotification(notification);
    }
    if (userPreferences.emailEnabled) {
      await this.sendEmailNotification(notification);
    }

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this notification');
    }

    notification.read = true;
    notification.readAt = new Date();
    notification.updatedAt = new Date();
    this.notifications.set(notificationId, notification);

    this.logger.log(`Notification ${notificationId} marked as read by user ${userId}`);

    return {
      id: notificationId,
      read: true,
      readAt: notification.readAt,
    };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    let updated = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        notification.readAt = new Date();
        notification.updatedAt = new Date();
        this.notifications.set(id, notification);
        updated++;
      }
    }

    this.logger.log(`Marked ${updated} notifications as read for user ${userId}`);

    return {
      updated,
      message: `${updated} notification(s) marked as read`,
    };
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this notification');
    }

    this.notifications.delete(notificationId);
    this.logger.log(`Notification ${notificationId} deleted by user ${userId}`);

    return { 
      deleted: true,
      id: notificationId,
    };
  }

  /**
   * Get notification preferences for user
   */
  async getPreferences(userId: string): Promise<NotificationPreferencesDto> {
    let userPrefs = this.preferences.get(userId);
    
    if (!userPrefs) {
      userPrefs = this.getDefaultPreferences();
      this.preferences.set(userId, userPrefs);
      this.logger.debug(`Created default preferences for user ${userId}`);
    }

    return userPrefs;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferencesDto: NotificationPreferencesDto) {
    const updatedPrefs = {
      ...preferencesDto,
      updatedAt: new Date(),
    };

    this.preferences.set(userId, updatedPrefs);
    this.logger.log(`Updated notification preferences for user ${userId}`);

    return {
      userId,
      ...updatedPrefs,
    };
  }

  /**
   * Send bulk notifications
   * Used for system-wide alerts or team notifications
   */
  async sendBulk(userIds: string[], createDto: Omit<CreateNotificationDto, 'userId'>) {
    const createdNotifications = [];

    for (const userId of userIds) {
      const notification = await this.create({
        ...createDto,
        userId,
      });
      if (notification) {
        createdNotifications.push(notification);
      }
    }

    this.logger.log(`Bulk notification sent to ${createdNotifications.length}/${userIds.length} users`);

    return {
      sent: createdNotifications.length,
      skipped: userIds.length - createdNotifications.length,
      notifications: createdNotifications,
    };
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(): NotificationPreferencesDto {
    return {
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      caseUpdates: true,
      documentUploads: true,
      deadlineReminders: true,
      taskAssignments: true,
      messages: true,
      invoices: true,
    };
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(type: string, preferences: NotificationPreferencesDto): boolean {
    const typeMap: Record<string, keyof NotificationPreferencesDto> = {
      case_update: 'caseUpdates',
      document_upload: 'documentUploads',
      deadline_reminder: 'deadlineReminders',
      task_assignment: 'taskAssignments',
      message: 'messages',
      invoice: 'invoices',
    };

    const prefKey = typeMap[type];
    return prefKey ? preferences[prefKey] === true : true;
  }

  /**
   * Send push notification (placeholder for actual implementation)
   */
  private async sendPushNotification(notification: unknown): Promise<void> {
    this.logger.debug(`Push notification would be sent: ${(notification as any).id}`);
  }

  /**
   * Send email notification (placeholder for actual implementation)
   */
  private async sendEmailNotification(notification: unknown): Promise<void> {
    this.logger.debug(`Email notification would be sent: ${(notification as any).id}`);
  }
}
