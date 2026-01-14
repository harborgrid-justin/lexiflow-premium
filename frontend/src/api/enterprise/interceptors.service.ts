/**
 * Interceptors Service Re-export
 * Re-exports interceptor functionality from the infrastructure layer
 * with compatibility layer for enterprise API
 */

export * from "../../services/infrastructure/interceptors.service";

// Type compatibility exports
export type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "../../services/infrastructure/apiClientEnhanced";

export interface RequestConfig {
  params?: Record<string, unknown>;
  headers?: HeadersInit;
}

// Mock InterceptorManager for compatibility
export class InterceptorManager {
  request = { use: () => 0, eject: () => {} };
  response = { use: () => 0, eject: () => {} };
}

// Alias setupInterceptors as setupDefaultInterceptors
export { setupInterceptors as setupDefaultInterceptors } from "../../services/infrastructure/interceptors.service";

// Stub exports for functions that don't exist in the actual service
export const createAuthInterceptor = () => ({});
export const createCaseConversionInterceptor = () => ({});
export const createClientInfoInterceptor = () => ({});
export const createErrorLoggingInterceptor = () => ({});
export const createErrorTransformInterceptor = () => ({});
export const createPerformanceInterceptor = () => ({});
export const createRateLimitInterceptor = () => ({});
export const createRequestIdInterceptor = () => ({});
export const createRequestLoggingInterceptor = () => ({});
export const createResponseLoggingInterceptor = () => ({});
export const createRetryAfterInterceptor = () => ({});
export const createTimestampInterceptor = () => ({});
export const globalInterceptors = { request: [], response: [], error: [] };
