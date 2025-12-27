import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisCacheManagerService } from '@common/services/redis-cache-manager.service';
import * as crypto from 'crypto';

/**
 * Cache Strategy Configuration
 */
export interface CacheStrategyConfig {
  ttl?: number;
  namespace?: string;
  tags?: string[];
  compression?: boolean;
  tier?: 'memory' | 'redis' | 'both';
}

/**
 * Cache Entry Metadata
 */
export interface CacheMetadata {
  key: string;
  createdAt: number;
  expiresAt: number;
  hits: number;
  size: number;
  tags: string[];
}

/**
 * Cache Warming Configuration
 */
export interface CacheWarmingConfig {
  enabled: boolean;
  interval: number;
  keys: Array<{
    key: string;
    fetcher: () => Promise<any>;
    ttl: number;
  }>;
}

/**
 * Multi-Tier Cache Strategy Service
 *
 * Enterprise-grade caching with:
 * - L1: In-memory cache (fastest, limited capacity)
 * - L2: Redis distributed cache (shared across instances)
 * - Smart cache key generation
 * - Tag-based invalidation
 * - Cache warming utilities
 * - TTL management and automatic expiration
 * - Cache statistics and monitoring
 *
 * @example
 * const data = await cacheStrategy.get('users:123', async () => {
 *   return userRepository.findOne({ where: { id: '123' } });
 * }, { ttl: 3600, tags: ['users'], tier: 'both' });
 */
@Injectable()
export class CacheStrategyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheStrategyService.name);
  private readonly memoryCache = new Map<string, MemoryCacheEntry>();
  private readonly metadata = new Map<string, CacheMetadata>();
  private readonly tagIndex = new Map<string, Set<string>>();
  private warmingInterval: NodeJS.Timeout | null = null;

  // Memory cache limits
  private readonly MAX_MEMORY_ENTRIES = 10000;
  private readonly MAX_ENTRY_SIZE = 1024 * 1024;
  private readonly DEFAULT_TTL = 3600;
  private currentMemorySize = 0;
  private readonly MAX_MEMORY_SIZE = 100 * 1024 * 1024;

  constructor(
    private readonly redisCache: RedisCacheManagerService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.startCleanupInterval();
    this.logger.log('Multi-tier cache strategy initialized');
  }

  async onModuleDestroy() {
    this.logger.log('Cleaning up cache strategy service...');
    
    // Clear warming interval
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
    }
    
    // Clear all cache maps to free memory
    this.memoryCache.clear();
    this.metadata.clear();
    this.tagIndex.clear();
    
    // Reset memory tracking
    this.currentMemorySize = 0;
    
    this.logger.log('Cache strategy cleanup complete');
  }

  /**
   * Get value from cache or fetch from source (cache-aside pattern)
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheStrategyConfig = {},
  ): Promise<T> {
    const tier = config.tier || 'both';
    const ttl = config.ttl || this.DEFAULT_TTL;
    const namespace = config.namespace;

    // Try L1 (memory) first if tier allows
    if (tier === 'memory' || tier === 'both') {
      const memoryValue = this.getFromMemory<T>(key);
      if (memoryValue !== undefined) {
        this.recordHit(key);
        this.logger.debug(`L1 cache HIT: ${key}`);
        return memoryValue;
      }
    }

    // Try L2 (Redis) if tier allows
    if (tier === 'redis' || tier === 'both') {
      const redisValue = await this.redisCache.get<T>(key, namespace);
      if (redisValue !== undefined) {
        // Populate L1 cache for faster subsequent access
        if (tier === 'both') {
          this.setInMemory(key, redisValue, ttl, config.tags || []);
        }
        this.recordHit(key);
        this.logger.debug(`L2 cache HIT: ${key}`);
        return redisValue;
      }
    }

    // Cache MISS - fetch from source
    this.logger.debug(`Cache MISS: ${key} - fetching from source`);
    const value = await fetcher();

    // Store in cache
    await this.set(key, value, config);

    return value;
  }

  /**
   * Set value in cache with multi-tier support
   */
  async set<T>(
    key: string,
    value: T,
    config: CacheStrategyConfig = {},
  ): Promise<void> {
    const tier = config.tier || 'both';
    const ttl = config.ttl || this.DEFAULT_TTL;
    const tags = config.tags || [];

    // Store in L1 (memory)
    if (tier === 'memory' || tier === 'both') {
      this.setInMemory(key, value, ttl, tags);
    }

    // Store in L2 (Redis)
    if (tier === 'redis' || tier === 'both') {
      await this.redisCache.set(key, value, {
        ttl,
        namespace: config.namespace,
      });
    }

    this.logger.debug(`Cache SET: ${key} (tier: ${tier}, TTL: ${ttl}s)`);
  }

  /**
   * Delete specific cache entry
   */
  async delete(key: string, namespace?: string): Promise<void> {
    // Remove from L1
    this.memoryCache.delete(key);
    this.metadata.delete(key);

    // Remove from tag index
    for (const tagKeys of this.tagIndex.values()) {
      tagKeys.delete(key);
    }

    // Remove from L2
    await this.redisCache.delete(key, namespace);

    this.logger.debug(`Cache DELETE: ${key}`);
  }

  /**
   * Invalidate cache by tags (enterprise feature)
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let count = 0;
    const keysToInvalidate = new Set<string>();

    // Find all keys with matching tags
    for (const tag of tags) {
      const tagKeys = this.tagIndex.get(tag);
      if (tagKeys) {
        tagKeys.forEach(key => keysToInvalidate.add(key));
      }
    }

    // Invalidate all matching keys
    for (const key of keysToInvalidate) {
      await this.delete(key);
      count++;
    }

    // Also invalidate in Redis using pattern
    for (const tag of tags) {
      const redisCount = await this.redisCache.invalidatePattern(`*:${tag}:*`);
      count += redisCount;
    }

    this.logger.log(`Invalidated ${count} cache entries with tags: ${tags.join(', ')}`);
    return count;
  }

  /**
   * Clear cache by namespace
   */
  async clearNamespace(namespace: string): Promise<void> {
    // Clear from memory
    const keysToDelete: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
      this.metadata.delete(key);
    }

    // Clear from Redis
    await this.redisCache.clear(namespace);

    this.logger.log(`Cleared namespace: ${namespace} (${keysToDelete.length} entries)`);
  }

  /**
   * Start automatic cleanup interval for expired entries and memory management
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let evicted = 0;
      
      // Remove expired entries
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiresAt && entry.expiresAt < now) {
          const size = entry.size || 0;
          this.memoryCache.delete(key);
          this.metadata.delete(key);
          this.currentMemorySize -= size;
          evicted++;
        }
      }
      
      // Enforce memory limits - evict oldest entries if over limit
      if (this.memoryCache.size > this.MAX_MEMORY_ENTRIES) {
        const sortedEntries = Array.from(this.metadata.entries())
          .sort((a, b) => a[1].createdAt - b[1].createdAt);
        
        const toRemove = sortedEntries.slice(0, sortedEntries.length - this.MAX_MEMORY_ENTRIES);
        for (const [key] of toRemove) {
          const entry = this.memoryCache.get(key);
          if (entry) {
            this.currentMemorySize -= entry.size || 0;
          }
          this.memoryCache.delete(key);
          this.metadata.delete(key);
          evicted++;
        }
      }
      
      // Check memory size limit
      if (this.currentMemorySize > this.MAX_MEMORY_SIZE) {
        const sortedBySize = Array.from(this.memoryCache.entries())
          .sort((a, b) => (b[1].size || 0) - (a[1].size || 0));
        
        // Remove largest entries until under limit
        let freedMemory = 0;
        for (const [key, entry] of sortedBySize) {
          if (this.currentMemorySize - freedMemory <= this.MAX_MEMORY_SIZE * 0.9) {
            break;
          }
          const size = entry.size || 0;
          this.memoryCache.delete(key);
          this.metadata.delete(key);
          freedMemory += size;
          evicted++;
        }
        this.currentMemorySize -= freedMemory;
      }
      
      if (evicted > 0) {
        this.logger.debug(`Cache cleanup: evicted ${evicted} entries, memory: ${(this.currentMemorySize / 1024 / 1024).toFixed(2)}MB`);
      }
    }, 60000); // Run every minute
  }
  }

  /**
   * Generate deterministic cache key from parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    const paramsString = JSON.stringify(sortedParams);
    const hash = crypto.createHash('md5').update(paramsString).digest('hex');

    return `${prefix}:${hash}`;
  }

  /**
   * Cache warming - preload frequently accessed data
   */
  async warmCache(config: CacheWarmingConfig): Promise<void> {
    if (!config.enabled) {
      return;
    }

    this.logger.log('Starting cache warming...');

    for (const item of config.keys) {
      try {
        const data = await item.fetcher();
        await this.set(item.key, data, { ttl: item.ttl });
        this.logger.debug(`Warmed cache for: ${item.key}`);
      } catch (error) {
        this.logger.error(`Failed to warm cache for ${item.key}:`, error);
      }
    }

    // Schedule recurring warming
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
    }

    this.warmingInterval = setInterval(async () => {
      this.logger.debug('Running scheduled cache warming...');
      await this.warmCache(config);
    }, config.interval);

    this.logger.log(`Cache warming completed. Next run in ${config.interval}ms`);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const memoryStats = this.getMemoryStats();
    const redisStats = await this.redisCache.getStats();

    return {
      memory: memoryStats,
      redis: redisStats,
      totalKeys: memoryStats.entries + redisStats.keys,
    };
  }

  /**
   * Get cache health metrics
   */
  async getHealthMetrics(): Promise<CacheHealthMetrics> {
    const stats = await this.getStats();
    const redisHealth = await this.redisCache.healthCheck();

    let hitRate = 0;
    let totalHits = 0;
    let totalRequests = 0;

    for (const meta of this.metadata.values()) {
      totalHits += meta.hits;
      totalRequests += meta.hits; // Simplified calculation
    }

    if (totalRequests > 0) {
      hitRate = (totalHits / totalRequests) * 100;
    }

    return {
      healthy: redisHealth.healthy,
      hitRate,
      memoryUsage: stats.memory.memoryUsage,
      redisLatency: redisHealth.latency,
      totalEntries: stats.totalKeys,
    };
  }

  // Private helper methods

  private getFromMemory<T>(key: string): T | undefined {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      this.metadata.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  private setInMemory<T>(
    key: string,
    value: T,
    ttl: number,
    tags: string[],
  ): void {
    // Check memory limits
    if (this.memoryCache.size >= this.MAX_MEMORY_ENTRIES) {
      this.evictLeastRecentlyUsed();
    }

    const serialized = JSON.stringify(value);
    const size = Buffer.byteLength(serialized, 'utf8');

    // Skip if entry too large
    if (size > this.MAX_ENTRY_SIZE) {
      this.logger.warn(`Entry too large for memory cache: ${key} (${size} bytes)`);
      return;
    }

    const now = Date.now();
    const expiresAt = now + ttl * 1000;

    this.memoryCache.set(key, {
      value,
      expiresAt,
      lastAccess: now,
    });

    // Update metadata
    this.metadata.set(key, {
      key,
      createdAt: now,
      expiresAt,
      hits: 0,
      size,
      tags,
    });

    // Update tag index
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.metadata.delete(oldestKey);
      this.logger.debug(`Evicted LRU entry: ${oldestKey}`);
    }
  }

  private recordHit(key: string): void {
    const meta = this.metadata.get(key);
    if (meta) {
      meta.hits++;
    }

    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Every minute
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
        this.metadata.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.logger.debug(`Cleaned up ${count} expired cache entries`);
    }
  }

  private getMemoryStats(): MemoryCacheStats {
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const meta of this.metadata.values()) {
      totalSize += meta.size;
      if (now > meta.expiresAt) {
        expiredCount++;
      }
    }

    return {
      entries: this.memoryCache.size,
      memoryUsage: totalSize,
      expiredCount,
      tags: this.tagIndex.size,
    };
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('CacheStrategyService cleanup');
    
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
    }
    
    this.memoryCache.clear();
    this.metadata.clear();
    this.tagIndex.clear();
    
    this.logger.log('CacheStrategyService cleanup complete');
  }
}

// Interfaces

interface MemoryCacheEntry {
  value: any;
  expiresAt: number;
  lastAccess: number;
}

interface MemoryCacheStats {
  entries: number;
  memoryUsage: number;
  expiredCount: number;
  tags: number;
}

interface CacheStats {
  memory: MemoryCacheStats;
  redis: any;
  totalKeys: number;
}

interface CacheHealthMetrics {
  healthy: boolean;
  hitRate: number;
  memoryUsage: number;
  redisLatency?: number;
  totalEntries: number;
}
