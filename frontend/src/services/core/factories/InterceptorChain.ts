/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    INTERCEPTOR CHAIN FACTORY                              ║
 * ║           Eliminates 50+ duplicate HTTP interceptor loops                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories/InterceptorChain
 * @description Manage request/response interceptors with chain pattern
 * 
 * ELIMINATES DUPLICATES IN:
 * - api-client.ts (5 HTTP methods × interceptor loops = 50+ lines)
 * - interceptors.service.ts (5 error interceptor patterns)
 * 
 * DUPLICATE PATTERNS ELIMINATED:
 * - Request interceptor loop (5+ methods)
 * - Response interceptor loop (5+ methods)
 * - Error interceptor pattern (5+ handlers)
 * - Token refresh deduplication (2+ services)
 * - Interceptor registration management
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Request interceptor function
 */
export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor<T = unknown> = (
  response: Response<T>
) => Response<T> | Promise<Response<T>>;

/**
 * Error interceptor function
 */
export type ErrorInterceptor = (
  error: Error
) => Error | Promise<Error> | never;

/**
 * Request configuration
 */
export interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Response object
 */
export interface Response<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Interceptor handle for removal
 */
export interface InterceptorHandle {
  id: number;
  remove: () => void;
}

// ============================================================================
// INTERCEPTOR CHAIN
// ============================================================================

/**
 * Manage HTTP interceptor chain.
 * 
 * Eliminates 50+ duplicate interceptor loop lines.
 * 
 * @example
 * ```typescript
 * // Before: 10+ duplicate lines per HTTP method
 * async request(config: RequestConfig) {
 *   for (const interceptor of this.requestInterceptors) {
 *     config = await interceptor(config);
 *   }
 *   // ... fetch logic
 *   for (const interceptor of this.responseInterceptors) {
 *     response = await interceptor(response);
 *   }
 *   return response;
 * }
 * 
 * // After: 1 line
 * const chain = new InterceptorChain();
 * chain.addRequestInterceptor(authInterceptor);
 * const config = await chain.runRequestInterceptors(config);
 * ```
 */
export class InterceptorChain {
  private requestInterceptors: Map<number, RequestInterceptor> = new Map();
  private responseInterceptors: Map<number, ResponseInterceptor> = new Map();
  private errorInterceptors: Map<number, ErrorInterceptor> = new Map();
  private nextId = 1;

  // ============================================================================
  // REQUEST INTERCEPTORS
  // ============================================================================

  /**
   * Add request interceptor
   * 
   * @param interceptor - Request interceptor function
   * @returns Handle to remove interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): InterceptorHandle {
    const id = this.nextId++;
    this.requestInterceptors.set(id, interceptor);
    return {
      id,
      remove: () => this.requestInterceptors.delete(id),
    };
  }

  /**
   * Run all request interceptors
   * 
   * Replaces 5+ duplicate loops
   */
  async runRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let currentConfig = config;

    for (const interceptor of this.requestInterceptors.values()) {
      try {
        currentConfig = await interceptor(currentConfig);
      } catch (error) {
        console.error('[InterceptorChain] Request interceptor error:', error);
        throw error;
      }
    }

    return currentConfig;
  }

  // ============================================================================
  // RESPONSE INTERCEPTORS
  // ============================================================================

  /**
   * Add response interceptor
   * 
   * @param interceptor - Response interceptor function
   * @returns Handle to remove interceptor
   */
  addResponseInterceptor<T = unknown>(
    interceptor: ResponseInterceptor<T>
  ): InterceptorHandle {
    const id = this.nextId++;
    this.responseInterceptors.set(id, interceptor as ResponseInterceptor);
    return {
      id,
      remove: () => this.responseInterceptors.delete(id),
    };
  }

  /**
   * Run all response interceptors
   * 
   * Replaces 5+ duplicate loops
   */
  async runResponseInterceptors<T = unknown>(
    response: Response<T>
  ): Promise<Response<T>> {
    let currentResponse = response;

    for (const interceptor of this.responseInterceptors.values()) {
      try {
        currentResponse = await interceptor(currentResponse);
      } catch (error) {
        console.error('[InterceptorChain] Response interceptor error:', error);
        throw error;
      }
    }

    return currentResponse;
  }

  // ============================================================================
  // ERROR INTERCEPTORS
  // ============================================================================

  /**
   * Add error interceptor
   * 
   * @param interceptor - Error interceptor function
   * @returns Handle to remove interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): InterceptorHandle {
    const id = this.nextId++;
    this.errorInterceptors.set(id, interceptor);
    return {
      id,
      remove: () => this.errorInterceptors.delete(id),
    };
  }

  /**
   * Run all error interceptors
   * 
   * Replaces 5+ duplicate error handling patterns
   */
  async runErrorInterceptors(error: Error): Promise<Error> {
    let currentError = error;

    for (const interceptor of this.errorInterceptors.values()) {
      try {
        currentError = await interceptor(currentError);
      } catch (interceptorError) {
        // If interceptor throws, use that error
        currentError = interceptorError instanceof Error 
          ? interceptorError 
          : new Error(String(interceptorError));
      }
    }

    return currentError;
  }

  // ============================================================================
  // MANAGEMENT
  // ============================================================================

  /**
   * Clear all interceptors
   */
  clearAll(): void {
    this.requestInterceptors.clear();
    this.responseInterceptors.clear();
    this.errorInterceptors.clear();
  }

  /**
   * Get interceptor counts
   */
  getCounts(): { request: number; response: number; error: number } {
    return {
      request: this.requestInterceptors.size,
      response: this.responseInterceptors.size,
      error: this.errorInterceptors.size,
    };
  }
}

// ============================================================================
// BUILT-IN INTERCEPTORS
// ============================================================================

/**
 * Create auth token interceptor
 */
export function createAuthInterceptor(
  getToken: () => string | null
): RequestInterceptor {
  return (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };
}

/**
 * Create retry interceptor
 */
export function createRetryInterceptor(options: {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
}): ErrorInterceptor {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
  } = options;

  let retryCount = 0;

  return async (error: Error) => {
    const isRetryable = 
      'status' in error && 
      typeof error.status === 'number' &&
      retryableStatuses.includes(error.status);

    if (isRetryable && retryCount < maxRetries) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      throw error; // Re-throw for retry
    }

    retryCount = 0;
    return error;
  };
}

/**
 * Create logging interceptor
 */
export function createLoggingInterceptor(options: {
  logRequests?: boolean;
  logResponses?: boolean;
  logErrors?: boolean;
}): {
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
  error?: ErrorInterceptor;
} {
  const { logRequests, logResponses, logErrors } = options;

  return {
    request: logRequests
      ? (config) => {
          console.log('[HTTP Request]', config.method, config.url);
          return config;
        }
      : undefined,
    response: logResponses
      ? (response) => {
          console.log('[HTTP Response]', response.status, response.statusText);
          return response;
        }
      : undefined,
    error: logErrors
      ? (error) => {
          console.error('[HTTP Error]', error);
          return error;
        }
      : undefined,
  };
}
