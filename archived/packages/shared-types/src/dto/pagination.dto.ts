/**
 * Pagination-related DTOs
 * Shared between frontend and backend
 */

import { JsonValue } from '../common/json-value.types';

/**
 * Paginated response wrapper
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
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base filter parameters
 */
export interface BaseFilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Extended filter parameters with dynamic fields
 */
export interface FilterParams extends BaseFilterParams {
  [key: string]: JsonValue | undefined;
}

/**
 * Combined query parameters for list endpoints
 */
export interface QueryParams extends PaginationParams, FilterParams {}
