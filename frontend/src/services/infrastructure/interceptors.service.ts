/**
 * API Interceptors - Request/Response/Error Handlers
 *
 * @module interceptors
 * @description Pre-configured interceptors for apiClientEnhanced
 * Provides:
 * - Logging interceptor for development
 * - Authentication error handling
 * - Rate limiting detection
 * - Request timing/performance tracking
 * - Custom error transformations
 *
 * @usage
 * ```ts
 * import { setupInterceptors } from '@/services/infrastructure/interceptors';
 * setupInterceptors(apiClientEnhanced);
 * ```
 */

import type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "./apiClientEnhanced";

/**
 * Logging interceptor for development mode
 * Logs all requests and responses to console
 */
export const loggingRequestInterceptor: RequestInterceptor = (
  endpoint,
  config,
) => {
  if (import.meta.env?.DEV) {
    console.log("[API Request]", {
      endpoint,
      config,
      timestamp: new Date().toISOString(),
    });
  }
  return config ? { endpoint, config } : { endpoint };
};

/**
 * Response logging interceptor
 */
export const loggingResponseInterceptor: ResponseInterceptor = <T>(
  response: T,
  endpoint: string,
) => {
  if (import.meta.env?.DEV) {
    console.log("[API Response]", {
      endpoint,
      response,
      timestamp: new Date().toISOString(),
    });
  }
  return response;
};

/**
 * Performance tracking interceptor
 * Tracks request duration and logs slow requests
 */
const requestStartTimes = new Map<string, number>();

export const performanceRequestInterceptor: RequestInterceptor = (
  endpoint,
  config,
) => {
  requestStartTimes.set(endpoint, performance.now());
  return config ? { endpoint, config } : { endpoint };
};

export const performanceResponseInterceptor: ResponseInterceptor = <T>(
  response: T,
  endpoint: string,
) => {
  const startTime = requestStartTimes.get(endpoint);
  if (startTime) {
    const duration = performance.now() - startTime;
    requestStartTimes.delete(endpoint);

    // Log slow requests (> 2 seconds)
    if (duration > 2000 && import.meta.env?.DEV) {
      console.warn(
        `[API] Slow request detected: ${endpoint} (${Math.round(duration)}ms)`,
      );
    }

    // Log in production if extremely slow (> 5 seconds)
    if (duration > 5000) {
      console.error(
        `[API] Very slow request: ${endpoint} (${Math.round(duration)}ms)`,
      );
    }
  }

  return response;
};

/**
 * Authentication error handler
 * Transforms 401/403 errors into user-friendly messages
 */
export const authErrorInterceptor: ErrorInterceptor = (error, endpoint) => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
      console.error("[API] Unauthorized access:", endpoint);
      return new Error("Your session has expired. Please log in again.");
    }

    if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
      console.error("[API] Forbidden access:", endpoint);
      return new Error("You do not have permission to access this resource.");
    }
  }

  return error;
};

/**
 * Rate limiting error handler
 * Detects 429 Too Many Requests and provides user-friendly message
 */
export const rateLimitErrorInterceptor: ErrorInterceptor = (
  error,
  endpoint,
) => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("too many requests")
    ) {
      console.error("[API] Rate limit exceeded:", endpoint);
      return new Error(
        "Too many requests. Please wait a moment before trying again.",
      );
    }
  }

  return error;
};

/**
 * Network error handler
 * Provides user-friendly messages for network failures
 */
export const networkErrorInterceptor: ErrorInterceptor = (error, endpoint) => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("failed to fetch") ||
      errorMessage.includes("networkerror")
    ) {
      console.error("[API] Network error:", endpoint, error);
      return new Error(
        "Network connection failed. Please check your internet connection and try again.",
      );
    }

    if (errorMessage.includes("timeout")) {
      console.error("[API] Timeout error:", endpoint, error);
      return new Error(
        "Request timed out. The server is taking too long to respond.",
      );
    }

    if (errorMessage.includes("aborted")) {
      console.error("[API] Request aborted:", endpoint, error);
      return new Error("Request was cancelled.");
    }
  }

  return error;
};

/**
 * Validation error handler
 * Transforms backend validation errors into user-friendly messages
 */
export const validationErrorInterceptor: ErrorInterceptor = (
  error,
  endpoint,
) => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("400") ||
      errorMessage.includes("bad request") ||
      errorMessage.includes("validation")
    ) {
      console.error("[API] Validation error:", endpoint, error);

      // Try to extract validation details if available
      try {
        const match = error.message.match(/\{.*\}/);
        if (match) {
          const errorData = JSON.parse(match[0]);
          if (errorData.message) {
            return new Error(errorData.message);
          }
          if (errorData.errors && Array.isArray(errorData.errors)) {
            return new Error(
              `Validation failed: ${errorData.errors.map((e: { message: string }) => e.message).join(", ")}`,
            );
          }
        }
      } catch {
        // Ignore JSON parsing errors
      }

      return new Error(
        "Invalid request. Please check your input and try again.",
      );
    }
  }

  return error;
};

/**
 * Server error handler
 * Provides user-friendly messages for 5xx errors
 */
export const serverErrorInterceptor: ErrorInterceptor = (error, endpoint) => {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("500") ||
      errorMessage.includes("internal server error")
    ) {
      console.error("[API] Internal server error:", endpoint, error);
      return new Error(
        "An internal server error occurred. Our team has been notified.",
      );
    }

    if (errorMessage.includes("502") || errorMessage.includes("bad gateway")) {
      console.error("[API] Bad gateway:", endpoint, error);
      return new Error(
        "Service temporarily unavailable. Please try again later.",
      );
    }

    if (
      errorMessage.includes("503") ||
      errorMessage.includes("service unavailable")
    ) {
      console.error("[API] Service unavailable:", endpoint, error);
      return new Error(
        "Service is temporarily unavailable. Please try again in a few minutes.",
      );
    }

    if (
      errorMessage.includes("504") ||
      errorMessage.includes("gateway timeout")
    ) {
      console.error("[API] Gateway timeout:", endpoint, error);
      return new Error("Request timed out. Please try again.");
    }
  }

  return error;
};

/**
 * Request fingerprinting interceptor
 * Adds unique request ID for tracking
 */
export const requestIdInterceptor: RequestInterceptor = (endpoint, config) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    endpoint,
    config: {
      ...config,
      headers: {
        ...config?.headers,
        "X-Request-ID": requestId,
      },
    },
  };
};

/**
 * Tenant isolation interceptor
 * Adds tenant ID header for multi-tenant applications
 */
export const tenantIsolationInterceptor: RequestInterceptor = (
  endpoint,
  config,
) => {
  // Get tenant ID from localStorage or auth context
  const tenantId = localStorage.getItem("tenant_id");

  if (tenantId) {
    return {
      endpoint,
      config: {
        ...config,
        headers: {
          ...config?.headers,
          "X-Tenant-ID": tenantId,
        },
      },
    };
  }

  return config ? { endpoint, config } : { endpoint };
};

/**
 * Setup all interceptors on apiClientEnhanced
 *
 * @param client - Enhanced API client instance
 * @returns Cleanup function to remove all interceptors
 */
export function setupInterceptors(client: {
  addRequestInterceptor: (interceptor: RequestInterceptor) => () => void;
  addResponseInterceptor: (interceptor: ResponseInterceptor) => () => void;
  addErrorInterceptor: (interceptor: ErrorInterceptor) => () => void;
}): () => void {
  const unsubscribers: Array<() => void> = [];

  // Development mode interceptors
  if (import.meta.env?.DEV) {
    unsubscribers.push(client.addRequestInterceptor(loggingRequestInterceptor));
    unsubscribers.push(
      client.addResponseInterceptor(loggingResponseInterceptor),
    );
    unsubscribers.push(
      client.addRequestInterceptor(performanceRequestInterceptor),
    );
    unsubscribers.push(
      client.addResponseInterceptor(performanceResponseInterceptor),
    );
  }

  // Always active interceptors
  unsubscribers.push(client.addRequestInterceptor(requestIdInterceptor));
  unsubscribers.push(client.addRequestInterceptor(tenantIsolationInterceptor));

  // Error interceptors
  unsubscribers.push(client.addErrorInterceptor(authErrorInterceptor));
  unsubscribers.push(client.addErrorInterceptor(rateLimitErrorInterceptor));
  unsubscribers.push(client.addErrorInterceptor(networkErrorInterceptor));
  unsubscribers.push(client.addErrorInterceptor(validationErrorInterceptor));
  unsubscribers.push(client.addErrorInterceptor(serverErrorInterceptor));

  console.log("[Interceptors] All interceptors registered");

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    console.log("[Interceptors] All interceptors removed");
  };
}

/**
 * Setup specific interceptor categories
 */
export const setupDevelopmentInterceptors = (client: {
  addRequestInterceptor: (interceptor: RequestInterceptor) => () => void;
  addResponseInterceptor: (interceptor: ResponseInterceptor) => () => void;
}): (() => void)[] => {
  return [
    client.addRequestInterceptor(loggingRequestInterceptor),
    client.addResponseInterceptor(loggingResponseInterceptor),
    client.addRequestInterceptor(performanceRequestInterceptor),
    client.addResponseInterceptor(performanceResponseInterceptor),
  ];
};

export const setupErrorInterceptors = (client: {
  addErrorInterceptor: (interceptor: ErrorInterceptor) => () => void;
}): (() => void)[] => {
  return [
    client.addErrorInterceptor(authErrorInterceptor),
    client.addErrorInterceptor(rateLimitErrorInterceptor),
    client.addErrorInterceptor(networkErrorInterceptor),
    client.addErrorInterceptor(validationErrorInterceptor),
    client.addErrorInterceptor(serverErrorInterceptor),
  ];
};
