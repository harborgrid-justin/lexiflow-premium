import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';
import {
  RedisConfigService,
  RedisDatabase,
  CacheKeyPrefix,
  DEFAULT_CACHE_TTL,
} from './redis.config';

/**
 * Cache Manager Service for LexiFlow AI Legal Suite
 *
 * Provides intelligent caching with:
 * - Automatic cache invalidation
 * - Cache warming strategies
 * - TTL management
 * - Cache hit/miss tracking
 * - Bulk operations
 * - Pattern-based deletion
 */

export interface CacheOptions {
  ttl?: number;
  prefix?: CacheKeyPrefix;
  database?: RedisDatabase;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

@Injectable()
export class CacheManagerService implements OnModuleInit, OnModuleDestroy {
  private clients: Map<RedisDatabase, RedisClientType> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };

  constructor(private redisConfig: RedisConfigService) {}

  async onModuleInit() {
    console.log('Cache Manager: Initializing...');

    // Create clients for commonly used databases
    await this.initializeClients([
      RedisDatabase.DEFAULT,
      RedisDatabase.SESSIONS,
      RedisDatabase.API_CACHE,
      RedisDatabase.SEARCH_CACHE,
    ]);

    console.log('✓ Cache Manager: Initialized successfully');
  }

  async onModuleDestroy() {
    console.log('Cache Manager: Shutting down...');
    await this.redisConfig.disconnectAll();
    console.log('✓ Cache Manager: Shut down complete');
  }

  /**
   * Initialize Redis clients for specific databases
   */
  private async initializeClients(databases: RedisDatabase[]): Promise<void> {
    for (const db of databases) {
      try {
        const client = await this.redisConfig.createClient('cache', db);
        this.clients.set(db, client);
      } catch (error) {
        console.error(`Cache Manager: Failed to initialize database ${db}:`, error.message);
      }
    }
  }

  /**
   * Get Redis client for specific database
   */
  private async getClient(database: RedisDatabase = RedisDatabase.DEFAULT): Promise<RedisClientType> {
    if (!this.clients.has(database)) {
      const client = await this.redisConfig.createClient('cache', database);
      this.clients.set(database, client);
    }
    return this.clients.get(database)!;
  }

  /**
   * Build cache key with prefix
   */
  private buildKey(key: string, prefix?: CacheKeyPrefix): string {
    return prefix ? `${prefix}${key}` : key;
  }

  /**
   * Set cache value
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const client = await this.getClient(options.database);
      const cacheKey = this.buildKey(key, options.prefix);
      const serializedValue = JSON.stringify(value);

      if (options.ttl && options.ttl > 0) {
        await client.setEx(cacheKey, options.ttl, serializedValue);
      } else {
        await client.set(cacheKey, serializedValue);
      }

      this.stats.sets++;

    } catch (error) {
      console.error(`Cache Manager: Error setting key '${key}':`, error.message);
      throw error;
    }
  }

  /**
   * Get cache value
   */
  async get<T>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      const client = await this.getClient(options.database);
      const cacheKey = this.buildKey(key, options.prefix);
      const value = await client.get(cacheKey);

      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      return JSON.parse(value) as T;

    } catch (error) {
      console.error(`Cache Manager: Error getting key '${key}':`, error.message);
      return null;
    }
  }

  /**
   * Get or set cache value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Generate value using factory function
    const value = await factory();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Delete cache key
   */
  async delete(
    key: string,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const client = await this.getClient(options.database);
      const cacheKey = this.buildKey(key, options.prefix);
      const result = await client.del(cacheKey);

      this.stats.deletes++;
      return result > 0;

    } catch (error) {
      console.error(`Cache Manager: Error deleting key '${key}':`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(
    pattern: string,
    options: CacheOptions = {}
  ): Promise<number> {
    try {
      const client = await this.getClient(options.database);
      const searchPattern = options.prefix ? `${options.prefix}${pattern}` : pattern;

      // Scan for matching keys
      const keys: string[] = [];
      for await (const key of client.scanIterator({ MATCH: searchPattern, COUNT: 100 })) {
        keys.push(key);
      }

      if (keys.length === 0) {
        return 0;
      }

      // Delete in batches
      const deleted = await client.del(keys);
      this.stats.deletes += deleted;

      console.log(`Cache Manager: Deleted ${deleted} keys matching pattern '${searchPattern}'`);
      return deleted;

    } catch (error) {
      console.error(`Cache Manager: Error deleting pattern '${pattern}':`, error.message);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(
    key: string,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const client = await this.getClient(options.database);
      const cacheKey = this.buildKey(key, options.prefix);
      const result = await client.exists(cacheKey);
      return result > 0;

    } catch (error) {
      console.error(`Cache Manager: Error checking existence of key '${key}':`, error.message);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async getTTL(
    key: string,
    options: CacheOptions = {}
  ): Promise<number> {
    try {
      const client = await this.getClient(options.database);
      const cacheKey = this.buildKey(key, options.prefix);
      return await client.ttl(cacheKey);

    } catch (error) {
      console.error(`Cache Manager: Error getting TTL for key '${key}':`, error.message);
      return -1;
    }
  }

  /**
   * Set expiration for existing key
   */
  async expire(
    key: string,
    ttl: number,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const client = await this.getClient(options.database);
      const cacheKey = this.buildKey(key, options.prefix);
      return await client.expire(cacheKey, ttl);

    } catch (error) {
      console.error(`Cache Manager: Error setting expiration for key '${key}':`, error.message);
      return false;
    }
  }

  /**
   * Increment numeric value
   */
  async increment(
    key: string,
    amount: number = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    try {
      const client = await this.getClient(options.database);
      const cacheKey = this.buildKey(key, options.prefix);
      const result = await client.incrBy(cacheKey, amount);

      // Set TTL if specified
      if (options.ttl && options.ttl > 0) {
        await client.expire(cacheKey, options.ttl);
      }

      return result;

    } catch (error) {
      console.error(`Cache Manager: Error incrementing key '${key}':`, error.message);
      throw error;
    }
  }

  /**
   * Get multiple keys at once (bulk operation)
   */
  async mget<T>(
    keys: string[],
    options: CacheOptions = {}
  ): Promise<(T | null)[]> {
    try {
      const client = await this.getClient(options.database);
      const cacheKeys = keys.map(key => this.buildKey(key, options.prefix));
      const values = await client.mGet(cacheKeys);

      return values.map(value => {
        if (value === null) {
          this.stats.misses++;
          return null;
        }
        this.stats.hits++;
        return JSON.parse(value) as T;
      });

    } catch (error) {
      console.error('Cache Manager: Error getting multiple keys:', error.message);
      return keys.map(() => null);
    } finally {
      this.updateHitRate();
    }
  }

  /**
   * Set multiple keys at once (bulk operation)
   */
  async mset<T>(
    entries: Array<{ key: string; value: T }>,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const client = await this.getClient(options.database);

      // Use pipeline for efficiency
      const pipeline = client.multi();

      for (const entry of entries) {
        const cacheKey = this.buildKey(entry.key, options.prefix);
        const serializedValue = JSON.stringify(entry.value);

        if (options.ttl && options.ttl > 0) {
          pipeline.setEx(cacheKey, options.ttl, serializedValue);
        } else {
          pipeline.set(cacheKey, serializedValue);
        }
      }

      await pipeline.exec();
      this.stats.sets += entries.length;

    } catch (error) {
      console.error('Cache Manager: Error setting multiple keys:', error.message);
      throw error;
    }
  }

  /**
   * Cache invalidation for specific entity type
   */
  async invalidateEntity(
    entityType: 'case' | 'client' | 'document' | 'user',
    entityId: string
  ): Promise<void> {
    const patterns = {
      case: [
        `${CacheKeyPrefix.CASE}${entityId}*`,
        `${CacheKeyPrefix.ANALYTICS}case:${entityId}*`,
        `${CacheKeyPrefix.SEARCH}case:${entityId}*`,
      ],
      client: [
        `${CacheKeyPrefix.CLIENT}${entityId}*`,
        `${CacheKeyPrefix.ANALYTICS}client:${entityId}*`,
      ],
      document: [
        `${CacheKeyPrefix.DOCUMENT}${entityId}*`,
        `${CacheKeyPrefix.SEARCH}document:${entityId}*`,
      ],
      user: [
        `${CacheKeyPrefix.USER}${entityId}*`,
        `${CacheKeyPrefix.SESSION}${entityId}*`,
      ],
    };

    const patternsToDelete = patterns[entityType] || [];

    for (const pattern of patternsToDelete) {
      await this.deletePattern(pattern);
    }

    console.log(`Cache Manager: Invalidated cache for ${entityType}:${entityId}`);
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache<T>(
    key: string,
    value: T,
    options: CacheOptions = { ttl: DEFAULT_CACHE_TTL.LONG }
  ): Promise<void> {
    await this.set(key, value, options);
    console.log(`Cache Manager: Warmed cache for key '${key}'`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get Redis info for monitoring
   */
  async getRedisInfo(database: RedisDatabase = RedisDatabase.DEFAULT): Promise<any> {
    return await this.redisConfig.getConnectionInfo('cache', database);
  }

  /**
   * Health check for cache system
   */
  async healthCheck(): Promise<boolean> {
    try {
      const databases = [
        RedisDatabase.DEFAULT,
        RedisDatabase.API_CACHE,
        RedisDatabase.SESSIONS,
      ];

      const healthChecks = await Promise.all(
        databases.map(db => this.redisConfig.healthCheck('cache', db))
      );

      return healthChecks.every(check => check === true);

    } catch (error) {
      console.error('Cache Manager: Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Clear all caches (use with extreme caution!)
   */
  async clearAll(database: RedisDatabase = RedisDatabase.DEFAULT): Promise<void> {
    console.warn(`Cache Manager: Clearing all caches in database ${database}`);
    await this.redisConfig.flushDatabase('cache', database);
    this.resetStats();
  }
}

/**
 * Cache Decorator Factory
 * Use this decorator to automatically cache method results
 */
export function Cacheable(options: {
  prefix: CacheKeyPrefix;
  ttl?: number;
  keyGenerator?: (...args: any[]) => string;
}) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager: CacheManagerService = this.cacheManager;

      if (!cacheManager) {
        // If no cache manager, just execute the method
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const cacheKey = options.keyGenerator
        ? options.keyGenerator(...args)
        : `${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cacheManager.get(cacheKey, {
        prefix: options.prefix,
        ttl: options.ttl,
      });

      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await originalMethod.apply(this, args);

      await cacheManager.set(cacheKey, result, {
        prefix: options.prefix,
        ttl: options.ttl || DEFAULT_CACHE_TTL.MEDIUM,
      });

      return result;
    };

    return descriptor;
  };
}
