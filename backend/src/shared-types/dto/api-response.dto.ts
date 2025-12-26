/**
 * Standard API response formats
 * Shared between frontend and backend
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  meta?: ResponseMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string; // Only in development
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  requestId?: string;
  duration?: number;
  version?: string;
  [key: string]: unknown;
}

/**
 * Success response helper type
 */
export interface SuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Error response helper type
 */
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: ApiError;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T = unknown> {
  succeeded: T[];
  failed: BatchOperationError[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

/**
 * Batch operation error item
 */
export interface BatchOperationError {
  item: unknown;
  error: ApiError;
}
