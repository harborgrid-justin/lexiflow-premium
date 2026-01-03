/**
 * Enterprise API Interceptors
 * Request and response interceptors for API client
 *
 * @module api/enterprise/interceptors
 * @description Provides middleware-style interceptors for:
 * - Request transformation and enrichment
 * - Response transformation and parsing
 * - Error handling and logging
 * - Performance monitoring
 * - Authentication token injection
 * - Request/response logging
 */

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor<T = any> = (
  response: Response,
  data: T
) => T | Promise<T>;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: any) => any | Promise<any>;

/**
 * Request configuration
 */
export interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  metadata?: Record<string, any>;
}

/**
 * Interceptor manager for organizing interceptors
 */
export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Add a request interceptor
   * Executed before request is sent
   */
  public addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add a response interceptor
   * Executed after successful response
   */
  public addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add an error interceptor
   * Executed when request fails
   */
  public addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Execute request interceptors
   */
  public async executeRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let currentConfig = config;
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    return currentConfig;
  }

  /**
   * Execute response interceptors
   */
  public async executeResponseInterceptors<T>(
    response: Response,
    data: T
  ): Promise<T> {
    let currentData = data;
    for (const interceptor of this.responseInterceptors) {
      currentData = await interceptor(response, currentData);
    }
    return currentData;
  }

  /**
   * Execute error interceptors
   */
  public async executeErrorInterceptors(error: any): Promise<any> {
    let currentError = error;
    for (const interceptor of this.errorInterceptors) {
      currentError = await interceptor(currentError);
    }
    return currentError;
  }

  /**
   * Clear all interceptors
   */
  public clear(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }
}

// ============================================================================
// BUILT-IN INTERCEPTORS
// ============================================================================

/**
 * Add authentication token to requests
 */
export function createAuthInterceptor(
  getToken: () => string | null
): RequestInterceptor {
  return (config: RequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  };
}

/**
 * Add request ID for tracking
 */
export function createRequestIdInterceptor(): RequestInterceptor {
  return (config: RequestConfig) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    config.headers["X-Request-ID"] = requestId;
    config.metadata = {
      ...config.metadata,
      requestId,
    };
    return config;
  };
}

/**
 * Add timestamp to requests
 */
export function createTimestampInterceptor(): RequestInterceptor {
  return (config: RequestConfig) => {
    config.headers["X-Request-Time"] = new Date().toISOString();
    config.metadata = {
      ...config.metadata,
      startTime: Date.now(),
    };
    return config;
  };
}

/**
 * Add user agent and client info
 */
export function createClientInfoInterceptor(
  appName: string,
  appVersion: string
): RequestInterceptor {
  return (config: RequestConfig) => {
    config.headers["X-Client-Name"] = appName;
    config.headers["X-Client-Version"] = appVersion;
    return config;
  };
}

/**
 * Log requests for debugging
 */
export function createRequestLoggingInterceptor(
  enabled: boolean = true
): RequestInterceptor {
  return (config: RequestConfig) => {
    if (enabled) {
      console.log("[API Request]", {
        method: config.method,
        url: config.url,
        headers: config.headers,
        requestId: config.metadata?.requestId,
      });
    }
    return config;
  };
}

/**
 * Log responses for debugging
 */
export function createResponseLoggingInterceptor(
  enabled: boolean = true
): ResponseInterceptor {
  return async (response: Response, data: any) => {
    if (enabled) {
      console.log("[API Response]", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
      });
    }
    return data;
  };
}

/**
 * Measure request performance
 */
export function createPerformanceInterceptor(): {
  request: RequestInterceptor;
  response: ResponseInterceptor;
} {
  return {
    request: (config: RequestConfig) => {
      config.metadata = {
        ...config.metadata,
        startTime: performance.now(),
      };
      return config;
    },
    response: async (response: Response, data: any) => {
      const requestConfig = (response as any).requestConfig;
      if (requestConfig?.metadata?.startTime) {
        const duration = performance.now() - requestConfig.metadata.startTime;
        console.log(`[Performance] ${requestConfig.url}: ${duration.toFixed(2)}ms`);
      }
      return data;
    },
  };
}

/**
 * Parse rate limit headers
 */
export function createRateLimitInterceptor(): ResponseInterceptor {
  return async (response: Response, data: any) => {
    const limit = response.headers.get("X-RateLimit-Limit");
    const remaining = response.headers.get("X-RateLimit-Remaining");
    const reset = response.headers.get("X-RateLimit-Reset");

    if (limit || remaining || reset) {
      console.debug("[Rate Limit]", {
        limit: limit ? parseInt(limit) : undefined,
        remaining: remaining ? parseInt(remaining) : undefined,
        reset: reset ? new Date(parseInt(reset) * 1000) : undefined,
      });
    }

    return data;
  };
}

/**
 * Transform snake_case to camelCase
 */
export function createCaseConversionInterceptor(): ResponseInterceptor {
  return async (response: Response, data: any) => {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    return transformKeys(data, snakeToCamel);
  };
}

/**
 * Transform object keys recursively
 */
function transformKeys(
  obj: any,
  transformer: (key: string) => string
): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformer));
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce(
      (result, key) => {
        const newKey = transformer(key);
        result[newKey] = transformKeys(obj[key], transformer);
        return result;
      },
      {} as any
    );
  }

  return obj;
}

/**
 * Convert snake_case to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Error logging interceptor
 */
export function createErrorLoggingInterceptor(
  enabled: boolean = true
): ErrorInterceptor {
  return async (error: any) => {
    if (enabled) {
      console.error("[API Error]", {
        message: error.message,
        status: error.statusCode || error.status,
        url: error.path,
        timestamp: error.timestamp,
      });
    }
    return error;
  };
}

/**
 * Error transformation interceptor
 * Converts API errors to user-friendly messages
 */
export function createErrorTransformInterceptor(): ErrorInterceptor {
  return async (error: any) => {
    // Add user-friendly message if available
    if (error.getUserMessage && typeof error.getUserMessage === "function") {
      error.userMessage = error.getUserMessage();
    }
    return error;
  };
}

/**
 * Retry after rate limit interceptor
 */
export function createRetryAfterInterceptor(): ErrorInterceptor {
  return async (error: any) => {
    if (error.statusCode === 429) {
      const retryAfter = error.retryAfter || 60;
      console.warn(
        `[Rate Limit] Request throttled. Retry after ${retryAfter} seconds.`
      );
    }
    return error;
  };
}

/**
 * Global interceptor manager instance
 */
export const globalInterceptors = new InterceptorManager();

/**
 * Setup default interceptors
 */
export function setupDefaultInterceptors(
  manager: InterceptorManager,
  options: {
    enableLogging?: boolean;
    enablePerformance?: boolean;
    appName?: string;
    appVersion?: string;
    getAuthToken?: () => string | null;
  } = {}
): void {
  const {
    enableLogging = false,
    enablePerformance = true,
    appName = "LexiFlow",
    appVersion = "1.0.0",
    getAuthToken,
  } = options;

  // Request interceptors
  manager.addRequestInterceptor(createRequestIdInterceptor());
  manager.addRequestInterceptor(createTimestampInterceptor());
  manager.addRequestInterceptor(createClientInfoInterceptor(appName, appVersion));

  if (getAuthToken) {
    manager.addRequestInterceptor(createAuthInterceptor(getAuthToken));
  }

  if (enableLogging) {
    manager.addRequestInterceptor(createRequestLoggingInterceptor(true));
  }

  if (enablePerformance) {
    const perfInterceptor = createPerformanceInterceptor();
    manager.addRequestInterceptor(perfInterceptor.request);
    manager.addResponseInterceptor(perfInterceptor.response);
  }

  // Response interceptors
  manager.addResponseInterceptor(createRateLimitInterceptor());

  if (enableLogging) {
    manager.addResponseInterceptor(createResponseLoggingInterceptor(true));
  }

  // Error interceptors
  manager.addErrorInterceptor(createErrorTransformInterceptor());
  manager.addErrorInterceptor(createRetryAfterInterceptor());

  if (enableLogging) {
    manager.addErrorInterceptor(createErrorLoggingInterceptor(true));
  }
}
