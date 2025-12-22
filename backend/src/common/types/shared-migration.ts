/**
 * Shared Type Definitions for Backend
 *
 * This file defines enterprise-grade shared types that ensure type safety
 * and consistency across the backend application. These types align with
 * frontend API contracts to maintain consistency across the full stack.
 *
 * @module SharedTypes
 */

/**
 * Helper type for converting shared entity interfaces to TypeORM entities
 * TypeORM entities will:
 * 1. Implement the shared interface
 * 2. Add TypeORM decorators (@Entity, @Column, etc.)
 * 3. Use Date objects internally (automatically converted to ISO strings in responses)
 */
export type TypeORMEntity<T> = T & {
  // TypeORM entities can have Date objects that get serialized to strings
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

/**
 * Generic API Response wrapper for consistent response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  requestId?: string;
}

/**
 * Response metadata for tracking and debugging
 */
export interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  version?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: PaginationMetadata;
  error?: ApiError;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Base filter parameters for list endpoints
 */
export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
