import { Injectable, Logger } from '@nestjs/common';

export interface NotificationPayload {
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
}

/**
 * NotificationRulesService
 * Manages notification delivery for workflow events
 */
@Injectable()
export class NotificationRulesService {
  private readonly logger = new Logger(NotificationRulesService.name);

  /**
   * Send notification to user
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    this.logger.log(`Sending ${payload.type} notification to user ${payload.userId}: ${payload.title}`);

    try {
      // In a real implementation, this would:
      // 1. Check user notification preferences
      // 2. Send via appropriate channels (in-app, email, SMS, push)
      // 3. Store notification in database
      // 4. Track delivery status

      // For now, just log it
      this.logger.debug(`Notification payload: ${JSON.stringify(payload)}`);

      // Simulate notification delivery
      await this.deliverInAppNotification(payload);
      await this.deliverEmailNotification(payload);
    } catch (error: any) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<void> {
    this.logger.log(`Sending ${notifications.length} bulk notifications`);

    const promises = notifications.map((n) => this.sendNotification(n));
    await Promise.allSettled(promises);
  }

  /**
   * Send notification to multiple users
   */
  async sendToMultipleUsers(
    userIds: string[],
    notification: Omit<NotificationPayload, 'userId'>,
  ): Promise<void> {
    const notifications = userIds.map((userId) => ({
      ...notification,
      userId,
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Send notification to role
   */
  async sendToRole(
    tenantId: string,
    role: string,
    notification: Omit<NotificationPayload, 'userId' | 'tenantId'>,
  ): Promise<void> {
    this.logger.log(`Sending notification to role ${role} in tenant ${tenantId}`);

    // In a real implementation, query users with the specified role
    // const users = await this.getUsersByRole(tenantId, role);
    // await this.sendToMultipleUsers(users.map(u => u.id), { ...notification, tenantId });

    // For now, just log it
    this.logger.debug(`Would send notification to role ${role}`);
  }

  /**
   * Deliver in-app notification
   */
  private async deliverInAppNotification(payload: NotificationPayload): Promise<void> {
    // In a real implementation:
    // - Store in notifications table
    // - Send via WebSocket to connected clients
    // - Update unread count

    this.logger.debug(`In-app notification delivered to ${payload.userId}`);
  }

  /**
   * Deliver email notification
   */
  private async deliverEmailNotification(payload: NotificationPayload): Promise<void> {
    // In a real implementation:
    // - Check user email preferences
    // - Format email template
    // - Send via email service (SendGrid, AWS SES, etc.)

    this.logger.debug(`Email notification queued for ${payload.userId}`);
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<Record<string, any>> {
    // In a real implementation, fetch from database
    return {
      inApp: true,
      email: true,
      sms: false,
      push: true,
    };
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(userId: string, preferences: Record<string, any>): Promise<void> {
    // In a real implementation, update in database
    this.logger.log(`Updated notification preferences for user ${userId}`);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // In a real implementation, update notification status
    this.logger.debug(`Marked notification ${notificationId} as read`);
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<void> {
    // In a real implementation, bulk update notifications
    this.logger.debug(`Marked all notifications as read for user ${userId}`);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    // In a real implementation, count unread notifications
    return 0;
  }

  /**
   * Get notifications for user
   */
  async getNotifications(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<any[]> {
    // In a real implementation, fetch from database with pagination
    return [];
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    // In a real implementation, soft delete notification
    this.logger.debug(`Deleted notification ${notificationId}`);
  }

  /**
   * Send workflow notification
   */
  async sendWorkflowNotification(
    tenantId: string,
    userId: string,
    workflowName: string,
    status: string,
    message?: string,
  ): Promise<void> {
    const typeMap: Record<string, NotificationPayload['type']> = {
      started: 'info',
      completed: 'success',
      failed: 'error',
      paused: 'warning',
    };

    await this.sendNotification({
      tenantId,
      userId,
      title: `Workflow ${status}`,
      message: message || `Workflow "${workflowName}" has ${status}`,
      type: typeMap[status] || 'info',
      metadata: { workflowName, status },
    });
  }

  /**
   * Send approval notification
   */
  async sendApprovalNotification(
    tenantId: string,
    userId: string,
    itemName: string,
    actionUrl?: string,
  ): Promise<void> {
    await this.sendNotification({
      tenantId,
      userId,
      title: 'Approval Required',
      message: `Your approval is required for "${itemName}"`,
      type: 'info',
      actionUrl,
      actionText: 'Review',
    });
  }

  /**
   * Send deadline notification
   */
  async sendDeadlineNotification(
    tenantId: string,
    userId: string,
    taskName: string,
    deadline: Date,
  ): Promise<void> {
    const now = new Date();
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    let urgency: NotificationPayload['type'] = 'info';
    if (hoursUntilDeadline < 24) urgency = 'warning';
    if (hoursUntilDeadline < 2) urgency = 'error';

    await this.sendNotification({
      tenantId,
      userId,
      title: 'Upcoming Deadline',
      message: `Task "${taskName}" is due ${this.formatDeadline(deadline)}`,
      type: urgency,
      metadata: { taskName, deadline },
    });
  }

  /**
   * Format deadline for display
   */
  private formatDeadline(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 0) return 'overdue';
    if (hours === 0) return `in ${minutes} minutes`;
    if (hours < 24) return `in ${hours} hours`;

    const days = Math.floor(hours / 24);
    return `in ${days} days`;
  }
}
