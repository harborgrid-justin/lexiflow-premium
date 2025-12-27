import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { CacheStrategyService } from './services/cache.strategy.service';
import { QueryOptimizerService } from './services/query.optimizer.service';
import { CompressionService } from './services/compression.service';
import { ConnectionPoolOptimizerService } from './services/connection.pool.optimizer.service';
import { BatchProcessorService } from './services/batch.processor.service';
import { LazyLoadingService } from './services/lazy.loading.service';

// Interceptors
import { CacheControlInterceptor } from './interceptors/cache.control.interceptor';

/**
 * Performance Optimization Module
 *
 * Provides enterprise-grade performance optimization features:
 * - Multi-tier caching (Memory + Redis)
 * - Database query optimization and N+1 detection
 * - Response compression (Gzip + Brotli)
 * - HTTP caching with ETags and Cache-Control
 * - Dynamic connection pool optimization
 * - Batch processing with chunking
 * - Lazy loading and cursor-based pagination
 *
 * @module PerformanceModule
 * @example
 * imports: [PerformanceModule]
 */
@Global()
@Module({
  imports: [TypeOrmModule],
  providers: [
    // Core Services
    CacheStrategyService,
    QueryOptimizerService,
    CompressionService,
    ConnectionPoolOptimizerService,
    BatchProcessorService,
    LazyLoadingService,

    // Interceptors
    CacheControlInterceptor,
  ],
  exports: [
    // Export all services for use in other modules
    CacheStrategyService,
    QueryOptimizerService,
    CompressionService,
    ConnectionPoolOptimizerService,
    BatchProcessorService,
    LazyLoadingService,

    // Export interceptors
    CacheControlInterceptor,
  ],
})
export class PerformanceModule {}
