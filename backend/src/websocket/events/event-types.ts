/**
 * WebSocket Event Types
 * Centralized event type definitions for real-time communication
 */

// Base event interface
export interface WebSocketEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
  userId?: string;
}

// Connection Events
export interface ConnectionAuthenticatedEvent {
  userId: string;
  timestamp: string;
}

// Case Events
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

export interface CaseDeletedEvent {
  caseId: string;
  deletedBy: string;
  timestamp: string;
}

export interface CaseStatusChangedEvent {
  caseId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: string;
}

// Document Events
export interface DocumentUploadedEvent {
  documentId: string;
  caseId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  timestamp: string;
}

export interface DocumentUpdatedEvent {
  documentId: string;
  changes: Record<string, any>;
  updatedBy: string;
  timestamp: string;
}

export interface DocumentDeletedEvent {
  documentId: string;
  deletedBy: string;
  timestamp: string;
}

export interface DocumentSharedEvent {
  documentId: string;
  sharedWith: string[];
  sharedBy: string;
  permissions: string[];
  timestamp: string;
}

export interface DocumentProcessingEvent {
  documentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  timestamp: string;
}

// Billing Events
export interface BillingInvoiceCreatedEvent {
  invoiceId: string;
  caseId: string;
  amount: number;
  currency: string;
  dueDate: string;
  createdBy: string;
  timestamp: string;
}

export interface BillingPaymentReceivedEvent {
  paymentId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  timestamp: string;
}

export interface BillingTimeEntryCreatedEvent {
  timeEntryId: string;
  caseId: string;
  userId: string;
  duration: number;
  billableAmount: number;
  description: string;
  timestamp: string;
}

// Notification Events
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

export interface NotificationReadEvent {
  notificationId: string;
  readAt: string;
}

export interface NotificationDeletedEvent {
  notificationId: string;
  timestamp: string;
}

// User Presence Events
export interface UserPresenceEvent {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
  timestamp: string;
}

export interface UserTypingEvent {
  userId: string;
  contextId: string; // conversationId or documentId
  contextType: 'conversation' | 'document' | 'comment';
  isTyping: boolean;
  timestamp: string;
}

export interface UserActivityEvent {
  userId: string;
  activityType: string;
  contextId?: string;
  contextType?: string;
  timestamp: string;
}

// Chat/Messaging Events
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

export interface ChatMessageReadEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  readAt: string;
}

export interface ChatMessageDeletedEvent {
  messageId: string;
  conversationId: string;
  deletedBy: string;
  timestamp: string;
}

// Collaboration Events
export interface CollaborationJoinEvent {
  userId: string;
  resourceId: string;
  resourceType: 'document' | 'case' | 'board';
  timestamp: string;
}

export interface CollaborationLeaveEvent {
  userId: string;
  resourceId: string;
  resourceType: 'document' | 'case' | 'board';
  timestamp: string;
}

export interface CollaborationCursorEvent {
  userId: string;
  resourceId: string;
  position: {
    x: number;
    y: number;
  };
  selection?: {
    start: number;
    end: number;
  };
  timestamp: string;
}

export interface CollaborationChangeEvent {
  userId: string;
  resourceId: string;
  changeType: 'insert' | 'delete' | 'update';
  changes: any;
  timestamp: string;
}

// System Events
export interface SystemMaintenanceEvent {
  type: 'scheduled' | 'emergency';
  message: string;
  startTime: string;
  endTime?: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface SystemUpdateEvent {
  version: string;
  features: string[];
  fixes: string[];
  timestamp: string;
}

// Event Names (constants for type safety)
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

// Room types for Socket.IO rooms
export const WS_ROOMS = {
  user: (userId: string) => `user:${userId}`,
  case: (caseId: string) => `case:${caseId}`,
  document: (documentId: string) => `document:${documentId}`,
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  organization: (orgId: string) => `org:${orgId}`,
  team: (teamId: string) => `team:${teamId}`,
} as const;
