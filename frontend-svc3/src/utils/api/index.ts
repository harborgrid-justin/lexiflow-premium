/**
 * API Utilities - Barrel Export
 *
 * @module api
 * @description Centralized export for all API utility functions
 * Provides:
 * - Pagination helpers
 * - Filter builders
 * - Type guards and validators
 * - Query key factories
 */

// Pagination utilities
export * from './pagination';
export {
  buildPaginationParams,
  pageToOffset,
  offsetToPage,
  getPaginationMeta,
  getPageNumbers,
  getNextPage,
  getPreviousPage,
  buildPaginationQuery,
  mergePaginatedResponses,
  paginateArray,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  MAX_PAGE_SIZE,
} from './pagination';

// Filter utilities
export * from './filters';
export {
  cleanFilterParams,
  buildSearchFilter,
  buildSortFilter,
  buildDateRangeFilter,
  buildStatusFilter,
  buildTagFilter,
  buildBooleanFilter,
  buildEnumFilter,
  mergeFilters,
  buildFilters,
  parseFilterArray,
  isValidDateRange,
  buildFilterQuery,
  parseFilterQuery,
  areFiltersEqual,
  createFilterPreset,
  COMMON_FILTER_PRESETS,
} from './filters';

// Type guards and validators
export * from './typeGuards';
export {
  isObject,
  isArray,
  isString,
  isNumber,
  isBoolean,
  isDateString,
  isApiError,
  isApiResponse,
  isPaginatedResponse,
  validatePaginatedResponse,
  validateApiResponse,
  hasProperties,
  isArrayOf,
  isId,
  isUuid,
  isEmail,
  isUrl,
  isEnumValue,
  extractData,
  extractError,
  assertDefined,
  assertTruthy,
  safeJsonParse,
  createTypeGuard,
  validateAndTransform,
  isPartial,
  isComplete,
  isSuccessResponse,
  isErrorResponse,
} from './typeGuards';

// Common types
export type { FilterParams, DateRangeFilter, StatusFilter, TagFilter } from './filters';
export type { PaginationParams, PaginationMeta } from './pagination';
export type { ApiResponse } from './typeGuards';
