/**
 * Custom Error Types for API Calls
 * Provides detailed error handling and classification
 */

import { AxiosError } from 'axios';

/**
 * Base API Error Class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly path?: string;
  public readonly method?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication Errors
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, true, details);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message: string = 'Token has expired') {
    super(message);
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message: string = 'Invalid token provided') {
    super(message);
  }
}

/**
 * Authorization Errors
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(message, 403, true, details);
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends ApiError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string = 'Validation failed', errors: Record<string, string[]> = {}) {
    super(message, 422, true, { errors });
    this.errors = errors;
  }
}

/**
 * Not Found Errors
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 404, true);
  }
}

/**
 * Conflict Errors
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, true, details);
  }
}

/**
 * Rate Limiting Errors
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429, true, { retryAfter });
    this.retryAfter = retryAfter;
  }
}

/**
 * Network Errors
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred', details?: any) {
    super(message, 0, true, details);
  }
}

/**
 * Server Errors
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error', statusCode: number = 500, details?: any) {
    super(message, statusCode, false, details);
  }
}

/**
 * Timeout Errors
 */
export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timeout', details?: any) {
    super(message, 408, true, details);
  }
}

/**
 * Service Unavailable Errors
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable', details?: any) {
    super(message, 503, true, details);
  }
}

/**
 * File Upload Errors
 */
export class FileUploadError extends ApiError {
  constructor(message: string = 'File upload failed', details?: any) {
    super(message, 400, true, details);
  }
}

/**
 * Bad Request Errors
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, true, details);
  }
}

/**
 * Error Factory - Converts AxiosError to custom error types
 */
export function createApiError(error: unknown): ApiError {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status || 0;
    const message = axiosError.response?.data?.message || axiosError.message;
    const details = axiosError.response?.data;

    // Network errors
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return new TimeoutError(message, details);
      }
      return new NetworkError(message, details);
    }

    // Map status codes to error types
    switch (status) {
      case 400:
        return new BadRequestError(message, details);
      case 401:
        if (message.toLowerCase().includes('expired')) {
          return new TokenExpiredError(message);
        }
        if (message.toLowerCase().includes('invalid token')) {
          return new InvalidTokenError(message);
        }
        return new AuthenticationError(message, details);
      case 403:
        return new AuthorizationError(message, details);
      case 404:
        return new NotFoundError(
          details?.resource || 'Resource',
          details?.id
        );
      case 409:
        return new ConflictError(message, details);
      case 422:
        return new ValidationError(message, details?.errors || {});
      case 429:
        const retryAfter = axiosError.response?.headers['retry-after'];
        return new RateLimitError(message, retryAfter ? parseInt(retryAfter) : undefined);
      case 503:
        return new ServiceUnavailableError(message, details);
      default:
        if (status >= 500) {
          return new ServerError(message, status, details);
        }
        return new ApiError(message, status, true, details);
    }
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return error;
  }

  // Handle standard errors
  if (error instanceof Error) {
    return new ApiError(error.message, 500, false);
  }

  // Handle unknown errors
  return new ApiError('An unexpected error occurred', 500, false);
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Error Logger
 */
export function logError(error: ApiError, context?: Record<string, any>): void {
  const errorLog = {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    path: error.path,
    method: error.method,
    details: error.details,
    context,
    stack: error.stack,
  };

  if (error.isOperational) {
    console.warn('[API Error]', errorLog);
  } else {
    console.error('[API Critical Error]', errorLog);
  }

  // Send to error reporting service in production
  if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
    // TODO: Integrate with error reporting service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorLog });
  }
}

/**
 * Error Handler Utility
 */
export function handleApiError(error: unknown): never {
  const apiError = createApiError(error);
  logError(apiError);
  throw apiError;
}

/**
 * User-friendly error messages
 */
export function getUserFriendlyMessage(error: ApiError): string {
  const messages: Record<string, string> = {
    [AuthenticationError.name]: 'Please log in to continue.',
    [TokenExpiredError.name]: 'Your session has expired. Please log in again.',
    [InvalidTokenError.name]: 'Invalid authentication. Please log in again.',
    [AuthorizationError.name]: 'You do not have permission to perform this action.',
    [ValidationError.name]: 'Please check your input and try again.',
    [NotFoundError.name]: 'The requested resource was not found.',
    [ConflictError.name]: 'This operation conflicts with existing data.',
    [RateLimitError.name]: 'Too many requests. Please try again later.',
    [NetworkError.name]: 'Network connection failed. Please check your internet connection.',
    [ServerError.name]: 'A server error occurred. Please try again later.',
    [TimeoutError.name]: 'Request timed out. Please try again.',
    [ServiceUnavailableError.name]: 'Service is temporarily unavailable. Please try again later.',
    [FileUploadError.name]: 'File upload failed. Please try again.',
    [BadRequestError.name]: 'Invalid request. Please check your input.',
  };

  return messages[error.name] || error.message || 'An unexpected error occurred.';
}

/**
 * Retry Helper - Determines if an error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  const retryableErrors = [
    NetworkError,
    TimeoutError,
    ServiceUnavailableError,
    RateLimitError,
  ];

  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];

  return (
    retryableErrors.some(ErrorClass => error instanceof ErrorClass) ||
    retryableStatusCodes.includes(error.statusCode)
  );
}

/**
 * Error Response Type for API responses
 */
export interface ErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    statusCode: number;
    timestamp: Date;
    details?: any;
    userMessage: string;
  };
}

/**
 * Convert ApiError to ErrorResponse
 */
export function toErrorResponse(error: ApiError): ErrorResponse {
  return {
    success: false,
    error: {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      details: error.details,
      userMessage: getUserFriendlyMessage(error),
    },
  };
}
