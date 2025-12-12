import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { cacheManager } from './cacheManager';
import { errorInterceptor } from './errorInterceptor';

/**
 * API Middleware for LexiFlow Frontend
 *
 * Provides request/response interceptors for:
 * - Authentication token injection
 * - Request/response logging
 * - Error handling and retry logic
 * - Request caching
 * - Response transformation
 * - Performance monitoring
 */

export interface RequestMetadata {
  startTime: number;
  requestId: string;
  url: string;
  method: string;
}

export interface RetryConfig {
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
}

export interface MiddlewareConfig {
  enableLogging?: boolean;
  enableCaching?: boolean;
  enableRetry?: boolean;
  retryConfig?: RetryConfig;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

const requestMetadataMap = new Map<string, RequestMetadata>();

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Get API version from storage or default
 */
function getApiVersion(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('api_version') || 'v2';
  }
  return 'v2';
}

/**
 * Request interceptor
 */
export function requestInterceptor(config: AxiosRequestConfig): AxiosRequestConfig {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Store request metadata
  requestMetadataMap.set(requestId, {
    startTime,
    requestId,
    url: config.url || '',
    method: config.method?.toUpperCase() || 'GET',
  });

  // Add request ID header
  config.headers = {
    ...config.headers,
    'X-Request-ID': requestId,
  };

  // Add authentication token
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add API version header
  const version = getApiVersion();
  config.headers['X-API-Version'] = version;

  // Add client information
  config.headers['X-Client-Type'] = 'web';
  config.headers['X-Client-Version'] = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

  // Check cache for GET requests
  if (config.method?.toLowerCase() === 'get' && config.url) {
    const cachedResponse = cacheManager.get(config.url, config.params);
    if (cachedResponse) {
      console.log(`[Cache HIT] ${config.method?.toUpperCase()} ${config.url}`);
      // Return cached response wrapped in a promise
      return Promise.reject({
        config,
        response: cachedResponse,
        isCached: true,
      }) as any;
    }
  }

  // Log request
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
      requestId,
      params: config.params,
      data: config.data,
    });
  }

  return config;
}

/**
 * Request error interceptor
 */
export function requestErrorInterceptor(error: any): Promise<any> {
  console.error('[Request Error]', error);
  return Promise.reject(error);
}

/**
 * Response interceptor
 */
export function responseInterceptor(response: AxiosResponse): AxiosResponse {
  const requestId = response.config.headers?.['X-Request-ID'] as string;
  const metadata = requestMetadataMap.get(requestId);

  if (metadata) {
    const duration = Date.now() - metadata.startTime;

    // Log response
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Response] ${metadata.method} ${metadata.url} - ${response.status} (${duration}ms)`, {
        requestId,
        status: response.status,
        duration,
        data: response.data,
      });
    }

    // Track performance metrics
    trackPerformanceMetric({
      method: metadata.method,
      url: metadata.url,
      status: response.status,
      duration,
    });

    // Clean up metadata
    requestMetadataMap.delete(requestId);
  }

  // Cache successful GET responses
  if (
    response.config.method?.toLowerCase() === 'get' &&
    response.config.url &&
    response.status === 200
  ) {
    const ttl = parseInt(response.headers['cache-control']?.match(/max-age=(\d+)/)?.[1] || '300');
    cacheManager.set(response.config.url, response.config.params, response.data, ttl);
  }

  // Handle deprecation warnings
  if (response.headers['x-api-deprecation']) {
    console.warn('[API Deprecation Warning]', response.headers['x-api-deprecation']);
  }

  if (response.headers['x-api-sunset']) {
    console.error('[API Sunset Notice]', response.headers['x-api-sunset']);
  }

  return response;
}

/**
 * Response error interceptor with retry logic
 */
export function responseErrorInterceptor(
  error: AxiosError,
  retryConfig: RetryConfig = {},
): Promise<any> {
  // Handle cached response
  if ((error as any).isCached) {
    return Promise.resolve((error as any).response);
  }

  const requestId = error.config?.headers?.['X-Request-ID'] as string;
  const metadata = requestMetadataMap.get(requestId);

  if (metadata) {
    const duration = Date.now() - metadata.startTime;

    // Log error
    console.error(`[Response Error] ${metadata.method} ${metadata.url} - ${error.response?.status || 'Network Error'} (${duration}ms)`, {
      requestId,
      status: error.response?.status,
      duration,
      error: error.response?.data,
    });

    // Clean up metadata
    requestMetadataMap.delete(requestId);
  }

  // Handle error with custom error interceptor
  const handledError = errorInterceptor.handleError(error);

  // Retry logic
  const config = error.config as any;
  const maxRetries = retryConfig.retries || 3;
  const retryDelay = retryConfig.retryDelay || 1000;
  const shouldRetry = retryConfig.retryCondition || defaultRetryCondition;

  if (config && shouldRetry(error)) {
    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount < maxRetries) {
      config.__retryCount++;

      console.log(`[Retry] ${config.method?.toUpperCase()} ${config.url} (Attempt ${config.__retryCount}/${maxRetries})`);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(axios(config));
        }, retryDelay * config.__retryCount);
      });
    }
  }

  return Promise.reject(handledError);
}

/**
 * Default retry condition - retry on network errors and 5xx errors
 */
function defaultRetryCondition(error: AxiosError): boolean {
  return (
    !error.response ||
    (error.response.status >= 500 && error.response.status < 600) ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK'
  );
}

/**
 * Track performance metrics
 */
function trackPerformanceMetric(metric: {
  method: string;
  url: string;
  status: number;
  duration: number;
}): void {
  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('api_request', metric);
  }

  // Log slow requests
  if (metric.duration > 3000) {
    console.warn('[Slow Request]', metric);
  }
}

/**
 * Setup API middleware for axios instance
 */
export function setupApiMiddleware(
  instance: AxiosInstance,
  config: MiddlewareConfig = {},
): AxiosInstance {
  // Request interceptors
  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

  // Response interceptors
  instance.interceptors.response.use(
    responseInterceptor,
    (error) => responseErrorInterceptor(error, config.retryConfig),
  );

  return instance;
}

/**
 * Create axios instance with middleware
 */
export function createApiClient(config: MiddlewareConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: config.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  return setupApiMiddleware(instance, config);
}

/**
 * Clear request metadata (cleanup)
 */
export function clearRequestMetadata(): void {
  requestMetadataMap.clear();
}

/**
 * Get pending requests count
 */
export function getPendingRequestsCount(): number {
  return requestMetadataMap.size;
}

/**
 * Cancel all pending requests
 */
export function cancelAllRequests(message = 'Requests cancelled'): void {
  // Implementation would require tracking cancel tokens
  console.log(`[Cancel All Requests] ${message}`);
  clearRequestMetadata();
}

export default {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
  setupApiMiddleware,
  createApiClient,
  clearRequestMetadata,
  getPendingRequestsCount,
  cancelAllRequests,
};
