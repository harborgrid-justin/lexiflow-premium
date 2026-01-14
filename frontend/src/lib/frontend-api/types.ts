/**
 * Frontend API Type System
 * Core types for enterprise frontend API architecture
 *
 * @module lib/frontend-api/types
 * @description Canonical return types following the enterprise standard:
 * - Result<T>: Discriminated union for safe error handling
 * - No exceptions thrown at API boundary
 * - Type-safe at compile time
 * - Forces explicit error handling
 *
 * RULE: All frontend API methods MUST return Result<T>
 * RULE: Components receive typed data or typed errors, never raw exceptions
 *
 * @example
 * ```typescript
 * async function getReport(id: string): Promise<Result<Report>> {
 *   const response = await client.get(`/reports/${id}`);
 *
 *   if (!response.ok) {
 *     return {
 *       ok: false,
 *       error: mapError(response),
 *     };
 *   }
 *
 *   return {
 *     ok: true,
 *     data: normalizeReport(response.data),
 *   };
 * }
 * ```
 */

/**
 * Successful result wrapper
 */
export interface Success<T> {
  ok: true;
  data: T;
}

/**
 * Failed result wrapper
 */
export interface Failure<E = DomainError> {
  ok: false;
  error: E;
}

/**
 * Result type - discriminated union for type-safe error handling
 * Replaces try/catch at API boundaries
 */
export type Result<T, E = DomainError> = Success<T> | Failure<E>;

/**
 * Domain error interface
 * Structured error information for UI consumption
 */
export interface DomainError {
  /**
   * Error type classification
   */
  type: ErrorType;

  /**
   * Human-readable error message (safe for UI display)
   */
  message: string;

  /**
   * Whether the operation can be retried
   */
  recoverable: boolean;

  /**
   * HTTP status code (if applicable)
   */
  status?: number;

  /**
   * Additional context for debugging (not shown to end users)
   */
  details?: Record<string, unknown>;

  /**
   * Unique error code for tracking
   */
  code?: string;

  /**
   * Suggested retry-after time (in milliseconds)
   */
  retryAfter?: number;

  /**
   * Field-level validation errors
   */
  fieldErrors?: FieldError[];

  /**
   * Convert to HTTP response for throwing in loaders
   */
  toResponse(): Response;
}

/**
 * Field-level validation error
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Error type classification
 * Used for UI routing and user messaging
 */
export enum ErrorType {
  /** Network connectivity issues */
  NETWORK = "NETWORK",

  /** Server returned 5xx status */
  SERVER = "SERVER",

  /** Authentication required or token expired */
  AUTH = "AUTH",

  /** Insufficient permissions */
  FORBIDDEN = "FORBIDDEN",

  /** Resource not found */
  NOT_FOUND = "NOT_FOUND",

  /** Input validation failed */
  VALIDATION = "VALIDATION",

  /** Business rule violation */
  BUSINESS_LOGIC = "BUSINESS_LOGIC",

  /** Rate limit exceeded */
  RATE_LIMIT = "RATE_LIMIT",

  /** Operation timed out */
  TIMEOUT = "TIMEOUT",

  /** Request was cancelled */
  CANCELLED = "CANCELLED",

  /** Conflict with existing state */
  CONFLICT = "CONFLICT",

  /** Unknown/unhandled error */
  UNKNOWN = "UNKNOWN",
}

/**
 * API response metadata
 */
export interface ResponseMetadata {
  requestId?: string;
  timestamp: string;
  duration?: number;
  cached?: boolean;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  metadata?: ResponseMetadata;
}

/**
 * Helper to create success result
 */
export function success<T>(data: T): Success<T> {
  return { ok: true, data };
}

/**
 * Helper to create failure result
 */
export function failure<E = DomainError>(error: E): Failure<E> {
  return { ok: false, error };
}

/**
 * Type guard for success result
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.ok === true;
}

/**
 * Type guard for failure result
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.ok === false;
}

/**
 * Unwrap result or throw error
 * Use only in contexts where exceptions are acceptable (e.g., loaders)
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.data;
  }
  throw result.error.toResponse();
}

/**
 * Map result data using transform function
 */
export function mapResult<T, U>(
  result: Result<T>,
  transform: (data: T) => U
): Result<U> {
  if (result.ok) {
    return success(transform(result.data));
  }
  return result;
}

/**
 * Combine multiple results into single result with array
 */
export async function combineResults<T>(
  results: Promise<Result<T>>[]
): Promise<Result<T[]>> {
  const resolved = await Promise.all(results);

  const data: T[] = [];
  for (const result of resolved) {
    if (!result.ok) {
      return result;
    }
    data.push(result.data);
  }

  return success(data);
}
