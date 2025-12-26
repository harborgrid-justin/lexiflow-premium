/**
 * Pagination-related DTOs
 * Shared between frontend and backend
 */

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
 * Filter parameters
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

/**
 * Combined query parameters for list endpoints
 */
export interface QueryParams extends PaginationParams, FilterParams {}
