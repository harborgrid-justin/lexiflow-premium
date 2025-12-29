/**
 * WebSocket Event Types and Interfaces
 *
 * Comprehensive type definitions for all WebSocket events across the application.
 * Organized by namespace for clarity and maintainability.
 *
 * @module WebSocketEvents
 */

// =============================================================================
// CORE WEBSOCKET EVENTS
// =============================================================================

/**
 * Generic WebSocket Event
 */
export interface WSEvent {
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Connection Events
 */
export interface ConnectionEvent extends WSEvent {
  userId: string;
  socketId: string;
  namespace: string;
}

export interface DisconnectionEvent extends WSEvent {
  userId: string;
  socketId: string;
  reason?: string;
}

export interface ErrorEvent extends WSEvent {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// NOTIFICATION EVENTS (/notifications namespace)
// =============================================================================

export enum NotificationType {
  CASE_UPDATE = 'case_update',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DEADLINE_REMINDER = 'deadline_reminder',
  TASK_ASSIGNED = 'task_assigned',
  MESSAGE_RECEIVED = 'message_received',
  INVOICE_SENT = 'invoice_sent',
  APPROVAL_REQUIRED = 'approval_required',
  SYSTEM_ALERT = 'system_alert',
  COMMENT_ADDED = 'comment_added',
  STATUS_CHANGED = 'status_changed',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface NotificationEvent extends WSEvent {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  userId: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
}

export interface NotificationReadEvent extends WSEvent {
  notificationId: string;
  userId: string;
  readAt: string;
}

export interface NotificationDeletedEvent extends WSEvent {
  notificationId: string;
  userId: string;
}

export interface NotificationCountEvent extends WSEvent {
  count: number;
  userId: string;
}

// =============================================================================
// MESSAGING EVENTS (/messaging namespace)
// =============================================================================

export interface MessageEvent extends WSEvent {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName?: string;
  attachments?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MessageReadEvent extends WSEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  readAt: string;
}

export interface TypingStartEvent extends WSEvent {
  conversationId: string;
  userId: string;
  userName?: string;
}

export interface TypingStopEvent extends WSEvent {
  conversationId: string;
  userId: string;
}

// =============================================================================
// DASHBOARD EVENTS (/dashboard namespace)
// =============================================================================

export interface DashboardMetricsEvent extends WSEvent {
  activeCases: number;
  pendingTasks: number;
  upcomingDeadlines: number;
  recentActivity: number;
  totalRevenue?: number;
  billableHours?: number;
  customMetrics?: Record<string, number>;
}

export interface ActivityFeedEvent extends WSEvent {
  id: string;
  type: 'case_update' | 'document_filed' | 'task_completed' | 'deadline_approaching' | 'message';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  caseId?: string;
  caseName?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CaseStatsEvent extends WSEvent {
  caseId: string;
  status: string;
  progress: number;
  activeTasks: number;
  upcomingDeadlines: number;
  recentUpdates: number;
}

export interface TeamActivityEvent extends WSEvent {
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface DashboardAlertEvent extends WSEvent {
  type: 'deadline' | 'task' | 'system' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  actionRequired?: boolean;
  actionUrl?: string;
}

// =============================================================================
// PRESENCE EVENTS (emitted via main gateway or dedicated namespace)
// =============================================================================

export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export interface PresenceUpdateEvent extends WSEvent {
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
  activeConnections: number;
  currentActivity?: string;
  customStatus?: string;
}

export interface PresenceBulkUpdateEvent extends WSEvent {
  users: Array<{
    userId: string;
    status: PresenceStatus;
    lastSeen: string;
  }>;
}

// =============================================================================
// CASE EVENTS (via /events or /realtime namespace)
// =============================================================================

export interface CaseCreatedEvent extends WSEvent {
  caseId: string;
  caseNumber: string;
  title: string;
  clientId: string;
  clientName?: string;
  createdBy: string;
  createdAt: string;
}

export interface CaseUpdatedEvent extends WSEvent {
  caseId: string;
  caseNumber: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  updatedBy: string;
  updatedAt: string;
}

export interface CaseDeletedEvent extends WSEvent {
  caseId: string;
  caseNumber: string;
  deletedBy: string;
  deletedAt: string;
}

export interface CaseStatusChangedEvent extends WSEvent {
  caseId: string;
  caseNumber: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
}

// =============================================================================
// DOCUMENT EVENTS
// =============================================================================

export interface DocumentUploadedEvent extends WSEvent {
  documentId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caseId?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DocumentProcessedEvent extends WSEvent {
  documentId: string;
  fileName: string;
  status: 'success' | 'failed';
  extractedText?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface DocumentSharedEvent extends WSEvent {
  documentId: string;
  fileName: string;
  sharedWith: string[];
  sharedBy: string;
  permissions: 'view' | 'edit' | 'download';
  sharedAt: string;
}

// =============================================================================
// TASK EVENTS
// =============================================================================

export interface TaskCreatedEvent extends WSEvent {
  taskId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  caseId?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  createdAt: string;
}

export interface TaskUpdatedEvent extends WSEvent {
  taskId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  updatedBy: string;
  updatedAt: string;
}

export interface TaskCompletedEvent extends WSEvent {
  taskId: string;
  title: string;
  completedBy: string;
  completedAt: string;
  caseId?: string;
}

// =============================================================================
// DEADLINE EVENTS
// =============================================================================

export interface DeadlineApproachingEvent extends WSEvent {
  deadlineId: string;
  caseId: string;
  caseName: string;
  description: string;
  dueDate: string;
  timeRemaining: number; // in milliseconds
  severity: 'info' | 'warning' | 'urgent';
}

export interface DeadlineMissedEvent extends WSEvent {
  deadlineId: string;
  caseId: string;
  caseName: string;
  description: string;
  dueDate: string;
  missedBy: number; // in milliseconds
}

// =============================================================================
// DOCKET EVENTS
// =============================================================================

export interface DocketEntryAddedEvent extends WSEvent {
  entryId: string;
  caseId: string;
  entryNumber: number;
  description: string;
  filedDate: string;
  documentCount: number;
  addedAt: string;
}

// =============================================================================
// ROOM EVENTS
// =============================================================================

export interface UserJoinedRoomEvent extends WSEvent {
  room: string;
  socketId: string;
  userId?: string;
  userName?: string;
  participantCount: number;
}

export interface UserLeftRoomEvent extends WSEvent {
  room: string;
  socketId: string;
  userId?: string;
  participantCount: number;
}

// =============================================================================
// COLLABORATION EVENTS
// =============================================================================

export interface CollaborationJoinedEvent extends WSEvent {
  documentId: string;
  userId: string;
  userName: string;
  cursorPosition?: { line: number; column: number };
}

export interface CollaborationLeftEvent extends WSEvent {
  documentId: string;
  userId: string;
}

export interface CollaborationCursorEvent extends WSEvent {
  documentId: string;
  userId: string;
  cursorPosition: { line: number; column: number };
}

export interface CollaborationEditEvent extends WSEvent {
  documentId: string;
  userId: string;
  changes: Array<{
    range: { start: number; end: number };
    text: string;
  }>;
  version: number;
}

// =============================================================================
// SYSTEM EVENTS
// =============================================================================

export interface SystemAlertEvent extends WSEvent {
  id: string;
  type: 'maintenance' | 'security' | 'performance' | 'feature';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  affectedUsers?: string[];
  startTime?: string;
  endTime?: string;
  actionRequired?: boolean;
  actionUrl?: string;
}

export interface SystemMaintenanceEvent extends WSEvent {
  maintenanceId: string;
  type: 'scheduled' | 'emergency';
  startTime: string;
  estimatedEndTime: string;
  message: string;
  affectedServices: string[];
}

// =============================================================================
// EVENT TYPE GUARDS
// =============================================================================

export function isNotificationEvent(event: unknown): event is NotificationEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'id' in event &&
    'type' in event &&
    'title' in event &&
    'message' in event
  );
}

export function isPresenceUpdateEvent(event: unknown): event is PresenceUpdateEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'userId' in event &&
    'status' in event &&
    'lastSeen' in event
  );
}

export function isMessageEvent(event: unknown): event is MessageEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'id' in event &&
    'conversationId' in event &&
    'content' in event &&
    'senderId' in event
  );
}

// =============================================================================
// EVENT NAME CONSTANTS
// =============================================================================

export const WS_EVENTS = {
  // Connection
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETED: 'notification:deleted',
  NOTIFICATION_COUNT: 'notification:count',
  NOTIFICATION_ALL_READ: 'notification:all-read',

  // Messaging
  MESSAGE_NEW: 'message:new',
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave',

  // Dashboard
  DASHBOARD_METRICS: 'dashboard:metrics',
  DASHBOARD_ACTIVITY: 'dashboard:activity',
  DASHBOARD_CASE_STATS: 'dashboard:case-stats',
  DASHBOARD_TEAM_ACTIVITY: 'dashboard:team-activity',
  DASHBOARD_ALERT: 'dashboard:alert',
  DASHBOARD_SUBSCRIBE: 'dashboard:subscribe',
  DASHBOARD_UNSUBSCRIBE: 'dashboard:unsubscribe',
  DASHBOARD_REFRESH: 'dashboard:request-refresh',

  // Presence
  PRESENCE_UPDATE: 'presence:update',
  PRESENCE_BULK_UPDATE: 'presence:bulk-update',
  PRESENCE_SET_STATUS: 'presence:set-status',
  PRESENCE_SET_ACTIVITY: 'presence:set-activity',
  PRESENCE_HEARTBEAT: 'presence:heartbeat',

  // Cases
  CASE_CREATED: 'case:created',
  CASE_UPDATED: 'case:updated',
  CASE_DELETED: 'case:deleted',
  CASE_STATUS_CHANGED: 'case:status:changed',
  CASE_SUBSCRIBE: 'subscribe:case',
  CASE_UNSUBSCRIBE: 'unsubscribe:case',

  // Documents
  DOCUMENT_UPLOADED: 'document:uploaded',
  DOCUMENT_PROCESSED: 'document:processed',
  DOCUMENT_SHARED: 'document:shared',

  // Tasks
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_COMPLETED: 'task:completed',

  // Deadlines
  DEADLINE_APPROACHING: 'deadline:approaching',
  DEADLINE_MISSED: 'deadline:missed',

  // Docket
  DOCKET_ENTRY_ADDED: 'docket:entry:added',

  // Rooms
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ROOM_MESSAGE: 'message',

  // Collaboration
  COLLABORATION_JOINED: 'collaboration:joined',
  COLLABORATION_LEFT: 'collaboration:left',
  COLLABORATION_CURSOR: 'collaboration:cursor',
  COLLABORATION_EDIT: 'collaboration:edit',

  // System
  SYSTEM_ALERT: 'system:alert',
  SYSTEM_MAINTENANCE: 'system:maintenance',
} as const;

export type WSEventName = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
