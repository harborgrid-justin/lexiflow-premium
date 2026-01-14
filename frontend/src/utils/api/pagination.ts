/**
 * Pagination Utilities for API Requests
 *
 * @module pagination
 * @description Helper functions and types for handling paginated API responses
 * Provides:
 * - Pagination parameter builders
 * - Page calculation utilities
 * - Offset/limit conversions
 * - TypeScript type safety
 * - URL query parameter generation
 */

import type { PaginatedResponse } from "@/services/infrastructure/api-client.service";

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;
export const MAX_PAGE_SIZE = 100;

/**
 * Build pagination query parameters
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Object with page and limit
 *
 * @example
 * ```ts
 * const params = buildPaginationParams(2, 20);
 * // { page: 2, limit: 20 }
 * ```
 */
export function buildPaginationParams(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_PAGE_SIZE
): { page: number; limit: number } {
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_PAGE_SIZE);

  return {
    page: validPage,
    limit: validLimit,
  };
}

/**
 * Convert page/limit to offset/limit
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Object with offset and limit
 *
 * @example
 * ```ts
 * const params = pageToOffset(2, 20);
 * // { offset: 20, limit: 20 }
 * ```
 */
export function pageToOffset(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_PAGE_SIZE
): { offset: number; limit: number } {
  const { page: validPage, limit: validLimit } = buildPaginationParams(
    page,
    limit
  );
  const offset = (validPage - 1) * validLimit;

  return {
    offset,
    limit: validLimit,
  };
}

/**
 * Convert offset/limit to page/limit
 *
 * @param offset - Item offset
 * @param limit - Items per page
 * @returns Object with page and limit
 *
 * @example
 * ```ts
 * const params = offsetToPage(20, 20);
 * // { page: 2, limit: 20 }
 * ```
 */
export function offsetToPage(
  offset: number = 0,
  limit: number = DEFAULT_PAGE_SIZE
): { page: number; limit: number } {
  const validOffset = Math.max(0, Math.floor(offset));
  const validLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_PAGE_SIZE);
  const page = Math.floor(validOffset / validLimit) + 1;

  return {
    page,
    limit: validLimit,
  };
}

/**
 * Calculate pagination metadata from paginated response
 *
 * @param response - Paginated API response
 * @returns Pagination metadata
 *
 * @example
 * ```ts
 * const meta = getPaginationMeta(response);
 * // {
 * //   currentPage: 2,
 * //   totalPages: 10,
 * //   pageSize: 20,
 * //   totalItems: 200,
 * //   hasNextPage: true,
 * //   hasPreviousPage: true,
 * //   startIndex: 21,
 * //   endIndex: 40
 * // }
 * ```
 */
export function getPaginationMeta<T>(
  response: PaginatedResponse<T>
): PaginationMeta {
  const { page, limit, total, totalPages } = response;

  const currentPage = Math.max(1, page);
  const pageSize = Math.max(1, limit);
  const totalItems = Math.max(0, total);
  const calculatedTotalPages = Math.max(
    1,
    totalPages || Math.ceil(totalItems / pageSize)
  );

  const hasNextPage = currentPage < calculatedTotalPages;
  const hasPreviousPage = currentPage > 1;

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    totalPages: calculatedTotalPages,
    pageSize,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  };
}

/**
 * Generate page numbers for pagination UI
 *
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum visible page numbers (default: 7)
 * @returns Array of page numbers to display
 *
 * @example
 * ```ts
 * getPageNumbers(5, 10, 7);
 * // [1, '...', 4, 5, 6, '...', 10]
 * ```
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): (number | string)[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  let startPage = Math.max(2, currentPage - halfVisible);
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust if near beginning
  if (currentPage <= halfVisible + 1) {
    endPage = maxVisible - 1;
  }

  // Adjust if near end
  if (currentPage >= totalPages - halfVisible) {
    startPage = totalPages - maxVisible + 2;
  }

  // Add ellipsis after first page if needed
  if (startPage > 2) {
    pages.push("...");
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Get next page number
 *
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @returns Next page number or null if on last page
 */
export function getNextPage(
  currentPage: number,
  totalPages: number
): number | null {
  return currentPage < totalPages ? currentPage + 1 : null;
}

/**
 * Get previous page number
 *
 * @param currentPage - Current page number
 * @returns Previous page number or null if on first page
 */
export function getPreviousPage(currentPage: number): number | null {
  return currentPage > 1 ? currentPage - 1 : null;
}

/**
 * Build URL query string from pagination parameters
 *
 * @param params - Pagination parameters
 * @returns URL query string
 *
 * @example
 * ```ts
 * buildPaginationQuery({ page: 2, limit: 20 });
 * // "page=2&limit=20"
 * ```
 */
export function buildPaginationQuery(params: PaginationParams): string {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) {
    queryParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    queryParams.set("limit", String(params.limit));
  }

  if (params.offset !== undefined) {
    queryParams.set("offset", String(params.offset));
  }

  return queryParams.toString();
}

/**
 * Merge multiple paginated responses
 * Useful for infinite scroll
 *
 * @param responses - Array of paginated responses
 * @returns Merged paginated response
 */
export function mergePaginatedResponses<T>(
  responses: PaginatedResponse<T>[]
): PaginatedResponse<T> {
  if (responses.length === 0) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      totalPages: 1,
    };
  }

  const data = responses.flatMap((r) => r.data);
  const lastResponse = responses[responses.length - 1];

  if (!lastResponse) {
    return {
      data,
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }

  return {
    data,
    total: lastResponse.total,
    page: lastResponse.page,
    limit: lastResponse.limit,
    totalPages: lastResponse.totalPages,
  };
}

/**
 * Extract items for current page from full dataset
 *
 * @param items - Full dataset
 * @param page - Page number
 * @param limit - Items per page
 * @returns Paginated response
 */
export function paginateArray<T>(
  items: T[],
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_PAGE_SIZE
): PaginatedResponse<T> {
  const { page: validPage, limit: validLimit } = buildPaginationParams(
    page,
    limit
  );
  const { offset } = pageToOffset(validPage, validLimit);

  const data = items.slice(offset, offset + validLimit);
  const total = items.length;
  const totalPages = Math.ceil(total / validLimit);

  return {
    data,
    total,
    page: validPage,
    limit: validLimit,
    totalPages,
  };
}
