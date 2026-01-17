/**
 * @module types/shared
 * @category Types - Shared DTOs
 * @description Shared type definitions for API responses, DTOs, and common structures
 *
 * BEST PRACTICES:
 * - Type-safe architecture (Practice #5)
 * - Clear module boundaries (Practice #10)
 * - Centralized type definitions for consistency
 */

// ============================================================================
// BASE TYPES
// ============================================================================

import type React from "react";

/**
 * Base entity structure for all database entities
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

/**
 * Pagination request parameters (Issue #8)
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated result wrapper (Issue #8)
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error?: ApiError;
  timestamp: string;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

// ============================================================================
// QUERY & FILTER TYPES
// ============================================================================

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort configuration
 */
export interface SortConfig<T = Record<string, unknown>> {
  field: keyof T;
  direction: SortDirection;
}

/**
 * Filter operator types
 */
export type FilterOperator =
  | "eq" // equals
  | "ne" // not equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "in" // in array
  | "nin" // not in array
  | "contains" // string contains
  | "startsWith" // string starts with
  | "endsWith"; // string ends with

/**
 * Filter condition
 */
export interface FilterCondition<T = Record<string, unknown>> {
  field: keyof T;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams<T = Record<string, unknown>> {
  page?: number;
  pageSize?: number;
  sort?: SortConfig<T>;
  filters?: FilterCondition<T>[];
  search?: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Loading state for async operations
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Async operation result
 */
export interface AsyncResult<T> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Form field state
 */
export interface FieldState<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Selection state for lists
 */
export interface SelectionState<T = string> {
  selectedIds: Set<T>;
  isAllSelected: boolean;
  lastSelectedId?: T;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Custom event payload
 */
export interface CustomEventPayload<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  source?: string;
}

/**
 * Keyboard event handler type
 */
export type KeyboardHandler = (event: React.KeyboardEvent) => void;

/**
 * Mouse event handler type
 */
export type MouseHandler = (event: React.MouseEvent) => void;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validator function type
 */
export type ValidatorFn<T = unknown> = (value: T) => string | undefined;

/**
 * Validation rule
 */
export interface ValidationRule<T = unknown> {
  validator: ValidatorFn<T>;
  message?: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Standard component props with className
 */
export interface ComponentProps {
  className?: string;
  "data-testid"?: string;
}

/**
 * Props for components with children
 */
export interface WithChildren {
  children?: React.ReactNode;
}

/**
 * Props for dismissible components
 */
export interface Dismissible {
  onDismiss?: () => void;
  isDismissible?: boolean;
}

/**
 * Props for loadable components
 */
export interface Loadable {
  isLoading?: boolean;
  loadingText?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of type T that have values of type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Omit properties by value type
 */
export type OmitByType<T, V> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends V ? never : K;
  }[keyof T]
>;

/**
 * Awaited type (for promise resolution)
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;
