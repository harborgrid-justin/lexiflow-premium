/**
 * Enhanced API Response Types
 * Provides comprehensive type-safe API patterns
 */

import { ApiResponse, ApiError } from '../dto/api-response.dto';

/**
 * Standard HTTP status codes
 */
export enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,

  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Comprehensive error codes for the application
 */
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',

  // Business Logic
  CONFLICT = 'CONFLICT',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',

  // Rate Limiting & Quotas
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  EXTERNAL_SERVICE_UNAVAILABLE = 'EXTERNAL_SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_TIMEOUT = 'EXTERNAL_SERVICE_TIMEOUT',

  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // File Operations
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Type-safe API error with specific error code
 */
export interface TypedApiError<TCode extends ErrorCode = ErrorCode> extends Omit<ApiError, 'code'> {
  code: TCode;
  httpStatus?: HttpStatus;
  retryable?: boolean;
  timestamp?: string;
}

/**
 * Discriminated union for async operation states
 * Ensures exhaustive checking in switch/if statements
 */
export type AsyncState<TData, TError = ApiError> =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: TData; timestamp: string }
  | { status: 'error'; error: TError; timestamp: string };

/**
 * Type guard for AsyncState success
 */
export function isAsyncSuccess<TData, TError>(
  state: AsyncState<TData, TError>
): state is { status: 'success'; data: TData; timestamp: string } {
  return state.status === 'success';
}

/**
 * Type guard for AsyncState error
 */
export function isAsyncError<TData, TError>(
  state: AsyncState<TData, TError>
): state is { status: 'error'; error: TError; timestamp: string } {
  return state.status === 'error';
}

/**
 * Type guard for AsyncState loading
 */
export function isAsyncLoading<TData, TError>(
  state: AsyncState<TData, TError>
): state is { status: 'loading'; progress?: number } {
  return state.status === 'loading';
}

/**
 * Enhanced async state with optimistic updates
 */
export type OptimisticAsyncState<TData, TError = ApiError> =
  | { status: 'idle' }
  | { status: 'loading'; optimisticData?: TData; progress?: number }
  | { status: 'success'; data: TData; timestamp: string }
  | { status: 'error'; error: TError; fallbackData?: TData; timestamp: string };

/**
 * Paginated async state
 */
export interface PaginatedAsyncState<TData, TError = ApiError> {
  items: AsyncState<TData[], TError>;
  page: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Mutation state for create/update/delete operations
 */
export type MutationState<TData = void, TError = ApiError> =
  | { status: 'idle' }
  | { status: 'pending'; variables?: unknown }
  | { status: 'success'; data: TData; timestamp: string }
  | { status: 'error'; error: TError; timestamp: string };

/**
 * WebSocket message types
 */
export enum WebSocketMessageType {
  // Connection
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  PING = 'PING',
  PONG = 'PONG',

  // Data
  DATA = 'DATA',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',

  // Events
  EVENT = 'EVENT',
  NOTIFICATION = 'NOTIFICATION',

  // Errors
  ERROR = 'ERROR',
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<TPayload = unknown> {
  type: WebSocketMessageType;
  payload: TPayload;
  id?: string;
  timestamp: string;
  channel?: string;
}

/**
 * Real-time event
 */
export interface RealtimeEvent<TData = unknown> {
  event: string;
  data: TData;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

/**
 * API response with metadata
 */
export interface EnhancedApiResponse<TData> extends ApiResponse<TData> {
  httpStatus: HttpStatus;
  headers?: Record<string, string>;
  requestDuration?: number;
  cacheHit?: boolean;
}

/**
 * File upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  rate?: number; // bytes per second
  estimated?: number; // estimated seconds remaining
}

/**
 * File upload state
 */
export type UploadState<TResult = unknown> =
  | { status: 'idle' }
  | { status: 'uploading'; progress: UploadProgress }
  | { status: 'processing'; message?: string }
  | { status: 'success'; result: TResult }
  | { status: 'error'; error: ApiError };

/**
 * Polling configuration
 */
export interface PollingConfig {
  interval: number;
  maxAttempts?: number;
  stopCondition?: (data: unknown) => boolean;
  exponentialBackoff?: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string;
  invalidateOn?: string[]; // Events that invalidate cache
  staleWhileRevalidate?: boolean;
}
