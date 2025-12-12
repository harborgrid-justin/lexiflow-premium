/**
 * WebSocket Event Handlers
 * Centralized handlers for real-time events
 */

import { websocketClient } from './WebSocketClient';

// Event type constants (matching backend)
export const WS_EVENTS = {
  // Connection
  CONNECTION_AUTHENTICATED: 'connection:authenticated',
  CONNECTION_ERROR: 'connection:error',

  // Cases
  CASE_CREATED: 'case:created',
  CASE_UPDATED: 'case:updated',
  CASE_DELETED: 'case:deleted',
  CASE_STATUS_CHANGED: 'case:status_changed',
  CASE_ASSIGNED: 'case:assigned',
  CASE_COMMENT_ADDED: 'case:comment_added',

  // Documents
  DOCUMENT_UPLOADED: 'document:uploaded',
  DOCUMENT_UPDATED: 'document:updated',
  DOCUMENT_DELETED: 'document:deleted',
  DOCUMENT_SHARED: 'document:shared',
  DOCUMENT_PROCESSING: 'document:processing',
  DOCUMENT_OCR_COMPLETE: 'document:ocr_complete',

  // Billing
  BILLING_INVOICE_CREATED: 'billing:invoice_created',
  BILLING_INVOICE_UPDATED: 'billing:invoice_updated',
  BILLING_PAYMENT_RECEIVED: 'billing:payment_received',
  BILLING_TIME_ENTRY_CREATED: 'billing:time_entry_created',
  BILLING_REMINDER: 'billing:reminder',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETED: 'notification:deleted',
  NOTIFICATION_COUNT: 'notification:count',

  // Presence
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_SNAPSHOT: 'presence:snapshot',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',
  USER_ACTIVITY: 'user:activity',

  // Chat/Messaging
  CHAT_MESSAGE_NEW: 'chat:message:new',
  CHAT_MESSAGE_UPDATED: 'chat:message:updated',
  CHAT_MESSAGE_DELETED: 'chat:message:deleted',
  CHAT_MESSAGE_READ: 'chat:message:read',
  CHAT_TYPING_START: 'chat:typing:start',
  CHAT_TYPING_STOP: 'chat:typing:stop',

  // Collaboration
  COLLAB_JOIN: 'collab:join',
  COLLAB_LEAVE: 'collab:leave',
  COLLAB_CURSOR: 'collab:cursor',
  COLLAB_CHANGE: 'collab:change',

  // System
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_BROADCAST: 'system:broadcast',
} as const;

// Event handler types
export type EventHandler<T = any> = (data: T) => void;

export interface CaseCreatedEvent {
  caseId: string;
  title: string;
  caseNumber: string;
  status: string;
  createdBy: string;
  timestamp: string;
}

export interface CaseUpdatedEvent {
  caseId: string;
  changes: Record<string, any>;
  updatedBy: string;
  timestamp: string;
}

export interface DocumentUploadedEvent {
  documentId: string;
  caseId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  timestamp: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: string;
}

export interface UserPresenceEvent {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
  timestamp: string;
}

export interface ChatMessageEvent {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  replyToId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Event Handler Manager
 * Provides a centralized way to manage event subscriptions
 */
export class EventHandlerManager {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Register event handler
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Subscribe to WebSocket event
    websocketClient.on(event, handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Unregister event handler
   */
  off(event: string, handler?: EventHandler): void {
    if (!handler) {
      // Remove all handlers for event
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.forEach((h) => websocketClient.off(event, h));
        this.handlers.delete(event);
      }
    } else {
      // Remove specific handler
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        websocketClient.off(event, handler);
        if (handlers.size === 0) {
          this.handlers.delete(event);
        }
      }
    }
  }

  /**
   * Register handler for one-time execution
   */
  once<T = any>(event: string, handler: EventHandler<T>): void {
    const wrappedHandler: EventHandler<T> = (data) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }

  /**
   * Emit event
   */
  emit(event: string, data?: any): void {
    websocketClient.emit(event, data);
  }

  /**
   * Emit event with acknowledgment
   */
  async emitWithAck<T = any>(event: string, data?: any): Promise<T> {
    return websocketClient.emitWithAck<T>(event, data);
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.forEach((handlers, event) => {
      handlers.forEach((handler) => websocketClient.off(event, handler));
    });
    this.handlers.clear();
  }

  /**
   * Get registered event names
   */
  getEventNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handler count for event
   */
  getHandlerCount(event: string): number {
    return this.handlers.get(event)?.size || 0;
  }
}

// Export singleton instance
export const eventHandlerManager = new EventHandlerManager();

// Convenience functions for common operations

/**
 * Subscribe to case updates
 */
export function subscribeToCaseUpdates(
  caseId: string,
  handler: EventHandler<CaseUpdatedEvent>,
): () => void {
  // Join case room
  websocketClient.emit('case:subscribe', { caseId });

  // Subscribe to updates
  const unsubscribe = eventHandlerManager.on(WS_EVENTS.CASE_UPDATED, (data) => {
    if (data.caseId === caseId) {
      handler(data);
    }
  });

  // Return cleanup function
  return () => {
    websocketClient.emit('case:unsubscribe', { caseId });
    unsubscribe();
  };
}

/**
 * Subscribe to document updates
 */
export function subscribeToDocumentUpdates(
  documentId: string,
  handler: EventHandler<any>,
): () => void {
  // Join document room
  websocketClient.emit('document:subscribe', { documentId });

  // Subscribe to updates
  const unsubscribe = eventHandlerManager.on(WS_EVENTS.DOCUMENT_UPDATED, (data) => {
    if (data.documentId === documentId) {
      handler(data);
    }
  });

  // Return cleanup function
  return () => {
    websocketClient.emit('document:unsubscribe', { documentId });
    unsubscribe();
  };
}

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(
  handler: EventHandler<NotificationEvent>,
): () => void {
  return eventHandlerManager.on(WS_EVENTS.NOTIFICATION_NEW, handler);
}

/**
 * Subscribe to presence updates
 */
export function subscribeToPresenceUpdates(
  handler: EventHandler<UserPresenceEvent>,
): () => void {
  return eventHandlerManager.on(WS_EVENTS.PRESENCE_UPDATE, handler);
}

/**
 * Join chat conversation
 */
export function joinChatConversation(conversationId: string): void {
  websocketClient.emit('chat:join', { conversationId });
}

/**
 * Leave chat conversation
 */
export function leaveChatConversation(conversationId: string): void {
  websocketClient.emit('chat:leave', { conversationId });
}

/**
 * Send chat message
 */
export async function sendChatMessage(
  conversationId: string,
  content: string,
  options?: {
    attachments?: any[];
    replyToId?: string;
    metadata?: Record<string, any>;
  },
): Promise<{ success: boolean; messageId: string }> {
  return websocketClient.emitWithAck('chat:message:send', {
    conversationId,
    content,
    ...options,
  });
}

/**
 * Update typing status
 */
export function updateTypingStatus(
  contextId: string,
  contextType: 'conversation' | 'document' | 'comment',
  isTyping: boolean,
): void {
  websocketClient.emit('presence:typing', {
    contextId,
    contextType,
    isTyping,
  });
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  websocketClient.emit('notification:mark_read', { notificationId });
}

export default eventHandlerManager;
