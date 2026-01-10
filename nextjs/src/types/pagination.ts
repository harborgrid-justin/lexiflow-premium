/**
 * Pagination and Performance Types
 * Standard pagination parameters and results for all list operations
 *
 * @module types/pagination
 */

/**
 * Pagination parameters for list operations
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Search/filter query */
  search?: string;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Current page of data */
  data: T[];
  /** Pagination metadata */
  pagination: {
    /** Current page number (1-indexed) */
    page: number;
    /** Items per page */
    pageSize: number;
    /** Total number of items across all pages */
    totalItems: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there is a next page */
    hasNextPage: boolean;
    /** Whether there is a previous page */
    hasPreviousPage: boolean;
  };
  /** Sort configuration used */
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
  /** Applied filters */
  filters?: Record<string, unknown>;
}

/**
 * Cache configuration for domain services
 */
export interface CacheConfig {
  /** Cache key prefix */
  prefix: string;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Whether to cache this operation */
  enabled: boolean;
}

/**
 * Performance monitoring metrics
 */
export interface PerformanceMetrics {
  /** Operation name */
  operation: string;
  /** Execution time in milliseconds */
  duration: number;
  /** Whether result was from cache */
  cached: boolean;
  /** Timestamp of operation */
  timestamp: string;
  /** Number of items returned */
  itemCount?: number;
}
