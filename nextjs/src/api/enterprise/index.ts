/**
 * Enterprise API Module
 * Production-grade API client with retry logic, rate limiting, and interceptors
 *
 * @module api/enterprise
 * @description Barrel export for enterprise API functionality
 *
 * @example
 * ```typescript
 * import { enterpriseApi } from '@/api/enterprise';
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
} from "./retry-handler";
