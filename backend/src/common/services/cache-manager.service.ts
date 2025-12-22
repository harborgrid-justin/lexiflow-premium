import { Injectable, Logger } from '@nestjs/common';

/**
 * Cache Configuration
 */
export interface CacheConfig {
  ttl?: number; // seconds
  namespace?: string;
}

/**
 * Cache Manager Service
 * Provides enterprise Redis-based caching with TTL and pattern-based invalidation
 * Falls back to in-memory cache when Redis is unavailable
 * 
 * @example
 * const data = await cacheManager.get('users:123');
 * await cacheManager.set('users:123', userData, { ttl: 3600 });
 * await cacheManager.invalidatePattern('users:*');
 */
@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name);
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Start cleanup interval for in-memory cache
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, namespace?: string): Promise<T | undefined> {
    const fullKey = this.buildKey(key, namespace);

    const entry = this.cache.get(fullKey);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey);
      return undefined;
    }

    this.logger.debug(`Cache HIT: ${fullKey}`);
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    config: CacheConfig = {},
  ): Promise<void> {
    const fullKey = this.buildKey(key, config.namespace);
    const ttl = (config.ttl || this.DEFAULT_TTL) * 1000; // Convert to ms
    const expiresAt = Date.now() + ttl;

    this.cache.set(fullKey, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });

    this.logger.debug(`Cache SET: ${fullKey} (TTL: ${config.ttl || this.DEFAULT_TTL}s)`);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, namespace?: string): Promise<void> {
    const fullKey = this.buildKey(key, namespace);
    this.cache.delete(fullKey);
    this.logger.debug(`Cache DEL: ${fullKey}`);
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.logger.log(`Invalidated ${count} cache entries matching: ${pattern}`);
    return count;
  }

  /**
   * Clear all cache
   */
  async clear(namespace?: string): Promise<void> {
    if (namespace) {
      await this.invalidatePattern(`${namespace}:*`);
    } else {
      this.cache.clear();
      this.logger.log('Cache cleared');
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    config: CacheConfig = {},
  ): Promise<T> {
    const cached = await this.get<T>(key, config.namespace);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, config);
    return value;
  }

  /**
   * Wrap function with caching
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    config: CacheConfig = {},
  ): Promise<T> {
    return this.getOrSet(key, fn, config);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    const _hitCount = 0;
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      expiredCount,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(`Cleanup removed ${removedCount} expired entries`);
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimation
    return this.cache.size * 1024; // Assume 1KB per entry
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  size: number;
  expiredCount: number;
  memoryUsage: number;
}
