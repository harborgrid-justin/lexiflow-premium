/**
 * Action Errors - Shared Error Classes
 *
 * This file contains error classes and types that can be imported by both
 * client and server code. It does NOT have 'use server' directive.
 */

import { ZodError, type ZodSchema } from "zod";

/**
 * Custom error class for action errors with error codes
 */
export class ActionError extends Error {
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    code = "ACTION_ERROR",
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ActionError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Standard action result type - discriminated union for type-safe error handling
 */
export type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | {
      success: false;
      error: string;
      code?: string;
      details?: Record<string, string[]>;
    };

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly lastPage: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResult<T> {
  readonly data: T[];
  readonly meta: PaginationMeta;
}

/**
 * Action context with auth and request info
 */
export interface ActionContext {
  readonly userId: string | null;
  readonly organizationId: string | null;
  readonly sessionId: string | null;
  readonly isAuthenticated: boolean;
  readonly userAgent: string | null;
  readonly ip: string | null;
}

/**
 * Cache profile for revalidation
 * Next.js 16 requires a profile as second argument to revalidateTag
 */
export type CacheProfile = "default" | "fast" | "slow" | "realtime";

/**
 * Action options for the wrapper
 */
export interface ActionOptions {
  /** Require authentication for this action */
  requireAuth?: boolean;
  /** Required permissions for this action */
  requiredPermissions?: string[];
  /** Cache tags to invalidate on success */
  revalidateTags?: string[];
  /** Cache profile for revalidation */
  cacheProfile?: CacheProfile;
  /** Custom error message for auth failures */
  authErrorMessage?: string;
  /** Enable audit logging */
  auditLog?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a failure result
 */
export function failure<T>(
  error: string,
  code?: string,
  details?: Record<string, string[]>
): ActionResult<T> {
  return { success: false, error, code, details };
}

/**
 * Create a success result
 */
export function success<T>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

/**
 * Build cache tag with entity prefix
 */
export function buildTag(entity: string, id?: string): string {
  return id ? `${entity}:${id}` : entity;
}

/**
 * Build multiple cache tags for an entity
 */
export function buildTags(entity: string, ids: string[]): string[] {
  return [entity, ...ids.map((id) => buildTag(entity, id))];
}

/**
 * Extract form data into a typed object
 */
export function extractFormData<T extends Record<string, unknown>>(
  formData: FormData,
  fields: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};

  for (const field of fields) {
    const value = formData.get(field as string);
    if (value !== null) {
      // Handle file uploads separately
      if (value instanceof File) {
        (result as Record<string, unknown>)[field as string] = value;
      } else {
        // Try to parse as JSON for complex types
        try {
          (result as Record<string, unknown>)[field as string] =
            JSON.parse(value);
        } catch {
          (result as Record<string, unknown>)[field as string] = value;
        }
      }
    }
  }

  return result;
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(
  result: ActionResult<T>
): result is { success: true; data: T; message?: string } {
  return result.success === true;
}

/**
 * Type guard to check if result is failure
 */
export function isFailure<T>(result: ActionResult<T>): result is {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
} {
  return result.success === false;
}

/**
 * Unwrap a successful result or throw
 */
export function unwrapResult<T>(result: ActionResult<T>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw new ActionError(result.error, result.code, result.details);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Convert Zod validation errors to a details record
 */
export function zodErrorToDetails(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(issue.message);
  }

  return details;
}

/**
 * Validate input data against a Zod schema
 * Returns ActionResult with validation errors on failure
 */
export function validateInput<T>(
  schema: ZodSchema<T>,
  data: unknown
): ActionResult<T> {
  try {
    const validated = schema.parse(data);
    return success(validated);
  } catch (error) {
    if (error instanceof ZodError) {
      return failure(
        "Validation failed",
        "VALIDATION_ERROR",
        zodErrorToDetails(error)
      );
    }
    return failure("Invalid input data", "VALIDATION_ERROR");
  }
}

/**
 * Validate and transform input, throwing ActionError on failure
 * Use this when you want to short-circuit on validation errors
 */
export function parseInput<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ActionError(
        "Validation failed",
        "VALIDATION_ERROR",
        zodErrorToDetails(error)
      );
    }
    throw new ActionError("Invalid input data", "VALIDATION_ERROR");
  }
}
