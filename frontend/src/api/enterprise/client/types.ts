/**
 * Enterprise API Client Types
 */

import type { RateLimitConfig } from "../rate-limiter";
import type { RetryConfig } from "../retry-handler";

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
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
