/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    FACTORY BARREL EXPORT                                  ║
 * ║           Central export for all factory abstractions                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories
 * @description Export all factory abstractions for easy import
 * 
 * USAGE:
 * ```typescript
 * import { 
 *   GenericRepository,
 *   EventEmitter,
 *   BackendSyncService,
 *   CacheManager,
 *   InterceptorChain
 * } from '@/services/core/factories';
 * ```
 */

// Repository pattern
export {
  GenericRepository,
  createQueryKeys,
  type BaseEntity,
  type IApiService,
} from './GenericRepository';

// Event emitter pattern
export {
  EventEmitter,
  TypedEventEmitter,
  type EventListener,
  type UnsubscribeFunction,
  type EventEmitterConfig,
} from './EventEmitterMixin';

// Backend sync pattern
export {
  BackendSyncService,
  type SyncQueueItem,
  type BackendSyncConfig,
  type SyncResult,
} from './BackendSyncService';

// Cache management
export {
  CacheManager,
  type CacheConfig,
  type CacheStats,
} from './CacheManager';

// Interceptor chain
export {
  InterceptorChain,
  createAuthInterceptor,
  createRetryInterceptor,
  createLoggingInterceptor,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
  type RequestConfig,
  type Response,
  type InterceptorHandle,
} from './InterceptorChain';

// Registry pattern
export {
  GenericRegistry,
  createSingletonRegistry,
  type FactoryFunction,
  type RegistryConfig,
} from './GenericRegistry';

// Utility factories
export {
  IdGenerator,
  TimerManager,
  StoragePersistence,
  debounce,
  throttle,
  retry,
} from './Utilities';
