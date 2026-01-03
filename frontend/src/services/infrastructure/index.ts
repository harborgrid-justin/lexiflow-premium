/**
 * Infrastructure Services - Barrel Export
 *
 * @module infrastructure
 * @description Centralized export for all infrastructure services
 * Provides:
 * - API clients (base and enhanced)
 * - WebSocket client
 * - Query client
 * - Interceptors
 * - Cache management
 */

// API Clients
export { ApiClient, apiClient } from "./apiClient";
export type {
  ApiError,
  PaginatedResponse,
  ServiceHealth,
  SystemHealth,
} from "./apiClient";

export { ApiClientEnhanced, apiClientEnhanced } from "./apiClientEnhanced";
export type {
  ErrorInterceptor,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  RetryConfig,
} from "./apiClientEnhanced";

// WebSocket Client
export { WebSocketClient, websocketClient } from "./websocketClient";
export type {
  ConnectionState,
  EventHandler,
  RoomSubscription,
  WebSocketError,
} from "./websocketClient";

// Query Client
export { QueryClient, queryClient } from "./queryClient";
export type { QueryFunction, QueryKey, QueryState } from "./queryTypes";

// Interceptors
export {
  authErrorInterceptor,
  loggingRequestInterceptor,
  loggingResponseInterceptor,
  networkErrorInterceptor,
  performanceRequestInterceptor,
  performanceResponseInterceptor,
  rateLimitErrorInterceptor,
  requestIdInterceptor,
  serverErrorInterceptor,
  setupDevelopmentInterceptors,
  setupErrorInterceptors,
  setupInterceptors,
  tenantIsolationInterceptor,
  validationErrorInterceptor,
} from "./interceptors";

// Cache Manager
export { CacheManager } from "./CacheManager";

// Storage Adapters
export { defaultStorage } from "./adapters/StorageAdapter";
export type { IStorageAdapter as StorageAdapter } from "./adapters/StorageAdapter";
