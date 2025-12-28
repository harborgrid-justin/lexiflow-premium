/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                   NORMALIZED ERROR TYPES                                  ║
 * ║                Domain Errors (No Transport Details)                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * @module providers/repository/errors
 * @description Domain-specific error types that abstract transport errors
 * 
 * PRINCIPLE APPLIED:
 * 5. Normalize Errors at the Provider Boundary
 * 
 * HTTP 401 → UnauthorizedError
 * HTTP 403 → ForbiddenError  
 * HTTP 404 → NotFoundError
 * HTTP 409 → ConflictError
 * Network failure → NetworkError
 * Timeout → TimeoutError
 */

// ═══════════════════════════════════════════════════════════════════════════
//                         BASE ERROR CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base repository error
 * All domain errors extend this class
 */
export class RepositoryError extends Error {
  /**
   * Error code for programmatic handling
   */
  public readonly code: string;
  
  /**
   * Additional context (NO transport details like headers)
   */
  public readonly context?: Record<string, unknown>;
  
  /**
   * Timestamp when error occurred
   */
  public readonly timestamp: string;
  
  /**
   * Whether error is retryable
   */
  public readonly retryable: boolean;
  
  constructor(
    message: string,
    code: string,
    retryable = false,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.retryable = retryable;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Convert to JSON for logging/telemetry
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         AUTHENTICATION ERRORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User is not authenticated
 * Application should redirect to login
 */
export class UnauthorizedError extends RepositoryError {
  constructor(message = 'Authentication required', context?: Record<string, unknown>) {
    super(message, 'UNAUTHORIZED', false, context);
  }
}

/**
 * User lacks permission for the operation
 * Application should show permission denied message
 */
export class ForbiddenError extends RepositoryError {
  constructor(
    message = 'Insufficient permissions',
    public readonly requiredPermission?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'FORBIDDEN', false, { ...context, requiredPermission });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         DATA ERRORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Requested entity does not exist
 */
export class NotFoundError extends RepositoryError {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    context?: Record<string, unknown>
  ) {
    super(
      `${entityType} with ID '${entityId}' not found`,
      'NOT_FOUND',
      false,
      { ...context, entityType, entityId }
    );
  }
}

/**
 * Data validation failed
 * Contains specific validation errors
 */
export class ValidationError extends RepositoryError {
  constructor(
    message: string,
    public readonly validationErrors: ValidationFailure[],
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', false, { ...context, validationErrors });
  }
}

export interface ValidationFailure {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Conflict with existing data (e.g., duplicate unique key)
 */
export class ConflictError extends RepositoryError {
  constructor(
    message: string,
    public readonly conflictingField?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'CONFLICT', false, { ...context, conflictingField });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         INFRASTRUCTURE ERRORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Network connectivity issue
 * Application should retry or show offline mode
 */
export class NetworkError extends RepositoryError {
  constructor(message = 'Network request failed', context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', true, context);
  }
}

/**
 * Operation exceeded timeout
 * Application should retry with backoff
 */
export class TimeoutError extends RepositoryError {
  constructor(
    message = 'Operation timed out',
    public readonly timeoutMs?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'TIMEOUT', true, { ...context, timeoutMs });
  }
}

/**
 * Server error (5xx)
 * Application should retry with backoff
 */
export class ServerError extends RepositoryError {
  constructor(message = 'Server error occurred', context?: Record<string, unknown>) {
    super(message, 'SERVER_ERROR', true, context);
  }
}

/**
 * Rate limit exceeded
 * Application should wait before retrying
 */
export class RateLimitError extends RepositoryError {
  constructor(
    message = 'Rate limit exceeded',
    public readonly retryAfterMs?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT', true, { ...context, retryAfterMs });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         BUSINESS LOGIC ERRORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Business rule violation
 */
export class BusinessRuleError extends RepositoryError {
  constructor(
    message: string,
    public readonly rule: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'BUSINESS_RULE_VIOLATION', false, { ...context, rule });
  }
}

/**
 * Optimistic locking failure
 */
export class ConcurrencyError extends RepositoryError {
  constructor(
    message = 'Data was modified by another user',
    context?: Record<string, unknown>
  ) {
    super(message, 'CONCURRENCY_ERROR', false, context);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         ERROR FACTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Factory to convert transport errors to domain errors
 * This is where Pattern 5 is implemented
 */
export class ErrorFactory {
  /**
   * Convert HTTP status code to domain error
   */
  static fromHttpStatus(
    status: number,
    message: string,
    context?: Record<string, unknown>
  ): RepositoryError {
    switch (status) {
      case 401:
        return new UnauthorizedError(message, context);
      case 403:
        return new ForbiddenError(message, undefined, context);
      case 404:
        return new NotFoundError(
          context?.entityType as string || 'Entity',
          context?.entityId as string || 'unknown',
          context
        );
      case 409:
        return new ConflictError(message, undefined, context);
      case 422:
        return new ValidationError(
          message,
          context?.validationErrors as ValidationFailure[] || [],
          context
        );
      case 429:
        return new RateLimitError(
          message,
          context?.retryAfterMs as number,
          context
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, context);
      default:
        return new RepositoryError(message, 'UNKNOWN_ERROR', false, { ...context, status });
    }
  }
  
  /**
   * Convert network error to domain error
   */
  static fromNetworkError(error: Error, context?: Record<string, unknown>): RepositoryError {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new TimeoutError(error.message, context?.timeoutMs as number | undefined, context);
    }
    return new NetworkError(error.message, context);
  }
  
  /**
   * Convert unknown error to domain error
   */
  static fromUnknown(error: unknown, context?: Record<string, unknown>): RepositoryError {
    if (error instanceof RepositoryError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new RepositoryError(
        error.message,
        'UNKNOWN_ERROR',
        false,
        { ...context, originalError: error.name }
      );
    }
    
    return new RepositoryError(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      false,
      { ...context, originalError: String(error) }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         ERROR HANDLER UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type guard for repository errors
 */
export function isRepositoryError(error: unknown): error is RepositoryError {
  return error instanceof RepositoryError;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return isRepositoryError(error) && error.retryable;
}

/**
 * Extract user-friendly message from error
 */
export function getUserMessage(error: unknown): string {
  if (isRepositoryError(error)) {
    // Domain errors have clean messages
    return error.message;
  }
  
  // Fallback for unexpected errors
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with appropriate severity
 */
export function getErrorSeverity(error: unknown): 'info' | 'warning' | 'error' | 'critical' {
  if (!isRepositoryError(error)) return 'error';
  
  switch (error.code) {
    case 'NOT_FOUND':
    case 'VALIDATION_ERROR':
      return 'info';
    case 'UNAUTHORIZED':
    case 'FORBIDDEN':
    case 'CONFLICT':
      return 'warning';
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      return 'warning';
    case 'SERVER_ERROR':
      return 'error';
    default:
      return 'error';
  }
}
