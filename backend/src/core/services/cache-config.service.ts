import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * CacheConfigService
 *
 * Provides globally injectable access to caching configuration.
 * Consolidates cache TTL, memory limits, and strategy settings.
 */
@Injectable()
export class CacheConfigService {
  // Database Cache
  get dbCacheEnabled(): boolean {
    return MasterConfig.DB_CACHE_ENABLED;
  }

  get dbCacheDuration(): number {
    return MasterConfig.DB_CACHE_DURATION;
  }

  get dbCacheType(): string {
    return MasterConfig.DB_CACHE_TYPE;
  }

  // Redis Cache TTL
  get redisSessionTtl(): number {
    return MasterConfig.REDIS_SESSION_TTL;
  }

  get redisCacheTtl(): number {
    return MasterConfig.REDIS_CACHE_TTL;
  }

  get redisRateLimitTtl(): number {
    return MasterConfig.REDIS_RATE_LIMIT_TTL;
  }

  // Cache Control
  get cacheControlMaxAge(): number {
    return MasterConfig.CACHE_CONTROL_MAX_AGE;
  }

  get enableEtag(): boolean {
    return MasterConfig.ENABLE_ETAG;
  }

  get enableCacheControl(): boolean {
    return MasterConfig.ENABLE_CACHE_CONTROL;
  }

  // Memory Cache Limits (configurable defaults)
  get maxMemoryEntries(): number {
    return 10000;
  }

  get maxEntrySize(): number {
    return 1048576; // 1MB
  }

  get maxMemorySize(): number {
    return 104857600; // 100MB
  }

  get defaultTtl(): number {
    return 3600; // 1 hour
  }

  // Compression Settings
  get enableCompression(): boolean {
    return MasterConfig.ENABLE_COMPRESSION;
  }

  get compressionLevel(): number {
    return MasterConfig.COMPRESSION_LEVEL;
  }

  get compressionThreshold(): number {
    return MasterConfig.COMPRESSION_THRESHOLD;
  }

  // Cache Tiers
  getCacheTierConfig(tier: 'memory' | 'redis' | 'database'): Record<string, unknown> {
    const configs: Record<string, Record<string, unknown>> = {
      memory: {
        maxEntries: this.maxMemoryEntries,
        maxSize: this.maxMemorySize,
        ttl: this.defaultTtl,
      },
      redis: {
        sessionTtl: this.redisSessionTtl,
        cacheTtl: this.redisCacheTtl,
        rateLimitTtl: this.redisRateLimitTtl,
      },
      database: {
        enabled: this.dbCacheEnabled,
        duration: this.dbCacheDuration,
        type: this.dbCacheType,
      },
    };
    return configs[tier];
  }

  // Cache namespaces
  getCacheNamespace(entity: string): string {
    return `lexiflow:cache:${entity}`;
  }

  // Cache key builder
  buildCacheKey(namespace: string, ...parts: string[]): string {
    return `${namespace}:${parts.join(':')}`;
  }

  /**
   * Get cache configuration summary
   */
  getSummary(): Record<string, unknown> {
    return {
      memory: {
        maxEntries: this.maxMemoryEntries,
        maxSize: this.maxMemorySize,
        defaultTtl: this.defaultTtl,
      },
      redis: {
        sessionTtl: this.redisSessionTtl,
        cacheTtl: this.redisCacheTtl,
      },
      database: {
        enabled: this.dbCacheEnabled,
        duration: this.dbCacheDuration,
      },
      compression: {
        enabled: this.enableCompression,
        level: this.compressionLevel,
        threshold: this.compressionThreshold,
      },
    };
  }
}
