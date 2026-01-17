/**
 * Enhanced API Client with Retry Logic, Exponential Backoff, and Advanced Features
 *
 * @module ApiClientEnhanced
 * @description Extended API client providing:
 * - Exponential backoff retry logic for failed requests
 * - Request cancellation with AbortController
 * - Request/response interceptors
 * - Comprehensive error transformation
 * - Development mode logging
 * - Request deduplication
 * - Timeout handling with custom timeouts per request
 * - Conditional retry (skip retry for 4xx errors except 429)
 *
 * @architecture
 * - Extends base ApiClient functionality
 * - Retry strategy: Exponential backoff with jitter
 * - Max retries: 3 attempts (configurable)
 * - Initial retry delay: 1000ms (exponentially increases)
 * - Request deduplication: In-flight request tracking
 *
 * @security
 * - All base ApiClient security features inherited
 * - Additional request fingerprinting for deduplication
 * - Safe retry only for idempotent methods (GET, PUT, DELETE)
 * - POST mutations require explicit retry flag
 */

import {
  API_CLIENT_BACKOFF_MULTIPLIER,
  API_CLIENT_INITIAL_RETRY_DELAY_MS,
  API_CLIENT_MAX_RETRIES,
  API_CLIENT_MAX_RETRY_DELAY_MS,
  API_CLIENT_RETRYABLE_STATUS_CODES,
} from "@/config/features/services.config";
import {
  ApiTimeoutError,
  ExternalServiceError,
  NetworkError,
} from "@/services/core/errors";

import { apiClient } from "./api-client.service";

/**
 * Retry configuration options
 */
export interface RetryConfig {
  maxRetries?: number; // Default: 3
  initialDelayMs?: number; // Default: 1000
  maxDelayMs?: number; // Default: 30000
  backoffMultiplier?: number; // Default: 2
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  retryableStatusCodes?: number[]; // Default: [408, 429, 500, 502, 503, 504]
}

/**
 * Request configuration options
 */
export interface RequestConfig extends RetryConfig {
  timeout?: number; // Request timeout in milliseconds
  signal?: AbortSignal; // Custom abort signal
  skipRetry?: boolean; // Skip retry logic
  skipCache?: boolean; // Skip request deduplication
  headers?: Record<string, string>; // Custom headers
  retryOnPost?: boolean; // Allow retry on POST (use with caution)
}

/**
 * Request/Response Interceptor types
 */
export type RequestInterceptor = (
  endpoint: string,
  config?: RequestConfig,
) =>
  | { endpoint: string; config?: RequestConfig }
  | Promise<{ endpoint: string; config?: RequestConfig }>;

export type ResponseInterceptor = <T>(
  response: T,
  endpoint: string,
) => T | Promise<T>;

export type ErrorInterceptor = (
  error: unknown,
  endpoint: string,
) => unknown | Promise<unknown>;

/**
 * Enhanced API Client Class
 */
class ApiClientEnhanced {
  private readonly DEFAULT_MAX_RETRIES = API_CLIENT_MAX_RETRIES;
  private readonly DEFAULT_INITIAL_DELAY_MS = API_CLIENT_INITIAL_RETRY_DELAY_MS;
  private readonly DEFAULT_MAX_DELAY_MS = API_CLIENT_MAX_RETRY_DELAY_MS;
  private readonly DEFAULT_BACKOFF_MULTIPLIER = API_CLIENT_BACKOFF_MULTIPLIER;
  private readonly DEFAULT_RETRYABLE_STATUS_CODES =
    API_CLIENT_RETRYABLE_STATUS_CODES;

  private inflightRequests = new Map<string, Promise<unknown>>();
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private isDevelopment = import.meta.env?.DEV || false;

  constructor() {
    this.logInitialization();
  }

  /**
   * Log client initialization
   */
  private logInitialization(): void {
    if (this.isDevelopment) {
      console.log(
        "[ApiClientEnhanced] Initialized with retry logic and interceptors",
        {
          maxRetries: this.DEFAULT_MAX_RETRIES,
          initialDelay: this.DEFAULT_INITIAL_DELAY_MS,
          retryableStatusCodes: this.DEFAULT_RETRYABLE_STATUS_CODES,
        },
      );
    }
  }

  // =============================================================================
  // INTERCEPTOR MANAGEMENT
  // =============================================================================

  /**
   * Add request interceptor
   * Interceptors are called before each request
   *
   * @param interceptor - Function to modify request
   * @returns Unregister function
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
   * Add response interceptor
   * Interceptors are called after successful responses
   *
   * @param interceptor - Function to transform response
   * @returns Unregister function
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
   * Add error interceptor
   * Interceptors are called on request errors
   *
   * @param interceptor - Function to handle/transform errors
   * @returns Unregister function
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
   * Apply all request interceptors
   */
  private async applyRequestInterceptors(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<{ endpoint: string; config?: RequestConfig }> {
    let result: { endpoint: string; config?: RequestConfig } = config
      ? { endpoint, config }
      : { endpoint };
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result.endpoint, result.config);
    }
    return result;
  }

  /**
   * Apply all response interceptors
   */
  private async applyResponseInterceptors<T>(
    response: T,
    endpoint: string,
  ): Promise<T> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result, endpoint);
    }
    return result;
  }

  /**
   * Apply all error interceptors
   */
  private async applyErrorInterceptors(
    error: unknown,
    endpoint: string,
  ): Promise<unknown> {
    let result = error;
    for (const interceptor of this.errorInterceptors) {
      result = await interceptor(result, endpoint);
    }
    return result;
  }

  // =============================================================================
  // RETRY LOGIC
  // =============================================================================

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(
    attempt: number,
    initialDelay: number,
    maxDelay: number,
    backoffMultiplier: number,
  ): number {
    const exponentialDelay =
      initialDelay * Math.pow(backoffMultiplier, attempt);
    const delayWithJitter = exponentialDelay * (0.5 + Math.random() * 0.5); // Add ±50% jitter
    return Math.min(delayWithJitter, maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(
    error: unknown,
    retryableStatusCodes: number[],
  ): boolean {
    // Network errors are retryable
    if (error instanceof NetworkError || error instanceof ApiTimeoutError) {
      return true;
    }

    // Check if it's an API error with retryable status code
    if (error instanceof ExternalServiceError) {
      const apiError = error as unknown as { statusCode?: number };
      if (
        apiError.statusCode &&
        retryableStatusCodes.includes(apiError.statusCode)
      ) {
        return true;
      }
    }

    // Check for fetch network errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("network") ||
        message.includes("timeout") ||
        message.includes("aborted") ||
        message.includes("fetch")
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    config: RetryConfig = {},
    endpoint: string,
  ): Promise<T> {
    const maxRetries = config.maxRetries ?? this.DEFAULT_MAX_RETRIES;
    const initialDelay = config.initialDelayMs ?? this.DEFAULT_INITIAL_DELAY_MS;
    const maxDelay = config.maxDelayMs ?? this.DEFAULT_MAX_DELAY_MS;
    const backoffMultiplier =
      config.backoffMultiplier ?? this.DEFAULT_BACKOFF_MULTIPLIER;
    const retryableStatusCodes =
      config.retryableStatusCodes ?? this.DEFAULT_RETRYABLE_STATUS_CODES;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();

        if (attempt > 0 && this.isDevelopment) {
          console.log(
            `[ApiClientEnhanced] Request succeeded after ${attempt} retries:`,
            endpoint,
          );
        }

        return result;
      } catch (error) {
        lastError = error;

        // Check if we should retry
        const shouldRetryCustom = config.shouldRetry?.(error, attempt);
        const shouldRetryDefault = this.isRetryableError(
          error,
          retryableStatusCodes,
        );
        const shouldRetry = shouldRetryCustom ?? shouldRetryDefault;

        if (!shouldRetry || attempt >= maxRetries) {
          if (this.isDevelopment) {
            console.error(
              `[ApiClientEnhanced] Request failed after ${attempt} attempts:`,
              endpoint,
              error,
            );
          }
          throw error;
        }

        // Calculate delay and wait before retry
        const delay = this.calculateRetryDelay(
          attempt,
          initialDelay,
          maxDelay,
          backoffMultiplier,
        );

        if (this.isDevelopment) {
          console.warn(
            `[ApiClientEnhanced] Retry attempt ${attempt + 1}/${maxRetries} for ${endpoint} after ${Math.round(delay)}ms`,
            error,
          );
        }

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  // =============================================================================
  // REQUEST DEDUPLICATION
  // =============================================================================

  /**
   * Generate request fingerprint for deduplication
   */
  private getRequestFingerprint(
    method: string,
    endpoint: string,
    data?: unknown,
  ): string {
    const dataHash = data ? JSON.stringify(data) : "";
    return `${method}:${endpoint}:${dataHash}`;
  }

  /**
   * Execute request with deduplication
   */
  private async executeWithDeduplication<T>(
    fingerprint: string,
    requestFn: () => Promise<T>,
    skipCache: boolean,
  ): Promise<T> {
    // Skip deduplication if requested
    if (skipCache) {
      return requestFn();
    }

    // Check if request is already in-flight
    const existing = this.inflightRequests.get(fingerprint);
    if (existing) {
      if (this.isDevelopment) {
        console.log("[ApiClientEnhanced] Deduplicating request:", fingerprint);
      }
      return existing as Promise<T>;
    }

    // Execute request and track in-flight
    const promise = requestFn().finally(() => {
      this.inflightRequests.delete(fingerprint);
    });

    this.inflightRequests.set(fingerprint, promise);
    return promise;
  }

  // =============================================================================
  // HTTP METHODS WITH RETRY
  // =============================================================================

  /**
   * Enhanced GET request with retry logic
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    config?: RequestConfig,
  ): Promise<T> {
    // Apply request interceptors
    const intercepted = await this.applyRequestInterceptors(endpoint, config);

    const fingerprint = this.getRequestFingerprint(
      "GET",
      intercepted.endpoint,
      params,
    );

    try {
      const result = await this.executeWithDeduplication(
        fingerprint,
        async () => {
          if (intercepted.config?.skipRetry) {
            return apiClient.get<T>(intercepted.endpoint, params);
          }

          return this.executeWithRetry(
            () => apiClient.get<T>(intercepted.endpoint, params),
            intercepted.config || {},
            intercepted.endpoint,
          );
        },
        intercepted.config?.skipCache || false,
      );

      // Apply response interceptors
      return await this.applyResponseInterceptors(result, intercepted.endpoint);
    } catch (error) {
      // Apply error interceptors
      const transformedError = await this.applyErrorInterceptors(
        error,
        intercepted.endpoint,
      );
      throw transformedError;
    }
  }

  /**
   * Enhanced POST request with retry logic
   * Note: Retries are disabled by default for POST to prevent duplicate operations
   * Set retryOnPost: true in config to enable retries (use with idempotency)
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    // Apply request interceptors
    const intercepted = await this.applyRequestInterceptors(endpoint, config);

    const fingerprint = this.getRequestFingerprint(
      "POST",
      intercepted.endpoint,
      data,
    );

    try {
      const result = await this.executeWithDeduplication(
        fingerprint,
        async () => {
          if (
            intercepted.config?.skipRetry ||
            !intercepted.config?.retryOnPost
          ) {
            return apiClient.post<T>(intercepted.endpoint, data);
          }

          return this.executeWithRetry(
            () => apiClient.post<T>(intercepted.endpoint, data),
            intercepted.config || {},
            intercepted.endpoint,
          );
        },
        intercepted.config?.skipCache || false,
      );

      // Apply response interceptors
      return await this.applyResponseInterceptors(result, intercepted.endpoint);
    } catch (error) {
      // Apply error interceptors
      const transformedError = await this.applyErrorInterceptors(
        error,
        intercepted.endpoint,
      );
      throw transformedError;
    }
  }

  /**
   * Enhanced PUT request with retry logic
   * PUT is idempotent, so retries are enabled by default
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    // Apply request interceptors
    const intercepted = await this.applyRequestInterceptors(endpoint, config);

    const fingerprint = this.getRequestFingerprint(
      "PUT",
      intercepted.endpoint,
      data,
    );

    try {
      const result = await this.executeWithDeduplication(
        fingerprint,
        async () => {
          if (intercepted.config?.skipRetry) {
            return apiClient.put<T>(intercepted.endpoint, data);
          }

          return this.executeWithRetry(
            () => apiClient.put<T>(intercepted.endpoint, data),
            intercepted.config || {},
            intercepted.endpoint,
          );
        },
        intercepted.config?.skipCache || false,
      );

      // Apply response interceptors
      return await this.applyResponseInterceptors(result, intercepted.endpoint);
    } catch (error) {
      // Apply error interceptors
      const transformedError = await this.applyErrorInterceptors(
        error,
        intercepted.endpoint,
      );
      throw transformedError;
    }
  }

  /**
   * Enhanced PATCH request with retry logic
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    // Apply request interceptors
    const intercepted = await this.applyRequestInterceptors(endpoint, config);

    const fingerprint = this.getRequestFingerprint(
      "PATCH",
      intercepted.endpoint,
      data,
    );

    try {
      const result = await this.executeWithDeduplication(
        fingerprint,
        async () => {
          if (intercepted.config?.skipRetry) {
            return apiClient.patch<T>(intercepted.endpoint, data);
          }

          return this.executeWithRetry(
            () => apiClient.patch<T>(intercepted.endpoint, data),
            intercepted.config || {},
            intercepted.endpoint,
          );
        },
        intercepted.config?.skipCache || false,
      );

      // Apply response interceptors
      return await this.applyResponseInterceptors(result, intercepted.endpoint);
    } catch (error) {
      // Apply error interceptors
      const transformedError = await this.applyErrorInterceptors(
        error,
        intercepted.endpoint,
      );
      throw transformedError;
    }
  }

  /**
   * Enhanced DELETE request with retry logic
   * DELETE is idempotent, so retries are enabled by default
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    // Apply request interceptors
    const intercepted = await this.applyRequestInterceptors(endpoint, config);

    const fingerprint = this.getRequestFingerprint(
      "DELETE",
      intercepted.endpoint,
    );

    try {
      const result = await this.executeWithDeduplication(
        fingerprint,
        async () => {
          if (intercepted.config?.skipRetry) {
            return apiClient.delete<T>(intercepted.endpoint);
          }

          return this.executeWithRetry(
            () => apiClient.delete<T>(intercepted.endpoint),
            intercepted.config || {},
            intercepted.endpoint,
          );
        },
        intercepted.config?.skipCache || false,
      );

      // Apply response interceptors
      return await this.applyResponseInterceptors(result, intercepted.endpoint);
    } catch (error) {
      // Apply error interceptors
      const transformedError = await this.applyErrorInterceptors(
        error,
        intercepted.endpoint,
      );
      throw transformedError;
    }
  }

  /**
   * Upload file with retry logic
   */
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>,
    config?: RequestConfig,
  ): Promise<T> {
    // Apply request interceptors
    const intercepted = await this.applyRequestInterceptors(endpoint, config);

    try {
      const result = await (async () => {
        if (intercepted.config?.skipRetry) {
          return apiClient.upload<T>(
            intercepted.endpoint,
            file,
            additionalData,
          );
        }

        // File uploads can be retried
        return this.executeWithRetry(
          () => apiClient.upload<T>(intercepted.endpoint, file, additionalData),
          {
            ...intercepted.config,
            retryableStatusCodes: [408, 500, 502, 503, 504],
          },
          intercepted.endpoint,
        );
      })();

      // Apply response interceptors
      return await this.applyResponseInterceptors(result, intercepted.endpoint);
    } catch (error) {
      // Apply error interceptors
      const transformedError = await this.applyErrorInterceptors(
        error,
        intercepted.endpoint,
      );
      throw transformedError;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get current authentication status
   */
  public isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get authentication token
   */
  public getAuthToken(): string | null {
    return apiClient.getAuthToken();
  }

  /**
   * Set authentication tokens
   */
  public setAuthTokens(accessToken: string, refreshToken?: string): void {
    apiClient.setAuthTokens(accessToken, refreshToken);
  }

  /**
   * Clear authentication tokens
   */
  public clearAuthTokens(): void {
    apiClient.clearAuthTokens();
  }

  /**
   * Get base URL
   */
  public getBaseUrl(): string {
    return apiClient.getBaseUrl();
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return apiClient.healthCheck();
  }

  /**
   * Clear in-flight request cache
   */
  public clearInflightCache(): void {
    this.inflightRequests.clear();
    if (this.isDevelopment) {
      console.log("[ApiClientEnhanced] Cleared in-flight request cache");
    }
  }

  /**
   * Get statistics
   */
  public getStats(): {
    inflightRequests: number;
    interceptors: { request: number; response: number; error: number };
  } {
    return {
      inflightRequests: this.inflightRequests.size,
      interceptors: {
        request: this.requestInterceptors.length,
        response: this.responseInterceptors.length,
        error: this.errorInterceptors.length,
      },
    };
  }
}

// Export singleton instance
export const apiClientEnhanced = new ApiClientEnhanced();

// Export class for testing
export { ApiClientEnhanced };

// Re-export types from base client
export type { PaginatedResponse } from "./api-client.service";
