/**
 * Enterprise API Module
 * Production-grade API client with retry logic, rate limiting, and interceptors
 *
 * @module api/enterprise
 * @description Barrel export for enterprise API functionality
 *
 * @example
 * ```typescript
 * import { enterpriseApi } from '@/lib/frontend-api';
 *
 * // Make API calls with automatic retry and rate limiting
 * const cases = await enterpriseApi.get<Case[]>('/cases');
 * ```
 */

// Main API client
export {
  createEnterpriseApi,
  enterpriseApi,
  EnterpriseApiClient,
  type EnterpriseApiConfig,
  type RequestOptions,
} from "./enterprise-api";

// Error types
export {
  ApiErrorBase,
  AuthError,
  AuthorizationError,
  BusinessError,
  ConflictError,
  getRetryDelay,
  isRetryableError,
  NetworkError,
  NotFoundError,
  parseApiError,
  RateLimitError,
  ServerError,
  ServiceUnavailableError,
  TimeoutError,
  ValidationError,
} from "./errors";

// Retry handler
export {
  createRetryHandler,
  DEFAULT_RETRY_CONFIG,
  retryWithBackoff,
  RetryHandler,
  type RetryConfig,
  withRetry,
} from "./retry-handler";

// Rate limiter
export {
  createRateLimiter,
  globalRateLimiter,
  RateLimiter,
  type RateLimitConfig,
} from "./rate-limiter";

// Interceptors
export {
  createAuthInterceptor,
  createCaseConversionInterceptor,
  createClientInfoInterceptor,
  createErrorLoggingInterceptor,
  createErrorTransformInterceptor,
  createPerformanceInterceptor,
  createRateLimitInterceptor,
  createRequestIdInterceptor,
  createRequestLoggingInterceptor,
  createResponseLoggingInterceptor,
  createRetryAfterInterceptor,
  createTimestampInterceptor,
  globalInterceptors,
  InterceptorManager,
  setupDefaultInterceptors,
  type ErrorInterceptor,
  type RequestConfig,
  type RequestInterceptor,
  type ResponseInterceptor,
} from "./interceptors";
