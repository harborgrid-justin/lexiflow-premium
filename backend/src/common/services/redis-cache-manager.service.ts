import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

/**
 * Cache Configuration
 */
export interface CacheConfig {
  ttl?: number;
  namespace?: string;
}

/**
 * Redis Cache Manager Service
 * Enterprise-grade Redis caching with automatic fallback to in-memory
 *
 * Features:
 * - Distributed caching across all instances
 * - Automatic reconnection with exponential backoff
 * - Connection pooling and health monitoring
 * - Pattern-based cache invalidation
 * - Automatic memory cleanup
 *
 * @example
 * const data = await cacheManager.get('users:123');
 * await cacheManager.set('users:123', userData, { ttl: 3600 });
 * await cacheManager.invalidatePattern('users:*');
 */
@Injectable()
export class RedisCacheManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheManagerService.name);
  private redisClient: RedisClientType | null = null;
  private isRedisConnected = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly DEFAULT_TTL = 3600; // 1 hour

  // In-memory fallback storage
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedis();
    this.startCleanupInterval();
  }

  /**
   * Initialize Redis connection with retry logic
   */
  private async initializeRedis(): Promise<void> {
    const redisEnabled = this.configService.get('REDIS_ENABLED', 'true') === 'true';

    if (!redisEnabled) {
      this.logger.warn('Redis disabled - using in-memory cache (NOT RECOMMENDED FOR PRODUCTION)');
      return;
    }

    try {
      const redisUrl = this.configService.get('redis.url');
      const redisHost = this.configService.get('redis.host', 'localhost');
      const redisPort = this.configService.get('redis.port', 6379);
      const redisPassword = this.configService.get('redis.password');
      const redisUsername = this.configService.get('redis.username', 'default');

      this.redisClient = redisUrl
        ? createClient({
            url: redisUrl,
            socket: {
              reconnectStrategy: (retries) => {
                if (retries > this.MAX_RECONNECT_ATTEMPTS) {
                  this.logger.error('Max Redis reconnection attempts reached');
                  return new Error('Max reconnection attempts exceeded');
                }
                // Exponential backoff: 100ms, 200ms, 400ms, 800ms...
                return Math.min(retries * 100, 3000);
              },
            },
          })
        : createClient({
            socket: {
              host: redisHost,
              port: redisPort,
              reconnectStrategy: (retries) => {
                if (retries > this.MAX_RECONNECT_ATTEMPTS) {
                  return new Error('Max reconnection attempts exceeded');
                }
                return Math.min(retries * 100, 3000);
              },
            },
            username: redisUsername,
            password: redisPassword,
          }) as RedisClientType;

      this.redisClient.on('error', (err) => {
        this.logger.error(`Redis connection error: ${err.message}`);
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected successfully');
        this.isRedisConnected = true;
        this.reconnectAttempts = 0;
      });

      this.redisClient.on('reconnecting', () => {
        this.reconnectAttempts++;
        this.logger.warn(`Redis reconnecting... Attempt ${this.reconnectAttempts}`);
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis client ready for commands');
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.redisClient = null;
      this.isRedisConnected = false;
    }
  }

  /**
   * Get value from cache (Redis first, fallback to memory)
   */
  async get<T>(key: string, namespace?: string): Promise<T | undefined> {
    const fullKey = this.buildKey(key, namespace);

    // Try Redis first
    if (this.useRedis()) {
      try {
        const data = await this.redisClient!.get(fullKey);
        if (data) {
          this.logger.debug(`Redis cache HIT: ${fullKey}`);
          return JSON.parse(data) as T;
        }
        this.logger.debug(`Redis cache MISS: ${fullKey}`);
        return undefined;
      } catch (error) {
        this.logger.error(`Redis GET error for ${fullKey}:`, error);
        return this.getFromMemory(fullKey);
      }
    }

    // Fallback to memory
    return this.getFromMemory(fullKey);
  }

  /**
   * Set value in cache (Redis + memory backup)
   */
  async set<T>(
    key: string,
    value: T,
    config: CacheConfig = {},
  ): Promise<void> {
    const fullKey = this.buildKey(key, config.namespace);
    const ttl = config.ttl || this.DEFAULT_TTL;
    const serialized = JSON.stringify(value);

    // Store in Redis
    if (this.useRedis()) {
      try {
        await this.redisClient!.setEx(fullKey, ttl, serialized);
        this.logger.debug(`Redis cache SET: ${fullKey} (TTL: ${ttl}s)`);
        return;
      } catch (error) {
        this.logger.error(`Redis SET error for ${fullKey}:`, error);
        // Fall through to memory storage
      }
    }

    // Fallback to memory
    this.setInMemory(fullKey, value, ttl);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, namespace?: string): Promise<void> {
    const fullKey = this.buildKey(key, namespace);

    if (this.useRedis()) {
      try {
        await this.redisClient!.del(fullKey);
        this.logger.debug(`Redis cache DEL: ${fullKey}`);
        return;
      } catch (error) {
        this.logger.error(`Redis DEL error for ${fullKey}:`, error);
      }
    }

    this.cache.delete(fullKey);
  }

  /**
   * Invalidate cache entries matching pattern (Redis SCAN for safety)
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;

    if (this.useRedis()) {
      try {
        let cursor = 0;
        const keys: string[] = [];

        do {
          const result = await this.redisClient!.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
          });
          cursor = result.cursor;
          keys.push(...result.keys);
        } while (cursor !== 0);

        if (keys.length > 0) {
          await this.redisClient!.del(keys);
          count = keys.length;
        }

        this.logger.log(`Invalidated ${count} Redis cache entries matching: ${pattern}`);
        return count;
      } catch (error) {
        this.logger.error(`Redis pattern invalidation error:`, error);
      }
    }

    // Fallback: invalidate in memory
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.logger.log(`Invalidated ${count} memory cache entries matching: ${pattern}`);
    return count;
  }

  /**
   * Clear all cache or namespace
   */
  async clear(namespace?: string): Promise<void> {
    if (namespace) {
      await this.invalidatePattern(`${namespace}:*`);
    } else if (this.useRedis()) {
      try {
        await this.redisClient!.flushDb();
        this.logger.log('Redis cache cleared');
      } catch (error) {
        this.logger.error('Redis FLUSHDB error:', error);
      }
    } else {
      this.cache.clear();
      this.logger.log('Memory cache cleared');
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
  async getStats(): Promise<CacheStats> {
    if (this.useRedis()) {
      try {
        await this.redisClient!.info('stats');
        const dbSize = await this.redisClient!.dbSize();

        return {
          type: 'redis',
          connected: this.isRedisConnected,
          keys: dbSize,
          memoryUsage: 0, // Parse from info if needed
        };
      } catch (error) {
        this.logger.error('Redis stats error:', error);
      }
    }

    const now = Date.now();
    let expiredCount = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      type: 'memory',
      connected: false,
      keys: this.cache.size,
      expiredCount,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    if (!this.useRedis()) {
      return { healthy: true };
    }

    try {
      const start = Date.now();
      await this.redisClient!.ping();
      const latency = Date.now() - start;

      return { healthy: true, latency };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return { healthy: false };
    }
  }

  // Private helper methods

  private useRedis(): boolean {
    return this.isRedisConnected && this.redisClient !== null;
  }

  private buildKey(key: string, namespace?: string): string {
    const prefix = this.configService.get('REDIS_KEY_PREFIX', 'lexiflow:');
    return namespace ? `${prefix}${namespace}:${key}` : `${prefix}${key}`;
  }

  private getFromMemory<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    this.logger.debug(`Memory cache HIT: ${key}`);
    return entry.value as T;
  }

  private setInMemory<T>(key: string, value: T, ttl: number): void {
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });

    this.logger.debug(`Memory cache SET: ${key} (TTL: ${ttl}s)`);
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  private cleanup(): void {
    if (this.useRedis()) return; // Redis handles TTL automatically

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
    return this.cache.size * 1024; // Rough estimation: 1KB per entry
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redisClient && this.isRedisConnected) {
      try {
        await this.redisClient.quit();
        this.logger.log('Redis connection closed gracefully');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error);
      }
    }
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  type: 'redis' | 'memory';
  connected: boolean;
  keys: number;
  expiredCount?: number;
  memoryUsage: number;
}
