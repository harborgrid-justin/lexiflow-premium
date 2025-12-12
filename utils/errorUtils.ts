import axios, { AxiosError } from 'axios';

/**
 * Error type enumeration
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error category for tracking and aggregation
 */
export interface ErrorCategory {
  type: ErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
}

/**
 * Error utilities for consistent error handling across the application
 */
class ErrorUtils {
  /**
   * Extract error message from various error types
   */
  getErrorMessage(error: any): string {
    // Axios error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      // Server responded with error
      if (axiosError.response) {
        const data = axiosError.response.data;

        // Check for various error message formats
        if (data?.error?.message) {
          return data.error.message;
        }
        if (data?.message) {
          return data.message;
        }
        if (typeof data === 'string') {
          return data;
        }

        // Default status text
        return axiosError.response.statusText || 'An error occurred';
      }

      // Request made but no response
      if (axiosError.request) {
        return 'No response from server. Please check your connection.';
      }

      // Error in request configuration
      return axiosError.message || 'Failed to make request';
    }

    // Standard Error object
    if (error instanceof Error) {
      return error.message;
    }

    // String error
    if (typeof error === 'string') {
      return error;
    }

    // Object with message property
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }

    // Fallback
    return 'An unexpected error occurred';
  }

  /**
   * Categorize error for tracking and handling
   */
  categorizeError(error: any): ErrorCategory {
    if (this.isNetworkError(error)) {
      return {
        type: ErrorType.NETWORK,
        severity: 'high',
        retryable: true,
      };
    }

    if (this.isAuthError(error)) {
      return {
        type: ErrorType.AUTH,
        severity: 'medium',
        retryable: false,
      };
    }

    if (this.isValidationError(error)) {
      return {
        type: ErrorType.VALIDATION,
        severity: 'low',
        retryable: false,
      };
    }

    if (this.isNotFoundError(error)) {
      return {
        type: ErrorType.NOT_FOUND,
        severity: 'low',
        retryable: false,
      };
    }

    if (this.isServerError(error)) {
      return {
        type: ErrorType.SERVER,
        severity: 'critical',
        retryable: true,
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      severity: 'medium',
      retryable: false,
    };
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      return !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
    }
    return false;
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      return status === 401 || status === 403;
    }
    return false;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      return status === 400 || status === 422;
    }
    return false;
  }

  /**
   * Check if error is a not found error
   */
  isNotFoundError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      return error.response?.status === 404;
    }
    return false;
  }

  /**
   * Check if error is a server error
   */
  isServerError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      return status !== undefined && status >= 500;
    }
    return false;
  }

  /**
   * Extract status code from error
   */
  getStatusCode(error: any): number | null {
    if (axios.isAxiosError(error)) {
      return error.response?.status || null;
    }
    return null;
  }

  /**
   * Extract correlation ID from error response
   */
  getCorrelationId(error: any): string | null {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      return data?.correlationId || data?.error?.correlationId || null;
    }
    return null;
  }

  /**
   * Check if error should be retried
   */
  shouldRetry(error: any, attemptCount: number, maxAttempts: number = 3): boolean {
    if (attemptCount >= maxAttempts) {
      return false;
    }

    const category = this.categorizeError(error);
    return category.retryable;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
    // Exponential backoff: baseDelay * 2^attemptCount
    const delay = baseDelay * Math.pow(2, attemptCount);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * Create error fingerprint for deduplication
   */
  getErrorFingerprint(error: any): string {
    const message = this.getErrorMessage(error);
    const statusCode = this.getStatusCode(error);
    const type = this.categorizeError(error).type;

    return `${type}-${statusCode}-${message.substring(0, 50)}`;
  }

  /**
   * Format error for logging
   */
  formatForLogging(error: any, context?: Record<string, any>): Record<string, any> {
    const category = this.categorizeError(error);

    return {
      message: this.getErrorMessage(error),
      type: category.type,
      severity: category.severity,
      statusCode: this.getStatusCode(error),
      correlationId: this.getCorrelationId(error),
      fingerprint: this.getErrorFingerprint(error),
      timestamp: new Date().toISOString(),
      context,
      ...(error instanceof Error && {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    };
  }

  /**
   * Get user-friendly error title
   */
  getUserFriendlyTitle(error: any): string {
    const category = this.categorizeError(error);

    switch (category.type) {
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.AUTH:
        return 'Authentication Required';
      case ErrorType.VALIDATION:
        return 'Invalid Input';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.SERVER:
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  /**
   * Get suggested action for error
   */
  getSuggestedAction(error: any): string {
    const category = this.categorizeError(error);

    switch (category.type) {
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      case ErrorType.AUTH:
        return 'Please log in again to continue.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.SERVER:
        return 'Our servers are experiencing issues. Please try again later.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  }
}

// Export singleton instance
export const errorUtils = new ErrorUtils();
