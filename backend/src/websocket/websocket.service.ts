import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { WS_EVENTS } from './events/event-types';
import type {
  CaseCreatedEvent,
  CaseUpdatedEvent,
  CaseDeletedEvent,
  CaseStatusChangedEvent,
  DocumentUploadedEvent,
  DocumentUpdatedEvent,
  DocumentDeletedEvent,
  DocumentProcessingEvent,
  BillingInvoiceCreatedEvent,
  BillingPaymentReceivedEvent,
  BillingTimeEntryCreatedEvent,
  NotificationEvent,
  UserPresenceEvent,
  ChatMessageEvent,
  SystemMaintenanceEvent,
  SystemUpdateEvent,
} from './events/event-types';

/**
 * WebSocket Service
 * Provides a clean API for other services to broadcast real-time events
 *
 * Usage:
 * @example
 * constructor(private websocketService: WebSocketService) {}
 *
 * this.websocketService.broadcastCaseCreated({
 *   caseId: '123',
 *   title: 'New Case',
 *   ...
 * });
 */
@Injectable()
export class WebSocketService {
  private logger = new Logger('WebSocketService');
  private gateway: WebSocketGateway;

  /**
   * Set the gateway instance
   * Called by WebSocketModule
   */
  setGateway(gateway: WebSocketGateway) {
    this.gateway = gateway;
    this.logger.log('WebSocket Gateway registered');
  }

  /**
   * Check if gateway is available
   */
  private isReady(): boolean {
    if (!this.gateway) {
      this.logger.warn('WebSocket Gateway not available');
      return false;
    }
    return true;
  }

  // ==================== CASE EVENTS ====================

  /**
   * Broadcast case created event
   */
  broadcastCaseCreated(event: CaseCreatedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting case created: ${event.caseId}`);
    this.gateway.broadcast(WS_EVENTS.CASE_CREATED, event);
    this.gateway.sendToCase(event.caseId, WS_EVENTS.CASE_CREATED, event);
  }

  /**
   * Broadcast case updated event
   */
  broadcastCaseUpdated(event: CaseUpdatedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting case updated: ${event.caseId}`);
    this.gateway.sendToCase(event.caseId, WS_EVENTS.CASE_UPDATED, event);
  }

  /**
   * Broadcast case deleted event
   */
  broadcastCaseDeleted(event: CaseDeletedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting case deleted: ${event.caseId}`);
    this.gateway.sendToCase(event.caseId, WS_EVENTS.CASE_DELETED, event);
  }

  /**
   * Broadcast case status changed event
   */
  broadcastCaseStatusChanged(event: CaseStatusChangedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting case status changed: ${event.caseId}`);
    this.gateway.sendToCase(event.caseId, WS_EVENTS.CASE_STATUS_CHANGED, event);
  }

  /**
   * Broadcast case assigned event
   */
  broadcastCaseAssigned(data: {
    caseId: string;
    assignedTo: string;
    assignedBy: string;
    timestamp: string;
  }) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting case assigned: ${data.caseId}`);
    this.gateway.sendToCase(data.caseId, WS_EVENTS.CASE_ASSIGNED, data);
    this.gateway.sendToUser(data.assignedTo, WS_EVENTS.CASE_ASSIGNED, data);
  }

  /**
   * Broadcast case comment added event
   */
  broadcastCaseCommentAdded(data: {
    caseId: string;
    commentId: string;
    content: string;
    authorId: string;
    timestamp: string;
  }) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting case comment added: ${data.caseId}`);
    this.gateway.sendToCase(data.caseId, WS_EVENTS.CASE_COMMENT_ADDED, data);
  }

  // ==================== DOCUMENT EVENTS ====================

  /**
   * Broadcast document uploaded event
   */
  broadcastDocumentUploaded(event: DocumentUploadedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting document uploaded: ${event.documentId}`);
    this.gateway.broadcast(WS_EVENTS.DOCUMENT_UPLOADED, event);

    if (event.caseId) {
      this.gateway.sendToCase(event.caseId, WS_EVENTS.DOCUMENT_UPLOADED, event);
    }
  }

  /**
   * Broadcast document updated event
   */
  broadcastDocumentUpdated(event: DocumentUpdatedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting document updated: ${event.documentId}`);
    this.gateway.sendToDocument(
      event.documentId,
      WS_EVENTS.DOCUMENT_UPDATED,
      event,
    );
  }

  /**
   * Broadcast document deleted event
   */
  broadcastDocumentDeleted(event: DocumentDeletedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting document deleted: ${event.documentId}`);
    this.gateway.sendToDocument(
      event.documentId,
      WS_EVENTS.DOCUMENT_DELETED,
      event,
    );
  }

  /**
   * Broadcast document processing status
   */
  broadcastDocumentProcessing(event: DocumentProcessingEvent) {
    if (!this.isReady()) return;

    this.logger.log(
      `Broadcasting document processing: ${event.documentId} - ${event.status}`,
    );
    this.gateway.sendToDocument(
      event.documentId,
      WS_EVENTS.DOCUMENT_PROCESSING,
      event,
    );
  }

  /**
   * Broadcast document OCR complete event
   */
  broadcastDocumentOcrComplete(data: {
    documentId: string;
    text: string;
    confidence: number;
    timestamp: string;
  }) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting document OCR complete: ${data.documentId}`);
    this.gateway.sendToDocument(
      data.documentId,
      WS_EVENTS.DOCUMENT_OCR_COMPLETE,
      data,
    );
  }

  // ==================== BILLING EVENTS ====================

  /**
   * Broadcast billing invoice created event
   */
  broadcastBillingInvoiceCreated(event: BillingInvoiceCreatedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting invoice created: ${event.invoiceId}`);
    this.gateway.sendToCase(
      event.caseId,
      WS_EVENTS.BILLING_INVOICE_CREATED,
      event,
    );
  }

  /**
   * Broadcast billing payment received event
   */
  broadcastBillingPaymentReceived(event: BillingPaymentReceivedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting payment received: ${event.paymentId}`);
    this.gateway.broadcast(WS_EVENTS.BILLING_PAYMENT_RECEIVED, event);
  }

  /**
   * Broadcast billing time entry created event
   */
  broadcastBillingTimeEntryCreated(event: BillingTimeEntryCreatedEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting time entry created: ${event.timeEntryId}`);
    this.gateway.sendToCase(
      event.caseId,
      WS_EVENTS.BILLING_TIME_ENTRY_CREATED,
      event,
    );
    this.gateway.sendToUser(event.userId, WS_EVENTS.BILLING_TIME_ENTRY_CREATED, event);
  }

  /**
   * Broadcast billing reminder
   */
  broadcastBillingReminder(data: {
    invoiceId: string;
    caseId: string;
    dueDate: string;
    amount: number;
    recipientUserId: string;
    timestamp: string;
  }) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting billing reminder: ${data.invoiceId}`);
    this.gateway.sendToUser(
      data.recipientUserId,
      WS_EVENTS.BILLING_REMINDER,
      data,
    );
  }

  // ==================== NOTIFICATION EVENTS ====================

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: string, notification: NotificationEvent) {
    if (!this.isReady()) return;

    this.logger.log(
      `Sending notification ${notification.id} to user ${userId}`,
    );
    this.gateway.sendToUser(userId, WS_EVENTS.NOTIFICATION_NEW, notification);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: NotificationEvent) {
    if (!this.isReady()) return;

    this.logger.log(
      `Sending notification ${notification.id} to ${userIds.length} users`,
    );
    userIds.forEach((userId) => {
      this.gateway.sendToUser(userId, WS_EVENTS.NOTIFICATION_NEW, notification);
    });
  }

  /**
   * Broadcast notification count update
   */
  broadcastNotificationCount(userId: string, count: number) {
    if (!this.isReady()) return;

    this.gateway.sendToUser(userId, WS_EVENTS.NOTIFICATION_COUNT, {
      count,
      timestamp: new Date().toISOString(),
    });
  }

  // ==================== PRESENCE EVENTS ====================

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    if (!this.isReady()) return false;
    return this.gateway.isUserOnline(userId);
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    if (!this.isReady()) return [];
    return this.gateway.getOnlineUsers();
  }

  /**
   * Broadcast user activity
   */
  broadcastUserActivity(data: {
    userId: string;
    activityType: string;
    contextId?: string;
    contextType?: string;
    timestamp: string;
  }) {
    if (!this.isReady()) return;

    this.gateway.broadcast(WS_EVENTS.USER_ACTIVITY, data);
  }

  // ==================== CHAT EVENTS ====================

  /**
   * Send chat message to conversation
   */
  sendChatMessage(conversationId: string, message: ChatMessageEvent) {
    if (!this.isReady()) return;

    this.logger.log(
      `Sending chat message ${message.id} to conversation ${conversationId}`,
    );
    this.gateway.sendToConversation(
      conversationId,
      WS_EVENTS.CHAT_MESSAGE_NEW,
      message,
    );
  }

  /**
   * Broadcast chat message updated
   */
  broadcastChatMessageUpdated(data: {
    conversationId: string;
    messageId: string;
    changes: Record<string, any>;
    timestamp: string;
  }) {
    if (!this.isReady()) return;

    this.gateway.sendToConversation(
      data.conversationId,
      WS_EVENTS.CHAT_MESSAGE_UPDATED,
      data,
    );
  }

  /**
   * Broadcast chat message deleted
   */
  broadcastChatMessageDeleted(data: {
    conversationId: string;
    messageId: string;
    deletedBy: string;
    timestamp: string;
  }) {
    if (!this.isReady()) return;

    this.gateway.sendToConversation(
      data.conversationId,
      WS_EVENTS.CHAT_MESSAGE_DELETED,
      data,
    );
  }

  // ==================== SYSTEM EVENTS ====================

  /**
   * Broadcast system maintenance event
   */
  broadcastSystemMaintenance(event: SystemMaintenanceEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting system maintenance: ${event.type}`);
    this.gateway.broadcast(WS_EVENTS.SYSTEM_MAINTENANCE, event);
  }

  /**
   * Broadcast system update event
   */
  broadcastSystemUpdate(event: SystemUpdateEvent) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting system update: ${event.version}`);
    this.gateway.broadcast(WS_EVENTS.SYSTEM_UPDATE, event);
  }

  /**
   * Broadcast generic event to all clients
   */
  broadcastToAll(event: string, data: any) {
    if (!this.isReady()) return;

    this.logger.log(`Broadcasting ${event} to all clients`);
    this.gateway.broadcast(event, data);
  }

  /**
   * Send event to specific case
   */
  sendToCase(caseId: string, event: string, data: any) {
    if (!this.isReady()) return;

    this.gateway.sendToCase(caseId, event, data);
  }

  /**
   * Send event to specific document
   */
  sendToDocument(documentId: string, event: string, data: any) {
    if (!this.isReady()) return;

    this.gateway.sendToDocument(documentId, event, data);
  }

  /**
   * Send event to specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    if (!this.isReady()) return;

    this.gateway.sendToUser(userId, event, data);
  }
}
