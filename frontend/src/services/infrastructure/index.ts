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
export { ApiClient, apiClient } from "./api-client.service";
export type {
  ApiError,
  PaginatedResponse,
  ServiceHealth,
  SystemHealth,
} from "./api-client.service";

export { ApiClientEnhanced, apiClientEnhanced } from "./api-client-enhanced.service";
export type {
  ErrorInterceptor,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  RetryConfig,
} from "./api-client-enhanced.service";

// WebSocket Client
export { WebSocketClient, websocketClient } from "./websocket-client.service";
export type {
  ConnectionState,
  EventHandler,
  RoomSubscription,
  WebSocketError,
} from "./websocket-client.service";

// Query Client
export { QueryClient, queryClient } from "./query-client.service";
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
} from "./interceptors.service";

// Cache Manager
export { CacheManager } from "./cache-manager.service";

// Storage Adapters
export { defaultStorage } from "./adapters/StorageAdapter";
export type { IStorageAdapter as StorageAdapter } from "./adapters/StorageAdapter";
