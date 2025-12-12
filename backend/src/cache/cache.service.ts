import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or undefined
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit for key: ${key}`);
      } else {
        this.logger.debug(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const options = ttl ? { ttl: ttl * 1000 } : {};
      await this.cacheManager.set(key, value, options);
      this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param pattern Key pattern (e.g., 'user:*')
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.del(key)));
        this.logger.debug(`Cache deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Get all keys matching a pattern
   * @param pattern Key pattern (e.g., 'user:*')
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      // Note: This requires Redis store to be properly configured
      const store = this.cacheManager.store as any;
      if (store.keys) {
        return await store.keys(pattern);
      }
      this.logger.warn('Cache store does not support keys operation');
      return [];
    } catch (error) {
      this.logger.error(`Error getting cache keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Get or set cache value
   * If key exists, return cached value
   * If key doesn't exist, execute callback and cache the result
   * @param key Cache key
   * @param callback Function to execute if cache miss
   * @param ttl Time to live in seconds (optional)
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedValue = await this.get<T>(key);
      if (cachedValue !== undefined) {
        return cachedValue;
      }

      // Execute callback if cache miss
      this.logger.debug(`Cache miss for key: ${key}, executing callback`);
      const value = await callback();

      // Cache the result
      await this.set(key, value, ttl);

      return value;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error);
      // If caching fails, still try to execute the callback
      return await callback();
    }
  }

  /**
   * Increment a numeric value in cache
   * @param key Cache key
   * @param increment Amount to increment by (default: 1)
   */
  async increment(key: string, increment: number = 1): Promise<number> {
    try {
      const currentValue = await this.get<number>(key);
      const newValue = (currentValue || 0) + increment;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      this.logger.error(`Error incrementing cache key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement a numeric value in cache
   * @param key Cache key
   * @param decrement Amount to decrement by (default: 1)
   */
  async decrement(key: string, decrement: number = 1): Promise<number> {
    return this.increment(key, -decrement);
  }

  /**
   * Get TTL for a key (if supported by the cache store)
   * @param key Cache key
   */
  async getTtl(key: string): Promise<number | undefined> {
    try {
      const store = this.cacheManager.store as any;
      if (store.ttl) {
        return await store.ttl(key);
      }
      this.logger.warn('Cache store does not support TTL operation');
      return undefined;
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set TTL for a key (if supported by the cache store)
   * @param key Cache key
   * @param ttl Time to live in seconds
   */
  async setTtl(key: string, ttl: number): Promise<boolean> {
    try {
      const store = this.cacheManager.store as any;
      if (store.expire) {
        await store.expire(key, ttl);
        return true;
      }
      this.logger.warn('Cache store does not support expire operation');
      return false;
    } catch (error) {
      this.logger.error(`Error setting TTL for key ${key}:`, error);
      return false;
    }
  }
}
