import { AxiosError } from 'axios';

/**
 * API Error Interceptor for LexiFlow Frontend
 *
 * Handles API errors with:
 * - Error categorization and formatting
 * - User-friendly error messages
 * - Error logging and reporting
 * - Automatic token refresh on 401
 * - Network error handling
 */

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
  originalError?: any;
  timestamp: Date;
  requestId?: string;
}

export interface ErrorHandler {
  match: (error: AxiosError) => boolean;
  handle: (error: AxiosError) => ApiError;
}

class ErrorInterceptor {
  private handlers: ErrorHandler[] = [];
  private errorCallbacks: Array<(error: ApiError) => void> = [];

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * Register default error handlers
   */
  private registerDefaultHandlers(): void {
    // 400 Bad Request
    this.registerHandler({
      match: (error) => error.response?.status === 400,
      handle: (error) => ({
        code: 'BAD_REQUEST',
        message: this.extractErrorMessage(error) || 'Invalid request. Please check your input.',
        details: error.response?.data,
        status: 400,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });

    // 401 Unauthorized
    this.registerHandler({
      match: (error) => error.response?.status === 401,
      handle: (error) => {
        this.handleUnauthorized();
        return {
          code: 'UNAUTHORIZED',
          message: 'Your session has expired. Please log in again.',
          status: 401,
          originalError: error,
          timestamp: new Date(),
          requestId: error.config?.headers?.['X-Request-ID'] as string,
        };
      },
    });

    // 403 Forbidden
    this.registerHandler({
      match: (error) => error.response?.status === 403,
      handle: (error) => ({
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
        details: error.response?.data,
        status: 403,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });

    // 404 Not Found
    this.registerHandler({
      match: (error) => error.response?.status === 404,
      handle: (error) => ({
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        status: 404,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });

    // 409 Conflict
    this.registerHandler({
      match: (error) => error.response?.status === 409,
      handle: (error) => ({
        code: 'CONFLICT',
        message: this.extractErrorMessage(error) || 'A conflict occurred. The resource may already exist.',
        details: error.response?.data,
        status: 409,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });

    // 422 Validation Error
    this.registerHandler({
      match: (error) => error.response?.status === 422,
      handle: (error) => ({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed. Please check your input.',
        details: this.formatValidationErrors(error.response?.data),
        status: 422,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });

    // 429 Too Many Requests
    this.registerHandler({
      match: (error) => error.response?.status === 429,
      handle: (error) => {
        const retryAfter = error.response?.headers['retry-after'];
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. ${retryAfter ? `Please try again in ${retryAfter} seconds.` : 'Please try again later.'}`,
          details: { retryAfter },
          status: 429,
          originalError: error,
          timestamp: new Date(),
          requestId: error.config?.headers?.['X-Request-ID'] as string,
        };
      },
    });

    // 500 Internal Server Error
    this.registerHandler({
      match: (error) => error.response?.status === 500,
      handle: (error) => ({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred. Please try again later.',
        status: 500,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });

    // 503 Service Unavailable
    this.registerHandler({
      match: (error) => error.response?.status === 503,
      handle: (error) => ({
        code: 'SERVICE_UNAVAILABLE',
        message: 'The service is temporarily unavailable. Please try again later.',
        status: 503,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });

    // Network Error
    this.registerHandler({
      match: (error) => !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error'),
      handle: (error) => ({
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        originalError: error,
        timestamp: new Date(),
      }),
    });

    // Timeout Error
    this.registerHandler({
      match: (error) => error.code === 'ECONNABORTED',
      handle: (error) => ({
        code: 'TIMEOUT_ERROR',
        message: 'The request took too long to complete. Please try again.',
        originalError: error,
        timestamp: new Date(),
      }),
    });

    // Generic Error (fallback)
    this.registerHandler({
      match: () => true,
      handle: (error) => ({
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred.',
        status: error.response?.status,
        originalError: error,
        timestamp: new Date(),
        requestId: error.config?.headers?.['X-Request-ID'] as string,
      }),
    });
  }

  /**
   * Register custom error handler
   */
  registerHandler(handler: ErrorHandler): void {
    this.handlers.unshift(handler); // Add to beginning so custom handlers take precedence
  }

  /**
   * Register error callback
   */
  onError(callback: (error: ApiError) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Handle error
   */
  handleError(error: AxiosError): ApiError {
    // Find matching handler
    const handler = this.handlers.find(h => h.match(error));

    // Handle error
    const apiError = handler ? handler.handle(error) : this.createGenericError(error);

    // Log error
    this.logError(apiError);

    // Report error
    this.reportError(apiError);

    // Call error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(apiError);
      } catch (err) {
        console.error('[Error Callback] Error in callback:', err);
      }
    });

    return apiError;
  }

  /**
   * Extract error message from response
   */
  private extractErrorMessage(error: AxiosError): string | null {
    const data = error.response?.data as any;

    if (typeof data === 'string') {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return typeof data.error === 'string' ? data.error : data.error.message;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0].message || data.errors[0];
    }

    return null;
  }

  /**
   * Format validation errors
   */
  private formatValidationErrors(data: any): any {
    if (!data) return null;

    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((err: any) => ({
        field: err.field || err.property,
        message: err.message || err.constraints,
        value: err.value,
      }));
    }

    if (data.validationErrors) {
      return data.validationErrors;
    }

    return data;
  }

  /**
   * Create generic error
   */
  private createGenericError(error: AxiosError): ApiError {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred.',
      status: error.response?.status,
      originalError: error,
      timestamp: new Date(),
    };
  }

  /**
   * Log error
   */
  private logError(error: ApiError): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        code: error.code,
        message: error.message,
        status: error.status,
        details: error.details,
        requestId: error.requestId,
        timestamp: error.timestamp,
      });
    }
  }

  /**
   * Report error to error tracking service
   */
  private reportError(error: ApiError): void {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error.originalError, {
        contexts: {
          api_error: {
            code: error.code,
            message: error.message,
            status: error.status,
            requestId: error.requestId,
          },
        },
      });
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('api_error', {
        code: error.code,
        message: error.message,
        status: error.status,
        requestId: error.requestId,
      });
    }
  }

  /**
   * Handle unauthorized error (401)
   */
  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      // Clear authentication tokens
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');

      // Redirect to login after a short delay
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

        // Show notification
        this.showNotification('Session expired. Please log in again.', 'warning');

        // Redirect
        window.location.href = loginUrl;
      }, 1000);
    }
  }

  /**
   * Show notification to user
   */
  private showNotification(message: string, type: 'info' | 'warning' | 'error' = 'error'): void {
    // Use toast notification library if available
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('api-error', {
        detail: { message, type },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Format error for display
   */
  formatForDisplay(error: ApiError): string {
    if (error.details && typeof error.details === 'object') {
      if (Array.isArray(error.details)) {
        return error.details
          .map(d => d.message || d.field || JSON.stringify(d))
          .join('; ');
      }

      if (error.details.message) {
        return error.details.message;
      }
    }

    return error.message;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: ApiError): boolean {
    return [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVICE_UNAVAILABLE',
      'INTERNAL_SERVER_ERROR',
    ].includes(error.code);
  }

  /**
   * Check if error is client error (4xx)
   */
  isClientError(error: ApiError): boolean {
    return error.status ? error.status >= 400 && error.status < 500 : false;
  }

  /**
   * Check if error is server error (5xx)
   */
  isServerError(error: ApiError): boolean {
    return error.status ? error.status >= 500 && error.status < 600 : false;
  }
}

// Export singleton instance
export const errorInterceptor = new ErrorInterceptor();

export default errorInterceptor;
