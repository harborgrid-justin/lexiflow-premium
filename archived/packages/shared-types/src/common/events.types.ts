/**
 * Event and Messaging Types for Real-time Features
 * Type-safe event system for WebSockets, SSE, and pub/sub patterns
 */

import { UserId, CaseId, DocumentId } from '../entities/base.entity';
import { JsonValue } from './json-value.types';

/**
 * Base event interface
 */
export interface BaseEvent<TType extends string = string, TPayload = unknown> {
  type: TType;
  payload: TPayload;
  timestamp: string;
  id?: string;
  userId?: UserId;
  metadata?: EventMetadata;
}

/**
 * Event metadata
 */
export interface EventMetadata {
  source?: string;
  correlationId?: string;
  causationId?: string;
  version?: string;
  retryCount?: number;
  [key: string]: JsonValue | undefined;
}

/**
 * Domain Events - Application-specific events
 */
export enum DomainEventType {
  // User events
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',

  // Case events
  CASE_CREATED = 'CASE_CREATED',
  CASE_UPDATED = 'CASE_UPDATED',
  CASE_DELETED = 'CASE_DELETED',
  CASE_STATUS_CHANGED = 'CASE_STATUS_CHANGED',
  CASE_ASSIGNED = 'CASE_ASSIGNED',

  // Document events
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_UPDATED = 'DOCUMENT_UPDATED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
  DOCUMENT_ANALYZED = 'DOCUMENT_ANALYZED',

  // Task events
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',

  // Comment events
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',

  // Notification events
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  NOTIFICATION_READ = 'NOTIFICATION_READ',

  // Collaboration events
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  USER_TYPING = 'USER_TYPING',
  CURSOR_MOVED = 'CURSOR_MOVED',

  // System events
  SYNC_STARTED = 'SYNC_STARTED',
  SYNC_COMPLETED = 'SYNC_COMPLETED',
  SYNC_FAILED = 'SYNC_FAILED',
  MAINTENANCE_SCHEDULED = 'MAINTENANCE_SCHEDULED',
}

/**
 * Domain event payloads
 */
export interface UserCreatedEvent extends BaseEvent<DomainEventType.USER_CREATED> {
  payload: {
    userId: UserId;
    email: string;
    role: string;
  };
}

export interface CaseCreatedEvent extends BaseEvent<DomainEventType.CASE_CREATED> {
  payload: {
    caseId: CaseId;
    title: string;
    createdBy: UserId;
  };
}

export interface DocumentUploadedEvent extends BaseEvent<DomainEventType.DOCUMENT_UPLOADED> {
  payload: {
    documentId: DocumentId;
    caseId: CaseId;
    fileName: string;
    uploadedBy: UserId;
  };
}

export interface TaskAssignedEvent extends BaseEvent<DomainEventType.TASK_ASSIGNED> {
  payload: {
    taskId: string;
    assignedTo: UserId;
    assignedBy: UserId;
    dueDate?: string;
  };
}

export interface UserTypingEvent extends BaseEvent<DomainEventType.USER_TYPING> {
  payload: {
    userId: UserId;
    location: string; // e.g., "case:123", "comment:456"
    isTyping: boolean;
  };
}

/**
 * Union of all domain events
 */
export type DomainEvent =
  | UserCreatedEvent
  | CaseCreatedEvent
  | DocumentUploadedEvent
  | TaskAssignedEvent
  | UserTypingEvent
  | BaseEvent<DomainEventType>;

/**
 * Event handler function
 */
export type EventHandler<TEvent extends BaseEvent = BaseEvent> = (event: TEvent) => void | Promise<void>;

/**
 * Event subscriber
 */
export interface EventSubscriber<TEvent extends BaseEvent = BaseEvent> {
  eventType: string | string[];
  handler: EventHandler<TEvent>;
  priority?: number;
  once?: boolean;
}

/**
 * Event emitter interface
 */
export interface EventEmitter<TEvent extends BaseEvent = BaseEvent> {
  on(eventType: string, handler: EventHandler<TEvent>): void;
  off(eventType: string, handler: EventHandler<TEvent>): void;
  once(eventType: string, handler: EventHandler<TEvent>): void;
  emit(event: TEvent): void;
  removeAllListeners(eventType?: string): void;
}

/**
 * WebSocket event types
 */
export enum WebSocketEventType {
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  ERROR = 'ERROR',
  MESSAGE = 'MESSAGE',
  RECONNECTING = 'RECONNECTING',
  RECONNECTED = 'RECONNECTED',
}

/**
 * WebSocket events
 */
export interface WebSocketConnectEvent extends BaseEvent<WebSocketEventType.CONNECT> {
  payload: {
    connectionId: string;
  };
}

export interface WebSocketDisconnectEvent extends BaseEvent<WebSocketEventType.DISCONNECT> {
  payload: {
    reason: string;
    code?: number;
  };
}

export interface WebSocketErrorEvent extends BaseEvent<WebSocketEventType.ERROR> {
  payload: {
    error: string;
    code?: string;
  };
}

export interface WebSocketMessageEvent<TData = unknown> extends BaseEvent<WebSocketEventType.MESSAGE> {
  payload: {
    data: TData;
    channel?: string;
  };
}

/**
 * Union of WebSocket events
 */
export type WebSocketEvent =
  | WebSocketConnectEvent
  | WebSocketDisconnectEvent
  | WebSocketErrorEvent
  | WebSocketMessageEvent;

/**
 * Channel subscription
 */
export interface ChannelSubscription {
  channel: string;
  filters?: Record<string, JsonValue>;
  handler: EventHandler;
}

/**
 * Presence state for real-time collaboration
 */
export interface PresenceState {
  userId: UserId;
  userName: string;
  status: 'online' | 'away' | 'offline';
  location?: string;
  cursor?: {
    x: number;
    y: number;
  };
  lastActiveAt: string;
  metadata?: Record<string, JsonValue>;
}

/**
 * Presence event
 */
export interface PresenceEvent extends BaseEvent<'PRESENCE'> {
  payload: {
    action: 'join' | 'leave' | 'update';
    presence: PresenceState;
  };
}

/**
 * Broadcast message (for pub/sub)
 */
export interface BroadcastMessage<TData = unknown> {
  channel: string;
  event: string;
  data: TData;
  senderId?: UserId;
  timestamp: string;
  excludeSender?: boolean;
}

/**
 * Message queue event
 */
export interface MessageQueueEvent<TData = unknown> {
  id: string;
  type: string;
  data: TData;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: string;
  retryCount?: number;
  maxRetries?: number;
  expiresAt?: string;
}

/**
 * Server-Sent Event (SSE)
 */
export interface ServerSentEvent<TData = unknown> {
  id?: string;
  event?: string;
  data: TData;
  retry?: number;
}

/**
 * Event stream configuration
 */
export interface EventStreamConfig {
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

/**
 * Event store entry
 */
export interface EventStoreEntry<TEvent extends BaseEvent = BaseEvent> {
  sequenceNumber: number;
  event: TEvent;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: string;
}

/**
 * Event sourcing snapshot
 */
export interface EventSnapshot<TState = unknown> {
  aggregateId: string;
  version: number;
  state: TState;
  timestamp: string;
}

/**
 * CQRS Command
 */
export interface Command<TType extends string = string, TPayload = unknown> {
  type: TType;
  payload: TPayload;
  commandId: string;
  userId?: UserId;
  timestamp: string;
  metadata?: Record<string, JsonValue>;
}

/**
 * CQRS Query
 */
export interface Query<TType extends string = string, TParams = unknown> {
  type: TType;
  params: TParams;
  queryId: string;
  userId?: UserId;
  timestamp: string;
}

/**
 * Event bus interface
 */
export interface EventBus {
  publish<TEvent extends BaseEvent>(event: TEvent): Promise<void>;
  subscribe<TEvent extends BaseEvent>(
    eventType: string,
    handler: EventHandler<TEvent>
  ): () => void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

/**
 * Notification types
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification event
 */
export interface NotificationEvent extends BaseEvent<'NOTIFICATION'> {
  payload: {
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    targetUserId?: UserId;
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: string;
  };
}

/**
 * Activity log event
 */
export interface ActivityLogEvent extends BaseEvent<'ACTIVITY'> {
  payload: {
    action: string;
    resourceType: string;
    resourceId: string;
    description: string;
    changes?: Record<string, { old: JsonValue; new: JsonValue }>;
  };
}

/**
 * Webhook event
 */
export interface WebhookEvent<TData = unknown> {
  id: string;
  event: string;
  data: TData;
  timestamp: string;
  signature?: string;
  deliveryId?: string;
}

/**
 * Webhook delivery status
 */
export type WebhookDeliveryStatus =
  | { status: 'pending' }
  | { status: 'delivered'; deliveredAt: string; responseCode: number }
  | { status: 'failed'; failedAt: string; error: string; retryCount: number };

/**
 * Real-time update subscription
 */
export interface RealtimeSubscription<TData = unknown> {
  id: string;
  resource: string;
  filters?: Record<string, JsonValue>;
  onUpdate: (data: TData) => void;
  onError?: (error: Error) => void;
}

/**
 * Event aggregator for complex event processing
 */
export interface EventAggregator<TEvent extends BaseEvent = BaseEvent> {
  aggregate(events: TEvent[]): TEvent[];
  window: number; // Time window in milliseconds
  strategy: 'count' | 'time' | 'custom';
}

/**
 * Event filter
 */
export type EventFilter<TEvent extends BaseEvent = BaseEvent> = (event: TEvent) => boolean;

/**
 * Event transformer
 */
export type EventTransformer<TIn extends BaseEvent, TOut extends BaseEvent> = (event: TIn) => TOut;

/**
 * Event pipeline
 */
export interface EventPipeline<TIn extends BaseEvent = BaseEvent, TOut extends BaseEvent = BaseEvent> {
  filters: EventFilter<TIn>[];
  transformers: EventTransformer<any, any>[];
  process(event: TIn): TOut | null;
}
