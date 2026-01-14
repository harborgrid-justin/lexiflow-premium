/**
 * Frontend API Domain Error Classes
 * Structured error types for UI consumption
 *
 * @module lib/frontend-api/errors
 * @description Domain-first error model per enterprise spec XI:
 * - DomainError: Typed, structured errors for UI
 * - No HTTP codes in components
 * - User-friendly messages
 * - Recoverable vs non-recoverable classification
 * - Safe for serialization
 *
 * RULES:
 * - Raw errors are for logs only
 * - Domain errors are for UI
 * - Components never switch on HTTP codes
 * - All errors sanitized before reaching UI
 *
 * @example
 * ```typescript
 * // Map backend error to domain error
 * function mapError(response: Response): DomainError {
 *   if (response.status === 404) {
 *     return new NotFoundError('Report not found');
 *   }
 *   return new ServerError('Failed to load report');
 * }
 * ```
 */

import {
  ErrorType,
  DomainError as IDomainError,
  type FieldError,
} from "./types";

/**
 * Base domain error class
 * All API errors inherit from this
 */
export class DomainError extends Error implements IDomainError {
  public readonly type: ErrorType;
  public readonly recoverable: boolean;
  public readonly status?: number;
  public readonly details?: Record<string, unknown>;
  public readonly code?: string;
  public readonly retryAfter?: number;
  public readonly fieldErrors?: FieldError[];
  public readonly timestamp: string;

  constructor(
    type: ErrorType,
    message: string,
    options: {
      recoverable?: boolean;
      status?: number;
      details?: Record<string, unknown>;
      code?: string;
      retryAfter?: number;
      fieldErrors?: FieldError[];
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.message = message;
    this.recoverable = options.recoverable ?? false;
    this.status = options.status;
    this.details = options.details;
    this.code = options.code;
    this.retryAfter = options.retryAfter;
    this.fieldErrors = options.fieldErrors;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert to HTTP Response for throwing in loaders
   */
  toResponse(): Response {
    return new Response(
      JSON.stringify({
        error: {
          type: this.type,
          message: this.message,
          code: this.code,
          fieldErrors: this.fieldErrors,
        },
      }),
      {
        status: this.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  /**
   * Serialize for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      recoverable: this.recoverable,
      status: this.status,
      code: this.code,
      timestamp: this.timestamp,
      details: this.details,
      fieldErrors: this.fieldErrors,
    };
  }
}

/**
 * Network connectivity error
 * Network issues, DNS failures, connection refused
 */
export class NetworkError extends DomainError {
  constructor(
    message: string = "Unable to connect to server. Please check your connection.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.NETWORK, message, {
      recoverable: true,
      details,
    });
  }
}

/**
 * Server error (5xx responses)
 * Internal server errors, service unavailable
 */
export class ServerError extends DomainError {
  constructor(
    message: string = "Server error. Please try again later.",
    status: number = 500,
    details?: Record<string, unknown>
  ) {
    super(ErrorType.SERVER, message, {
      recoverable: true,
      status,
      details,
    });
  }
}

/**
 * Authentication error
 * Missing or expired credentials
 */
export class AuthError extends DomainError {
  constructor(
    message: string = "Authentication required. Please sign in.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.AUTH, message, {
      recoverable: false,
      status: 401,
      details,
    });
  }
}

/**
 * Authorization error
 * Insufficient permissions for resource
 */
export class ForbiddenError extends DomainError {
  constructor(
    message: string = "You don't have permission to access this resource.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.FORBIDDEN, message, {
      recoverable: false,
      status: 403,
      details,
    });
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends DomainError {
  constructor(
    message: string = "The requested resource was not found.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.NOT_FOUND, message, {
      recoverable: false,
      status: 404,
      details,
    });
  }
}

/**
 * Validation error
 * Input validation failures with field-level errors
 */
export class ValidationError extends DomainError {
  constructor(
    message: string = "Validation failed. Please check your input.",
    fieldErrors?: FieldError[],
    details?: Record<string, unknown>
  ) {
    super(ErrorType.VALIDATION, message, {
      recoverable: true,
      status: 400,
      fieldErrors,
      details,
    });
  }
}

/**
 * Business logic error
 * Domain rules violation
 */
export class BusinessLogicError extends DomainError {
  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(ErrorType.BUSINESS_LOGIC, message, {
      recoverable: false,
      status: 422,
      code,
      details,
    });
  }
}

/**
 * Rate limit error
 * Too many requests
 */
export class RateLimitError extends DomainError {
  constructor(
    message: string = "Too many requests. Please slow down.",
    retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(ErrorType.RATE_LIMIT, message, {
      recoverable: true,
      status: 429,
      retryAfter,
      details,
    });
  }
}

/**
 * Timeout error
 * Request exceeded time limit
 */
export class TimeoutError extends DomainError {
  constructor(
    message: string = "Request timed out. Please try again.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.TIMEOUT, message, {
      recoverable: true,
      status: 408,
      details,
    });
  }
}

/**
 * Cancelled error
 * Request was manually cancelled
 */
export class CancelledError extends DomainError {
  constructor(
    message: string = "Request was cancelled.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.CANCELLED, message, {
      recoverable: false,
      details,
    });
  }
}

/**
 * Conflict error
 * Resource state conflict (optimistic concurrency failure)
 */
export class ConflictError extends DomainError {
  constructor(
    message: string = "Conflict with existing data. Please refresh and try again.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.CONFLICT, message, {
      recoverable: true,
      status: 409,
      details,
    });
  }
}

/**
 * Unknown error
 * Catch-all for unhandled errors
 */
export class UnknownError extends DomainError {
  constructor(
    message: string = "An unexpected error occurred.",
    details?: Record<string, unknown>
  ) {
    super(ErrorType.UNKNOWN, message, {
      recoverable: false,
      status: 500,
      details,
    });
  }
}

/**
 * Map HTTP status code to domain error
 * Used by client to convert backend responses
 */
export function mapHttpStatusToError(
  status: number,
  message?: string,
  details?: Record<string, unknown>
): DomainError {
  switch (status) {
    case 400:
      return new ValidationError(message, undefined, details);
    case 401:
      return new AuthError(message, details);
    case 403:
      return new ForbiddenError(message, details);
    case 404:
      return new NotFoundError(message, details);
    case 408:
      return new TimeoutError(message, details);
    case 409:
      return new ConflictError(message, details);
    case 422:
      return new BusinessLogicError(
        message || "Business logic error",
        undefined,
        details
      );
    case 429:
      return new RateLimitError(message, undefined, details);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status, details);
    default:
      if (status >= 500) {
        return new ServerError(message, status, details);
      }
      return new UnknownError(message, details);
  }
}

/**
 * Map fetch error to domain error
 * Used by client for network failures
 */
export function mapFetchError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.name === "TypeError" || error.message.includes("fetch")) {
      return new NetworkError(error.message, { originalError: error.message });
    }

    // Timeout errors
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return new TimeoutError(error.message, { originalError: error.message });
    }

    // Generic error
    return new UnknownError(error.message, { originalError: error.message });
  }

  return new UnknownError("An unexpected error occurred", { error });
}

/**
 * Extract field errors from backend validation response
 */
export function extractFieldErrors(
  backendErrors: unknown
): FieldError[] | undefined {
  if (!backendErrors || typeof backendErrors !== "object") {
    return undefined;
  }

  const errors = backendErrors as Record<string, unknown>;

  // Handle array format: [{ field, message }]
  if (Array.isArray(errors)) {
    return errors
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        field: String((e as Record<string, unknown>).field || ""),
        message: String((e as Record<string, unknown>).message || ""),
        code: (e as Record<string, unknown>).code
          ? String((e as Record<string, unknown>).code)
          : undefined,
      }));
  }

  // Handle object format: { field: message }
  if (typeof errors === "object") {
    return Object.entries(errors).map(([field, message]) => ({
      field,
      message: String(message),
    }));
  }

  return undefined;
}
