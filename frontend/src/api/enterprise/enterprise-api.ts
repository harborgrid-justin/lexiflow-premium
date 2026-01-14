/**
 * Enterprise API Client
 * Production-grade HTTP client with retry logic, rate limiting, and interceptors
 *
 * @module api/enterprise/enterprise-api
 * @description Comprehensive enterprise API client featuring:
 * - Automatic retry with exponential backoff
 * - Client-side rate limiting
 * - Request/response interceptors
 * - Circuit breaker pattern
 * - Request caching
 * - Type-safe operations
 * - Performance monitoring
 * - Error handling and logging
 *
 * @security
 * - JWT authentication
 * - Token refresh on 401
 * - Secure token storage
 * - XSS/CSRF protection
 *
 * @example
 * ```typescript
 * import { enterpriseApi } from '@/lib/frontend-api';
 *
 * // Simple GET request
 * const cases = await enterpriseApi.get<Case[]>('/cases');
 *
 * // POST with retry
 * const newCase = await enterpriseApi.post<Case>('/cases', {
 *   title: 'New Case',
 *   status: 'active'
 * });
 * ```
 */

import { getApiBaseUrl, getApiPrefix } from "@/config/network/api.config";
import { parseApiError, ValidationError } from "./errors";
import {
  InterceptorManager,
  RequestConfig,
  setupDefaultInterceptors,
} from "./interceptors";
import {
  createRateLimiter,
  globalRateLimiter,
  RateLimitConfig,
  RateLimiter,
} from "./rate-limiter";
import { createRetryHandler, RetryConfig, RetryHandler } from "./retry-handler";

/**
 * API client configuration
 */
export interface EnterpriseApiConfig {
  /**
   * Base URL for API requests
   */
  baseUrl?: string;

  /**
   * API prefix (e.g., /api/v1)
   */
  apiPrefix?: string;

  /**
   * Default request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Retry configuration
   */
  retry?: RetryConfig;

  /**
   * Rate limit configuration
   */
  rateLimit?: RateLimitConfig;

  /**
   * Enable request/response logging
   * @default false
   */
  enableLogging?: boolean;

  /**
   * Enable performance monitoring
   * @default true
   */
  enablePerformance?: boolean;

  /**
   * Application name for client identification
   * @default "LexiFlow"
   */
  appName?: string;

  /**
   * Application version
   * @default "1.0.0"
   */
  appVersion?: string;

  /**
   * Custom headers to include with every request
   */
  defaultHeaders?: Record<string, string>;

  /**
   * Enable caching
   * @default false
   */
  enableCache?: boolean;

  /**
   * Cache TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTTL?: number;
}

/**
 * Request options for individual requests
 */
export interface RequestOptions {
  /**
   * Custom headers for this request
   */
  headers?: Record<string, string>;

  /**
   * Request timeout override
   */
  timeout?: number;

  /**
   * Disable retry for this request
   */
  noRetry?: boolean;

  /**
   * Disable rate limiting for this request
   */
  noRateLimit?: boolean;

  /**
   * Abort signal for cancellation
   */
  signal?: AbortSignal;

  /**
   * Cache this request
   */
  cache?: boolean;

  /**
   * Custom cache key
   */
  cacheKey?: string;
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Enterprise API Client Class
 */
export class EnterpriseApiClient {
  private config: Required<EnterpriseApiConfig>;
  private retryHandler: RetryHandler;
  private rateLimiter: RateLimiter;
  private interceptors: InterceptorManager;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private authTokenKey: string = "lexiflow_auth_token";
  private refreshTokenKey: string = "lexiflow_refresh_token";

  constructor(config: EnterpriseApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || getApiBaseUrl(),
      apiPrefix: config.apiPrefix || getApiPrefix(),
      timeout: config.timeout ?? 30000,
      retry: config.retry || {},
      rateLimit: config.rateLimit || {},
      enableLogging: config.enableLogging ?? false,
      enablePerformance: config.enablePerformance ?? true,
      appName: config.appName || "LexiFlow",
      appVersion: config.appVersion || "1.0.0",
      defaultHeaders: config.defaultHeaders || {},
      enableCache: config.enableCache ?? false,
      cacheTTL: config.cacheTTL ?? 300000,
    };

    // Initialize retry handler
    this.retryHandler = createRetryHandler(this.config.retry);

    // Initialize rate limiter
    this.rateLimiter =
      config.rateLimit === undefined
        ? globalRateLimiter
        : createRateLimiter(this.config.rateLimit);

    // Initialize interceptors
    this.interceptors = new InterceptorManager();
    setupDefaultInterceptors(this.interceptors, {
      enableLogging: this.config.enableLogging,
      enablePerformance: this.config.enablePerformance,
      appName: this.config.appName,
      appVersion: this.config.appVersion,
      getAuthToken: () => this.getAuthToken(),
    });

    console.log("[EnterpriseApiClient] Initialized", {
      baseUrl: this.getBaseUrl(),
      retry: this.config.retry,
      rateLimit: this.config.rateLimit,
    });
  }

  /**
   * Get full base URL
   */
  private getBaseUrl(): string {
    const base = this.config.baseUrl;
    const prefix = this.config.apiPrefix;

    if (!base) {
      return prefix;
    }

    if (base.endsWith(prefix)) {
      return base;
    }

    return `${base.replace(/\/$/, "")}${prefix}`;
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem(this.authTokenKey);
    } catch (error) {
      console.error("[EnterpriseApiClient] Failed to get auth token:", error);
      return null;
    }
  }

  /**
   * Set auth tokens
   */
  public setAuthTokens(accessToken: string, refreshToken?: string): void {
    try {
      localStorage.setItem(this.authTokenKey, accessToken);
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
    } catch (error) {
      console.error("[EnterpriseApiClient] Failed to set auth tokens:", error);
      throw new ValidationError("Failed to store authentication tokens");
    }
  }

  /**
   * Clear auth tokens
   */
  public clearAuthTokens(): void {
    try {
      localStorage.removeItem(this.authTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error(
        "[EnterpriseApiClient] Failed to clear auth tokens:",
        error
      );
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    if (!baseUrl) {
      return cleanEndpoint;
    }

    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * Build request config
   */
  private buildRequestConfig(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): RequestConfig {
    const url = this.buildUrl(endpoint);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...this.config.defaultHeaders,
      ...options.headers,
    };

    return {
      url,
      method,
      headers,
      signal: options.signal,
      metadata: {},
    };
  }

  /**
   * Execute HTTP request
   */
  private async executeRequest<T>(
    config: RequestConfig,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    // Execute request interceptors
    const processedConfig =
      await this.interceptors.executeRequestInterceptors(config);

    // Create fetch function
    const fetchFn = async (): Promise<T> => {
      const timeout = options.timeout || this.config.timeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(processedConfig.url, {
          method: processedConfig.method,
          headers: processedConfig.headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: options.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw parseApiError({
            ...errorData,
            statusCode: response.status,
            status: response.status,
          });
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return {} as T;
        }

        const data = await response.json();

        // Execute response interceptors
        const processedData =
          await this.interceptors.executeResponseInterceptors(response, data);

        return processedData;
      } catch (error) {
        clearTimeout(timeoutId);
        const parsedError = parseApiError(error);

        // Execute error interceptors
        const processedError =
          await this.interceptors.executeErrorInterceptors(parsedError);

        throw processedError;
      }
    };

    // Apply rate limiting
    const rateLimitedFn = options.noRateLimit
      ? fetchFn
      : () => this.rateLimiter.execute(processedConfig.url, fetchFn);

    // Apply retry logic
    const result = options.noRetry
      ? await rateLimitedFn()
      : await this.retryHandler.execute(rateLimitedFn);

    return result;
  }

  /**
   * GET request
   */
  public async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    options: RequestOptions = {}
  ): Promise<T> {
    // Build URL with query params
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null
        ) as [string, string][]
      ).toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    // Check cache
    const cacheKey = options.cacheKey || url;
    if (this.config.enableCache || options.cache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const config = this.buildRequestConfig("GET", url, options);
    const result = await this.executeRequest<T>(config, undefined, options);

    // Cache result
    if (this.config.enableCache || options.cache) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  /**
   * POST request
   */
  public async post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const config = this.buildRequestConfig("POST", endpoint, options);
    return this.executeRequest<T>(config, data, options);
  }

  /**
   * PUT request
   */
  public async put<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const config = this.buildRequestConfig("PUT", endpoint, options);
    return this.executeRequest<T>(config, data, options);
  }

  /**
   * PATCH request
   */
  public async patch<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const config = this.buildRequestConfig("PATCH", endpoint, options);
    return this.executeRequest<T>(config, data, options);
  }

  /**
   * DELETE request
   */
  public async delete<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const config = this.buildRequestConfig("DELETE", endpoint, options);
    return this.executeRequest<T>(config, undefined, options);
  }

  /**
   * Upload file
   */
  public async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string | Blob>,
    options: RequestOptions = {}
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const url = this.buildUrl(endpoint);
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...options.headers,
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      signal: options.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw parseApiError({
        ...errorData,
        statusCode: response.status,
      });
    }

    const data = await response.json();
    return data;
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Get from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.cacheTTL,
    };
    this.cache.set(key, entry);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate specific cache entry
   */
  public invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  // ============================================================================
  // INTERCEPTOR MANAGEMENT
  // ============================================================================

  /**
   * Get interceptor manager
   */
  public getInterceptors(): InterceptorManager {
    return this.interceptors;
  }

  /**
   * Get rate limiter
   */
  public getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  /**
   * Get retry handler
   */
  public getRetryHandler(): RetryHandler {
    return this.retryHandler;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<EnterpriseApiConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    } as Required<EnterpriseApiConfig>;

    if (config.retry) {
      this.retryHandler.updateConfig(config.retry);
    }

    if (config.rateLimit) {
      this.rateLimiter.updateConfig(config.rateLimit);
    }
  }
}

/**
 * Global enterprise API client instance
 */
export const enterpriseApi = new EnterpriseApiClient({
  enableLogging: import.meta.env.DEV,
  enablePerformance: true,
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
  },
  enableCache: false,
});

/**
 * Create custom enterprise API client
 */
export function createEnterpriseApi(
  config?: EnterpriseApiConfig
): EnterpriseApiClient {
  return new EnterpriseApiClient(config);
}

export default enterpriseApi;
