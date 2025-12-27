/**
 * Enterprise Types
 * Shared TypeScript types, interfaces, and type utilities for LexiFlow Premium
 *
 * This file contains all shared types used across multiple modules in the enterprise application.
 * Following strict TypeScript and enterprise-grade practices.
 */

/**
 * Base entity interface for all database entities
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Audit metadata for tracking entity changes
 */
export interface AuditMetadata {
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  version?: number;
  changeReason?: string;
}

/**
 * Extended entity with audit fields
 */
export interface AuditableEntity extends BaseEntity, AuditMetadata {}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ErrorResponse;
  timestamp: string;
  correlationId?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  stack?: string;
  path?: string;
  method?: string;
  timestamp?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

/**
 * Generic filter parameters
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Query parameters combining pagination and filters
 */
export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * User context information
 */
export interface UserContext {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions?: string[];
  organizationId?: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * File upload metadata
 */
export interface FileMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  uploadedBy?: string;
  uploadedAt: Date;
  checksum?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T> {
  successful: T[];
  failed: BulkOperationError[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

/**
 * Bulk operation error detail
 */
export interface BulkOperationError {
  item: unknown;
  error: string;
  index: number;
}

/**
 * Search result with highlighting
 */
export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: SearchFacets;
  suggestions?: string[];
  highlights?: Record<string, string[]>;
}

/**
 * Search facets for filtering
 */
export interface SearchFacets {
  [key: string]: FacetValue[];
}

/**
 * Individual facet value
 */
export interface FacetValue {
  value: string;
  count: number;
}

/**
 * Event metadata for event-driven architecture
 */
export interface EventMetadata {
  eventId: string;
  eventType: string;
  timestamp: Date;
  source: string;
  correlationId?: string;
  causationId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Domain event base structure
 */
export interface DomainEvent<T = unknown> extends EventMetadata {
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: T;
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number;
  key?: string;
  namespace?: string;
  tags?: string[];
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryableErrors?: string[];
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeoutMs: number;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (context: unknown) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: Record<string, ServiceHealthStatus>;
  version?: string;
  uptime?: number;
}

/**
 * Individual service health status
 */
export interface ServiceHealthStatus {
  status: 'up' | 'down' | 'degraded';
  message?: string;
  responseTime?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Metric data point
 */
export interface MetricDataPoint {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
  unit?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: AuditLogChange[];
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  status: 'success' | 'failure';
  errorMessage?: string;
}

/**
 * Audit log change detail
 */
export interface AuditLogChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Notification payload
 */
export interface NotificationPayload {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  expiresAt?: Date;
}

/**
 * Notification types
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
  timestamp: Date;
  messageId?: string;
  correlationId?: string;
}

/**
 * Job queue payload
 */
export interface JobPayload<T = unknown> {
  jobId: string;
  jobType: string;
  data: T;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  delay?: number;
  scheduledFor?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Job result
 */
export interface JobResult<T = unknown> {
  jobId: string;
  status: JobStatus;
  result?: T;
  error?: string;
  completedAt?: Date;
  duration?: number;
}

/**
 * Job status enum
 */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DELAYED = 'delayed',
}

/**
 * Database transaction options
 */
export interface TransactionOptions {
  isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout?: number;
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

/**
 * Import/Export configuration
 */
export interface ImportExportConfig {
  format: 'csv' | 'excel' | 'json' | 'xml';
  includeHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
  fieldMapping?: Record<string, string>;
}

/**
 * Feature flag configuration
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  enabledForUsers?: string[];
  enabledForOrganizations?: string[];
  rolloutPercentage?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Configuration value
 */
export interface ConfigValue<T = unknown> {
  key: string;
  value: T;
  environment?: string;
  encrypted?: boolean;
  lastUpdated?: Date;
  updatedBy?: string;
}

/**
 * Type utilities
 */

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties of T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make specific properties of T required
 */
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties of T optional
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract promise type
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Maybe type (null or undefined)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Constructor type
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Abstract constructor type
 */
export type AbstractConstructor<T = unknown> = abstract new (...args: unknown[]) => T;

/**
 * Function type with any arguments
 */
export type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Async function type
 */
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;

/**
 * Entity ID type (UUID string)
 */
export type EntityId = string;

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * Email address string
 */
export type EmailAddress = string;

/**
 * Phone number string
 */
export type PhoneNumber = string;

/**
 * URL string
 */
export type URLString = string;

/**
 * JSON value type
 */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

/**
 * JSON object type
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * JSON array type
 */
export type JSONArray = JSONValue[];

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Log level type
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Generic result type for operations that can fail
 */
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

/**
 * Generic option type
 */
export type Option<T> = T | null | undefined;
