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
export { apiClient, ApiClient } from './apiClient';
export type { ApiError, PaginatedResponse, ServiceHealth, SystemHealth } from './apiClient';

export { apiClientEnhanced, ApiClientEnhanced } from './apiClientEnhanced';
export type {
  RetryConfig,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from './apiClientEnhanced';

// WebSocket Client
export { websocketClient, WebSocketClient } from './websocketClient';
export type { ConnectionState, EventHandler, WebSocketError, RoomSubscription } from './websocketClient';

// Query Client
export { queryClient, QueryClient } from './queryClient';
export type { QueryKey, QueryFunction, QueryState } from './queryTypes';

// Interceptors
export {
  setupInterceptors,
  setupDevelopmentInterceptors,
  setupErrorInterceptors,
  loggingRequestInterceptor,
  loggingResponseInterceptor,
  performanceRequestInterceptor,
  performanceResponseInterceptor,
  authErrorInterceptor,
  rateLimitErrorInterceptor,
  networkErrorInterceptor,
  validationErrorInterceptor,
  serverErrorInterceptor,
  requestIdInterceptor,
  tenantIsolationInterceptor,
} from './interceptors';

// Cache Manager
export { CacheManager } from './CacheManager';

// Storage Adapters
export { defaultStorage, createStorageAdapter } from './adapters/StorageAdapter';
export type { StorageAdapter } from './adapters/StorageAdapter';
