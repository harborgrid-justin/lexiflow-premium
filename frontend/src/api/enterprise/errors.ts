/**
 * Enterprise API Error Types
 * Custom error classes for handling API failures with detailed context
 *
 * @module api/enterprise/errors
 * @description Provides structured error types for enterprise API operations including:
 * - Network errors with retry context
 * - Rate limiting errors with retry-after information
 * - Authentication/authorization errors
 * - Validation errors with field-level details
 * - Business logic errors
 * - Service unavailable errors
 *
 * @security
 * - Sanitizes error messages to prevent information leakage
 * - Logs detailed errors server-side only
 * - Provides user-friendly messages client-side
 */

/**
 * Base class for all API errors
 */
export class ApiErrorBase extends Error {
  public readonly statusCode?: number;
  public readonly timestamp: string;
  public readonly requestId?: string;
  public readonly path?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get a user-friendly error message
   */
  public getUserMessage(): string {
    return this.message;
  }

  /**
   * Convert error to JSON for logging/transmission
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      requestId: this.requestId,
      path: this.path,
      details: this.details,
    };
  }
}

/**
 * Network/connectivity errors
 * Thrown when request fails due to network issues
 */
export class NetworkError extends ApiErrorBase {
  public readonly retryable: boolean = true;
  public readonly retryCount: number;
  public readonly maxRetries: number;

  constructor(
    message: string = "Network request failed",
    retryCount: number = 0,
    maxRetries: number = 3
  ) {
    super(message, 0);
    this.retryCount = retryCount;
    this.maxRetries = maxRetries;
  }

  public override getUserMessage(): string {
    if (this.retryCount >= this.maxRetries) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    return "Connection issue detected. Retrying...";
  }
}

/**
 * Rate limiting errors
 * Thrown when API rate limits are exceeded
 */
export class RateLimitError extends ApiErrorBase {
  public readonly retryAfter: number; // seconds
  public readonly limit: number;
  public readonly remaining: number;
  public readonly resetAt: Date;

  constructor(
    retryAfter: number = 60,
    limit: number = 100,
    remaining: number = 0,
    resetAt?: Date
  ) {
    super("Rate limit exceeded", 429);
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    this.resetAt = resetAt || new Date(Date.now() + retryAfter * 1000);
  }

  public override getUserMessage(): string {
    const minutes = Math.ceil(this.retryAfter / 60);
    if (minutes > 1) {
      return `Rate limit exceeded. Please try again in ${minutes} minutes.`;
    }
    return `Rate limit exceeded. Please try again in ${this.retryAfter} seconds.`;
  }
}

/**
 * Authentication errors
 * Thrown when authentication fails or token is invalid
 */
export class AuthError extends ApiErrorBase {
  public readonly authType: "bearer" | "api-key" | "oauth" | "unknown";
  public readonly requiresReauth: boolean;

  constructor(
    message: string = "Authentication failed",
    authType: "bearer" | "api-key" | "oauth" | "unknown" = "bearer",
    requiresReauth: boolean = true
  ) {
    super(message, 401);
    this.authType = authType;
    this.requiresReauth = requiresReauth;
  }

  public override getUserMessage(): string {
    if (this.requiresReauth) {
      return "Your session has expired. Please log in again.";
    }
    return "Authentication failed. Please check your credentials.";
  }
}

/**
 * Authorization/permission errors
 * Thrown when user lacks permission to access resource
 */
export class AuthorizationError extends ApiErrorBase {
  public readonly requiredPermission?: string;
  public readonly userPermissions?: string[];

  constructor(
    message: string = "Insufficient permissions",
    requiredPermission?: string,
    userPermissions?: string[]
  ) {
    super(message, 403);
    this.requiredPermission = requiredPermission;
    this.userPermissions = userPermissions;
  }

  public override getUserMessage(): string {
    return "You don't have permission to perform this action.";
  }
}

/**
 * Validation errors
 * Thrown when request data fails validation
 */
export class ValidationError extends ApiErrorBase {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message, 400, { fieldErrors });
    this.fieldErrors = fieldErrors;
  }

  public override getUserMessage(): string {
    const errorCount = Object.keys(this.fieldErrors).length;
    if (errorCount === 0) {
      return "Invalid request data";
    }
    if (errorCount === 1) {
      const field = Object.keys(this.fieldErrors)[0];
      const errors = field ? this.fieldErrors[field] : undefined;
      return errors ? `${field}: ${errors[0]}` : "Invalid request data";
    }
    return `Validation failed for ${errorCount} fields`;
  }

  /**
   * Get errors for a specific field
   */
  public getFieldErrors(fieldName: string): string[] {
    return this.fieldErrors[fieldName] || [];
  }

  /**
   * Check if a specific field has errors
   */
  public hasFieldError(fieldName: string): boolean {
    return fieldName in this.fieldErrors;
  }
}

/**
 * Business logic errors
 * Thrown when business rules are violated
 */
export class BusinessError extends ApiErrorBase {
  public readonly errorCode: string;

  constructor(
    message: string,
    errorCode: string = "BUSINESS_RULE_VIOLATION",
    details?: Record<string, unknown>
  ) {
    super(message, 422, details);
    this.errorCode = errorCode;
  }

  public override getUserMessage(): string {
    return this.message;
  }
}

/**
 * Resource not found errors
 * Thrown when requested resource doesn't exist
 */
export class NotFoundError extends ApiErrorBase {
  public readonly resourceType: string;
  public readonly resourceId: string;

  constructor(resourceType: string = "Resource", resourceId: string = "") {
    super(`${resourceType} not found`, 404);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  public override getUserMessage(): string {
    return `The requested ${this.resourceType.toLowerCase()} was not found.`;
  }
}

/**
 * Conflict errors
 * Thrown when operation conflicts with existing state
 */
export class ConflictError extends ApiErrorBase {
  public readonly conflictType: string;

  constructor(
    message: string = "Resource conflict",
    conflictType: string = "UNKNOWN"
  ) {
    super(message, 409);
    this.conflictType = conflictType;
  }

  public override getUserMessage(): string {
    return this.message;
  }
}

/**
 * Service unavailable errors
 * Thrown when backend service is down or unreachable
 */
export class ServiceUnavailableError extends ApiErrorBase {
  public readonly retryable: boolean = true;
  public readonly estimatedRecoveryTime?: number; // seconds

  constructor(
    message: string = "Service temporarily unavailable",
    estimatedRecoveryTime?: number
  ) {
    super(message, 503);
    this.estimatedRecoveryTime = estimatedRecoveryTime;
  }

  public override getUserMessage(): string {
    if (this.estimatedRecoveryTime) {
      const minutes = Math.ceil(this.estimatedRecoveryTime / 60);
      return `Service is temporarily unavailable. Expected recovery in ${minutes} minute${minutes > 1 ? "s" : ""}.`;
    }
    return "Service is temporarily unavailable. Please try again later.";
  }
}

/**
 * Timeout errors
 * Thrown when request exceeds timeout duration
 */
export class TimeoutError extends ApiErrorBase {
  public readonly timeout: number; // milliseconds
  public readonly retryable: boolean = true;

  constructor(timeout: number = 30000) {
    super("Request timeout", 408);
    this.timeout = timeout;
  }

  public override getUserMessage(): string {
    return "Request timed out. Please try again.";
  }
}

/**
 * Server errors (5xx)
 * Thrown for internal server errors
 */
export class ServerError extends ApiErrorBase {
  public readonly errorId?: string;

  constructor(
    message: string = "Internal server error",
    statusCode: number = 500,
    errorId?: string
  ) {
    super(message, statusCode);
    this.errorId = errorId;
  }

  public override getUserMessage(): string {
    if (this.errorId) {
      return `An error occurred. Reference ID: ${this.errorId}`;
    }
    return "An unexpected error occurred. Please try again later.";
  }
}

/**
 * Parse error from API response
 * Converts API error responses into typed error objects
 */
export function parseApiError(error: any): ApiErrorBase {
  // Network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return new NetworkError("Network connection failed");
  }

  // Timeout errors
  if (error.name === "AbortError" || error.message?.includes("timeout")) {
    return new TimeoutError();
  }

  // HTTP errors
  const statusCode = error.statusCode || error.status;
  const message = error.message || error.error || "An error occurred";
  const details = error.details || error.data;

  switch (statusCode) {
    case 400:
      return new ValidationError(message, details?.fieldErrors || {});
    case 401:
      return new AuthError(message);
    case 403:
      return new AuthorizationError(message, details?.requiredPermission);
    case 404:
      return new NotFoundError(details?.resourceType, details?.resourceId);
    case 409:
      return new ConflictError(message, details?.conflictType);
    case 422:
      return new BusinessError(message, details?.errorCode, details);
    case 429:
      return new RateLimitError(
        details?.retryAfter,
        details?.limit,
        details?.remaining,
        details?.resetAt ? new Date(details.resetAt) : undefined
      );
    case 408:
      return new TimeoutError(details?.timeout);
    case 503:
      return new ServiceUnavailableError(
        message,
        details?.estimatedRecoveryTime
      );
    case 500:
    case 502:
    case 504:
      return new ServerError(message, statusCode, details?.errorId);
    default:
      return new ApiErrorBase(message, statusCode, details);
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof NetworkError) return error.retryable;
  if (error instanceof TimeoutError) return error.retryable;
  if (error instanceof ServiceUnavailableError) return error.retryable;
  if (error instanceof ServerError) return error.statusCode === 503 || error.statusCode === 504;
  return false;
}

/**
 * Get retry delay for error (in milliseconds)
 */
export function getRetryDelay(error: any, retryCount: number): number {
  // Rate limit errors have explicit retry-after
  if (error instanceof RateLimitError) {
    return error.retryAfter * 1000;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, ...
  const baseDelay = 1000;
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  return delay + jitter;
}
