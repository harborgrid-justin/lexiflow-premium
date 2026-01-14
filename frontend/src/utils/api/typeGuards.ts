/**
 * Type Guards and Response Validators for API
 *
 * @module typeGuards
 * @description Runtime type checking and validation for API responses
 * Provides:
 * - Type guard functions for common response types
 * - Paginated response validators
 * - Error response validators
 * - Success response validators
 * - TypeScript type narrowing
 */

import type {
  ApiError,
  PaginatedResponse,
} from "@/services/infrastructure/api-client.service";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Check if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Check if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Check if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Check if value is a valid date string
 */
export function isDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Check if response is a valid API error
 */
export function isApiError(error: unknown): error is ApiError {
  if (!isObject(error)) return false;

  return (
    "message" in error &&
    isString(error.message) &&
    "statusCode" in error &&
    isNumber(error.statusCode)
  );
}

/**
 * Check if response is a valid API success response
 */
export function isApiResponse<T>(
  response: unknown
): response is ApiResponse<T> {
  if (!isObject(response)) return false;

  return (
    "success" in response && isBoolean(response.success) && "data" in response
  );
}

/**
 * Check if response is a paginated response
 */
export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  if (!isObject(response)) return false;

  return (
    "data" in response &&
    isArray(response.data) &&
    "total" in response &&
    isNumber(response.total) &&
    "page" in response &&
    isNumber(response.page) &&
    "limit" in response &&
    isNumber(response.limit) &&
    "totalPages" in response &&
    isNumber(response.totalPages)
  );
}

/**
 * Validate paginated response structure
 *
 * @throws Error if response is invalid
 */
export function validatePaginatedResponse<T>(
  response: unknown
): asserts response is PaginatedResponse<T> {
  if (!isPaginatedResponse(response)) {
    throw new Error("Invalid paginated response structure");
  }

  if (response.page < 1) {
    throw new Error("Page number must be >= 1");
  }

  if (response.limit < 1) {
    throw new Error("Limit must be >= 1");
  }

  if (response.total < 0) {
    throw new Error("Total must be >= 0");
  }

  if (response.totalPages < 0) {
    throw new Error("Total pages must be >= 0");
  }
}

/**
 * Validate API response structure
 *
 * @throws Error if response is invalid
 */
export function validateApiResponse<T>(
  response: unknown
): asserts response is ApiResponse<T> {
  if (!isApiResponse(response)) {
    throw new Error("Invalid API response structure");
  }

  if (!response.success && !response.data) {
    throw new Error("Failed response must contain error information");
  }
}

/**
 * Check if value has required properties
 */
export function hasProperties<T extends string>(
  obj: unknown,
  ...props: T[]
): obj is Record<T, unknown> {
  if (!isObject(obj)) return false;
  return props.every((prop) => prop in obj);
}

/**
 * Check if all array items match a type guard
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard);
}

/**
 * Type guard for ID (string or number)
 */
export function isId(value: unknown): value is string | number {
  return isString(value) || isNumber(value);
}

/**
 * Type guard for UUID string
 */
export function isUuid(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard for email string
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard for URL string
 */
export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for enum value
 */
export function isEnumValue<T extends string | number>(
  value: unknown,
  enumObj: Record<string, T>
): value is T {
  return Object.values(enumObj).includes(value as T);
}

/**
 * Safely extract data from API response
 *
 * @param response - API response
 * @returns Data or null
 */
export function extractData<T>(response: unknown): T | null {
  if (isApiResponse<T>(response)) {
    return response.data;
  }

  if (isPaginatedResponse<T>(response)) {
    return response.data as unknown as T;
  }

  return null;
}

/**
 * Safely extract error from response
 *
 * @param error - Error response
 * @returns ApiError or Error
 */
export function extractError(error: unknown): Error {
  if (isApiError(error)) {
    return new Error(error.message);
  }

  if (error instanceof Error) {
    return error;
  }

  if (isObject(error) && "message" in error && isString(error.message)) {
    return new Error(error.message);
  }

  return new Error("An unknown error occurred");
}

/**
 * Assert that value is not null or undefined
 *
 * @throws Error if value is null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = "Value is null or undefined"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Assert that value is truthy
 *
 * @throws Error if value is falsy
 */
export function assertTruthy<T>(
  value: T,
  message: string = "Value is falsy"
): asserts value is NonNullable<T> {
  if (!value) {
    throw new Error(message);
  }
}

/**
 * Safely parse JSON with type guard
 */
export function safeJsonParse<T>(
  json: string,
  guard: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Create a type guard from a schema validator
 */
export function createTypeGuard<T>(
  validator: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => validator(value);
}

/**
 * Validate and transform response data
 */
export function validateAndTransform<TInput, TOutput>(
  data: unknown,
  validator: (value: unknown) => value is TInput,
  transformer: (value: TInput) => TOutput
): TOutput {
  if (!validator(data)) {
    throw new Error("Data validation failed");
  }
  return transformer(data);
}

/**
 * Type guard for partial object (all properties optional)
 */
export function isPartial<T extends Record<string, unknown>>(
  obj: unknown,
  requiredProps: (keyof T)[]
): obj is Partial<T> {
  if (!isObject(obj)) return false;
  // Partial means some or all properties may be present
  return requiredProps.some((prop) => prop in obj);
}

/**
 * Type guard for complete object (all properties required)
 */
export function isComplete<T extends Record<string, unknown>>(
  obj: unknown,
  requiredProps: (keyof T)[]
): obj is T {
  if (!isObject(obj)) return false;
  return requiredProps.every(
    (prop) =>
      prop in obj && (obj as Record<keyof T, unknown>)[prop] !== undefined
  );
}

/**
 * Check if response indicates success
 */
export function isSuccessResponse(response: unknown): boolean {
  if (isApiResponse(response)) {
    return response.success === true;
  }

  if (isObject(response)) {
    return !("error" in response) && !("statusCode" in response);
  }

  return false;
}

/**
 * Check if response indicates error
 */
export function isErrorResponse(response: unknown): boolean {
  return (
    isApiError(response) ||
    (isApiResponse(response) && response.success === false)
  );
}
