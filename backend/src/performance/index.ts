/**
 * Performance Optimization Module Exports
 *
 * Enterprise-grade performance optimization for LexiFlow Premium
 */

// Module
export { PerformanceModule } from './performance.module';

// Services
export { CacheStrategyService } from './services/cache.strategy.service';
export { QueryOptimizerService } from './services/query.optimizer.service';
export { CompressionService } from './services/compression.service';
export { ConnectionPoolOptimizerService } from './services/connection.pool.optimizer.service';
export { BatchProcessorService } from './services/batch.processor.service';
export { LazyLoadingService } from './services/lazy.loading.service';

// Interceptors
export { CacheControlInterceptor } from './interceptors/cache.control.interceptor';

// Decorators
export {
  Cacheable,
  CacheEvict,
  CachePut,
  CacheDecoratorKeys,
} from './decorators/cacheable.decorator';

// Types & Interfaces
export type {
  CacheableOptions,
  CacheEvictOptions,
  CachePutOptions,
} from './decorators/cacheable.decorator';

export type {
  CacheStrategyConfig,
  CacheMetadata,
  CacheWarmingConfig,
} from './services/cache.strategy.service';

export type {
  QueryAnalysis,
  QueryWarning,
  QueryOptimizationOptions,
  QueryMetrics,
  SlowQuery,
} from './services/query.optimizer.service';

export type {
  CompressionConfig,
  CompressionStats,
} from './services/compression.service';

export type {
  PoolMetrics,
  PoolConfiguration,
  ConnectionEvent,
} from './services/connection.pool.optimizer.service';

export type {
  BatchConfig,
  BatchResult,
  BatchProgress,
  BatchError,
  BatchInsertOptions,
  BatchUpdateOptions,
} from './services/batch.processor.service';

export type {
  PaginationType,
  OffsetPaginationOptions,
  CursorPaginationOptions,
  KeysetPaginationOptions,
  PaginatedResult,
  PaginationMeta,
  LazyLoadConfig,
  DeferredLoader,
} from './services/lazy.loading.service';

export type {
  CacheControlConfig,
} from './interceptors/cache.control.interceptor';
