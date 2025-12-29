/**
 * Strict TypeScript Type Definitions for API
 * Ensures type safety across the entire API surface
 */

/**
 * UUID String Type
 * Represents a valid UUID v4 string
 */
export type UUID = string & { readonly __brand: 'UUID' };

/**
 * ISO8601 Date String Type
 */
export type ISO8601String = string & { readonly __brand: 'ISO8601' };

/**
 * Email String Type
 */
export type Email = string & { readonly __brand: 'Email' };

/**
 * URL String Type
 */
export type URLString = string & { readonly __brand: 'URL' };

/**
 * JSON String Type
 */
export type JSONString = string & { readonly __brand: 'JSON' };

/**
 * Phone Number String Type
 */
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };

/**
 * Positive Number Type
 */
export type PositiveNumber = number & { readonly __brand: 'Positive' };

/**
 * Non-Negative Number Type
 */
export type NonNegativeNumber = number & { readonly __brand: 'NonNegative' };

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  readonly page: PositiveNumber;
  readonly limit: PositiveNumber;
  readonly sortBy?: string;
  readonly sortOrder?: SortOrder;
}

/**
 * Sort Order
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Filter Parameters
 */
export interface FilterParams {
  readonly search?: string;
  readonly startDate?: ISO8601String;
  readonly endDate?: ISO8601String;
}

/**
 * Query Parameters (Pagination + Filter)
 */
export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * API Response Metadata
 */
export interface ResponseMetadata {
  readonly timestamp: ISO8601String;
  readonly correlationId: UUID;
  readonly responseTime: string;
  readonly path: string;
  readonly method: HttpMethod;
  readonly version?: string;
}

/**
 * HTTP Methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta: ResponseMetadata;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ErrorDetails;
  readonly meta: ResponseMetadata;
}

/**
 * Error Details
 */
export interface ErrorDetails {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly validationErrors?: readonly ValidationError[];
  readonly details?: Readonly<Record<string, unknown>>;
  readonly stack?: string;
}

/**
 * Validation Error
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
  readonly constraints?: Readonly<Record<string, string>>;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly pagination: PaginationMetadata;
  readonly meta: ResponseMetadata;
}

/**
 * Pagination Metadata
 */
export interface PaginationMetadata {
  readonly total: NonNegativeNumber;
  readonly page: PositiveNumber;
  readonly limit: PositiveNumber;
  readonly totalPages: NonNegativeNumber;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * Batch Operation Result
 */
export interface BatchOperationResult<T> {
  readonly succeeded: readonly T[];
  readonly failed: readonly BatchOperationError[];
  readonly totalProcessed: NonNegativeNumber;
  readonly successCount: NonNegativeNumber;
  readonly failureCount: NonNegativeNumber;
}

/**
 * Batch Operation Error
 */
export interface BatchOperationError {
  readonly item: unknown;
  readonly error: ErrorDetails;
}

/**
 * Entity Base Interface
 */
export interface EntityBase {
  readonly id: UUID;
  readonly createdAt: ISO8601String;
  readonly updatedAt: ISO8601String;
}

/**
 * Soft Deletable Entity
 */
export interface SoftDeletableEntity extends EntityBase {
  readonly deletedAt: ISO8601String | null;
}

/**
 * Auditable Entity
 */
export interface AuditableEntity extends EntityBase {
  readonly createdBy?: UUID;
  readonly updatedBy?: UUID;
}

/**
 * Full Auditable Entity (with soft delete)
 */
export interface FullAuditableEntity extends SoftDeletableEntity, AuditableEntity {
  readonly deletedBy?: UUID;
}

/**
 * Create DTO Type
 * Omits system-generated fields from entity type
 */
export type CreateDto<T extends EntityBase> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Update DTO Type
 * Makes all fields optional and omits system-generated fields
 */
export type UpdateDto<T extends EntityBase> = Partial<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'>
>;

/**
 * Query Result Type
 * Represents a database query result with metadata
 */
export interface QueryResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly executionTime: number;
}

/**
 * File Upload Metadata
 */
export interface FileUploadMetadata {
  readonly originalName: string;
  readonly mimeType: string;
  readonly size: PositiveNumber;
  readonly encoding: string;
  readonly path: string;
  readonly filename: string;
}

/**
 * Request Context
 * Contains information about the current request
 */
export interface RequestContext {
  readonly userId?: UUID;
  readonly organizationId?: UUID;
  readonly correlationId: UUID;
  readonly ip: string;
  readonly userAgent: string;
  readonly timestamp: ISO8601String;
}

/**
 * Health Check Status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * Component Health
 */
export interface ComponentHealth {
  readonly status: HealthStatus;
  readonly responseTime?: number;
  readonly details?: Readonly<Record<string, unknown>>;
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  readonly status: HealthStatus;
  readonly timestamp: ISO8601String;
  readonly uptime: number;
  readonly checks: Readonly<Record<string, ComponentHealth>>;
}

/**
 * Generic ID Parameter
 */
export interface IdParam {
  readonly id: UUID;
}

/**
 * Bulk IDs Parameter
 */
export interface BulkIdsParam {
  readonly ids: readonly UUID[];
}

/**
 * Date Range Filter
 */
export interface DateRangeFilter {
  readonly startDate: ISO8601String;
  readonly endDate: ISO8601String;
}

/**
 * Search Filter
 */
export interface SearchFilter {
  readonly query: string;
  readonly fields?: readonly string[];
}

/**
 * Resource Action Result
 */
export interface ActionResult<T = void> {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
}

/**
 * Async Job Status
 */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Async Job Result
 */
export interface AsyncJobResult<T = unknown> {
  readonly id: UUID;
  readonly status: JobStatus;
  readonly progress?: number;
  readonly result?: T;
  readonly error?: ErrorDetails;
  readonly startedAt: ISO8601String;
  readonly completedAt?: ISO8601String;
}

/**
 * Type Guard: Check if response is success
 */
export function isSuccessResponse<T>(
  response: ApiSuccessResponse<T> | ApiErrorResponse,
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type Guard: Check if response is error
 */
export function isErrorResponse(
  response: ApiSuccessResponse<unknown> | ApiErrorResponse,
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type Guard: Check if entity is soft deleted
 */
export function isSoftDeleted(entity: SoftDeletableEntity): boolean {
  return entity.deletedAt !== null;
}
