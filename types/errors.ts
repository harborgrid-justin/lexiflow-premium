/**
 * Error type definitions for the application
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Application error interface
 */
export interface ApplicationError {
  name: string;
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  correlationId?: string;
  context?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  correlationId: string;
  error: {
    message: string;
    context?: Record<string, any>;
  };
  stack?: string;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  error: Error;
  componentStack?: string;
  correlationId: string;
  context?: Record<string, any>;
  userInfo?: {
    userId?: string;
    email?: string;
    role?: string;
  };
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  fingerprint?: string;
}

/**
 * Error report for issue tracking
 */
export interface ErrorReport {
  error: Error;
  componentStack?: string;
  correlationId: string;
  userDescription?: string;
  reproSteps?: string[];
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  environment?: ErrorEnvironment;
}

/**
 * Error environment information
 */
export interface ErrorEnvironment {
  userAgent: string;
  url: string;
  timestamp: string;
  viewport: {
    width: number;
    height: number;
  };
  platform?: string;
  language?: string;
  timezone?: string;
}

/**
 * Error tracking statistics
 */
export interface ErrorStatistics {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  byCategory: Record<ErrorCategory, number>;
  recentErrors: number;
  uniqueErrors: number;
}

/**
 * Custom application error class
 */
export class AppError extends Error implements ApplicationError {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly correlationId: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options?: {
      correlationId?: string;
      context?: Record<string, any>;
      retryable?: boolean;
      cause?: Error;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.severity = severity;
    this.correlationId = options?.correlationId || this.generateCorrelationId();
    this.context = options?.context;
    this.timestamp = new Date();
    this.retryable = options?.retryable ?? false;

    // Maintain proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // Set the cause if provided
    if (options?.cause) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
  }

  private generateCorrelationId(): string {
    return `fe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      correlationId: this.correlationId,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', options?: any) {
    super(message, ErrorCategory.NETWORK, ErrorSeverity.HIGH, {
      ...options,
      retryable: true,
    });
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error class
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed', options?: any) {
    super(message, ErrorCategory.AUTH, ErrorSeverity.MEDIUM, {
      ...options,
      retryable: false,
    });
    this.name = 'AuthError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  public readonly fields?: string[];

  constructor(
    message: string = 'Validation failed',
    fields?: string[],
    options?: any,
  ) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, {
      ...options,
      context: { ...options?.context, fields },
      retryable: false,
    });
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Server error class
 */
export class ServerError extends AppError {
  constructor(message: string = 'Server error occurred', options?: any) {
    super(message, ErrorCategory.SERVER, ErrorSeverity.CRITICAL, {
      ...options,
      retryable: true,
    });
    this.name = 'ServerError';
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;

  constructor(
    message: string = 'Resource not found',
    resourceType?: string,
    resourceId?: string | number,
    options?: any,
  ) {
    super(message, ErrorCategory.NOT_FOUND, ErrorSeverity.LOW, {
      ...options,
      context: { ...options?.context, resourceType, resourceId },
      retryable: false,
    });
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Forbidden error class
 */
export class ForbiddenError extends AppError {
  public readonly requiredPermission?: string;
  public readonly resourceType?: string;

  constructor(
    message: string = 'Access forbidden',
    requiredPermission?: string,
    resourceType?: string,
    options?: any,
  ) {
    super(message, ErrorCategory.FORBIDDEN, ErrorSeverity.MEDIUM, {
      ...options,
      context: { ...options?.context, requiredPermission, resourceType },
      retryable: false,
    });
    this.name = 'ForbiddenError';
    this.requiredPermission = requiredPermission;
    this.resourceType = resourceType;
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (isAppError(error)) {
    return error.retryable;
  }
  return false;
}

/**
 * Extract correlation ID from error
 */
export function getCorrelationId(error: any): string | null {
  if (isAppError(error)) {
    return error.correlationId;
  }
  return null;
}

/**
 * Create error from API response
 */
export function createErrorFromApiResponse(response: ApiErrorResponse): AppError {
  const category = mapStatusCodeToCategory(response.statusCode);
  const severity = mapStatusCodeToSeverity(response.statusCode);

  return new AppError(response.error.message, category, severity, {
    correlationId: response.correlationId,
    context: response.error.context,
  });
}

/**
 * Map HTTP status code to error category
 */
function mapStatusCodeToCategory(statusCode: number): ErrorCategory {
  if (statusCode === 401) return ErrorCategory.AUTH;
  if (statusCode === 403) return ErrorCategory.FORBIDDEN;
  if (statusCode === 404) return ErrorCategory.NOT_FOUND;
  if (statusCode >= 400 && statusCode < 500) return ErrorCategory.VALIDATION;
  if (statusCode >= 500) return ErrorCategory.SERVER;
  return ErrorCategory.UNKNOWN;
}

/**
 * Map HTTP status code to error severity
 */
function mapStatusCodeToSeverity(statusCode: number): ErrorSeverity {
  if (statusCode >= 500) return ErrorSeverity.CRITICAL;
  if (statusCode === 401 || statusCode === 403) return ErrorSeverity.MEDIUM;
  if (statusCode >= 400) return ErrorSeverity.LOW;
  return ErrorSeverity.MEDIUM;
}
