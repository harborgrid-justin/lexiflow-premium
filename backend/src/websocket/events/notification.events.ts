/**
 * Notification Event Handlers
 * Real-time event handlers for notification operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebSocketService } from '../websocket.service';
import type { NotificationEvent } from './event-types';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  data?: Record<string, any>;
}

/**
 * Notification Event Emitter
 * Handles broadcasting of notification events
 */
@Injectable()
export class NotificationEventEmitter {
  private logger = new Logger('NotificationEventEmitter');

  constructor(private websocketService: WebSocketService) {}

  /**
   * Send notification to user
   */
  sendNotification(userId: string, notification: NotificationEvent): void {
    this.logger.log(`Sending notification ${notification.id} to user ${userId}`);
    this.websocketService.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(
    userIds: string[],
    notification: NotificationEvent,
  ): void {
    this.logger.log(
      `Sending notification ${notification.id} to ${userIds.length} users`,
    );
    this.websocketService.sendNotificationToUsers(userIds, notification);
  }

  /**
   * Create and send notification
   */
  createNotification(data: CreateNotificationData): void {
    const notification: NotificationEvent = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      actionUrl: data.actionUrl,
      data: data.data,
      createdAt: new Date().toISOString(),
    };

    this.sendNotification(data.userId, notification);
  }

  /**
   * Broadcast notification count update
   */
  broadcastNotificationCount(userId: string, count: number): void {
    this.logger.log(`Broadcasting notification count to user ${userId}: ${count}`);
    this.websocketService.broadcastNotificationCount(userId, count);
  }

  /**
   * Send notification for case assignment
   */
  sendCaseAssignmentNotification(data: {
    userId: string;
    caseId: string;
    caseTitle: string;
    assignedBy: string;
  }): void {
    this.createNotification({
      userId: data.userId,
      type: 'case_assigned',
      title: 'New Case Assignment',
      message: `You have been assigned to case: ${data.caseTitle}`,
      priority: 'high',
      actionUrl: `/cases/${data.caseId}`,
      data: {
        caseId: data.caseId,
        assignedBy: data.assignedBy,
      },
    });
  }

  /**
   * Send notification for document shared
   */
  sendDocumentSharedNotification(data: {
    userId: string;
    documentId: string;
    documentName: string;
    sharedBy: string;
  }): void {
    this.createNotification({
      userId: data.userId,
      type: 'document_shared',
      title: 'Document Shared',
      message: `${data.sharedBy} shared a document with you: ${data.documentName}`,
      priority: 'normal',
      actionUrl: `/documents/${data.documentId}`,
      data: {
        documentId: data.documentId,
        sharedBy: data.sharedBy,
      },
    });
  }

  /**
   * Send notification for new chat message
   */
  sendChatMessageNotification(data: {
    userId: string;
    conversationId: string;
    senderName: string;
    messagePreview: string;
  }): void {
    this.createNotification({
      userId: data.userId,
      type: 'chat_message',
      title: `New message from ${data.senderName}`,
      message: data.messagePreview,
      priority: 'normal',
      actionUrl: `/chat/${data.conversationId}`,
      data: {
        conversationId: data.conversationId,
      },
    });
  }

  /**
   * Send notification for billing reminder
   */
  sendBillingReminderNotification(data: {
    userId: string;
    invoiceId: string;
    amount: number;
    dueDate: string;
  }): void {
    this.createNotification({
      userId: data.userId,
      type: 'billing_reminder',
      title: 'Payment Reminder',
      message: `Invoice payment of $${data.amount} is due on ${data.dueDate}`,
      priority: 'high',
      actionUrl: `/billing/invoices/${data.invoiceId}`,
      data: {
        invoiceId: data.invoiceId,
        amount: data.amount,
        dueDate: data.dueDate,
      },
    });
  }

  /**
   * Send notification for case status change
   */
  sendCaseStatusChangeNotification(data: {
    userId: string;
    caseId: string;
    caseTitle: string;
    oldStatus: string;
    newStatus: string;
  }): void {
    this.createNotification({
      userId: data.userId,
      type: 'case_status_changed',
      title: 'Case Status Updated',
      message: `${data.caseTitle} status changed from ${data.oldStatus} to ${data.newStatus}`,
      priority: 'normal',
      actionUrl: `/cases/${data.caseId}`,
      data: {
        caseId: data.caseId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
      },
    });
  }

  /**
   * Send system maintenance notification
   */
  sendSystemMaintenanceNotification(data: {
    userIds: string[];
    startTime: string;
    endTime?: string;
    message: string;
  }): void {
    const notification: NotificationEvent = {
      id: `notif-maint-${Date.now()}`,
      type: 'system_maintenance',
      title: 'Scheduled Maintenance',
      message: data.message,
      priority: 'urgent',
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
      },
      createdAt: new Date().toISOString(),
    };

    this.sendNotificationToUsers(data.userIds, notification);
  }
}
