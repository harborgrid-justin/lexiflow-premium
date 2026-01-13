/**
 * Standard API response formats
 * Shared between frontend and backend
 */

import { JsonValue, ErrorDetails } from '../common/json-value.types';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = JsonValue> {
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
  details?: ErrorDetails;
  stack?: string; // Only in development
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  requestId?: string;
  duration?: number;
  version?: string;
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: JsonValue | undefined;
}

/**
 * Success response helper type
 */
export interface SuccessResponse<T = JsonValue> extends ApiResponse<T> {
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
export interface BatchOperationResult<T = JsonValue> {
  succeeded: T[];
  failed: BatchOperationError<T>[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

/**
 * Batch operation error item
 */
export interface BatchOperationError<T = JsonValue> {
  item: T;
  error: ApiError;
}
