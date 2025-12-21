/**
 * @module utils/cacheManager
 * @category Utils - Performance
 * @description Generic LRU cache manager with TTL support and automatic cleanup.
 * Provides type-safe caching with configurable eviction policies.
 * 
 * FEATURES:
 * - Least Recently Used (LRU) eviction
 * - Time-to-live (TTL) expiration
 * - Automatic cleanup of expired entries
 * - Generic type support
 * - Memory-efficient with size limits
 * 
 * USAGE:
 * ```typescript
 * const cache = new CacheManager<string, Data>({ 
 *   maxSize: 100, 
 *   ttlMs: 60000 
 * });
 * 
 * cache.set('key', data);
 * const value = cache.get('key');
 * ```
 */

import { QUERY_CACHE_MAX_SIZE, QUERY_CACHE_STALE_TIME_MS } from "@/config/database/cache.config";

// ============================================================================
// TYPES
// ============================================================================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
}

interface CacheOptions {
  /** Maximum number of entries (default: 100) */
  maxSize?: number;
  /** Time-to-live in milliseconds (default: 5 minutes) */
  ttlMs?: number;
  /** Auto-cleanup interval in milliseconds (default: 1 minute) */
  cleanupIntervalMs?: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

/**
 * Generic cache manager with LRU eviction and TTL support
 */
export class CacheManager<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private maxSize: number;
  private ttlMs: number;
  private cleanupIntervalMs: number;
  private cleanupTimer?: NodeJS.Timeout;
  
  // Statistics
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? QUERY_CACHE_MAX_SIZE;
    this.ttlMs = options.ttlMs ?? QUERY_CACHE_STALE_TIME_MS;
    this.cleanupIntervalMs = options.cleanupIntervalMs ?? 60 * 1000; // 1 minute
    
    // Start automatic cleanup
    this.startCleanup();
  }

  /**
   * Get a value from the cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return undefined;
    }
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }
    
    // Update access info
    entry.accessCount++;
    entry.timestamp = Date.now();
    
    this.hits++;
    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: K, value: V): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: total > 0 ? this.hits / total : 0
    };
  }

  /**
   * Get or compute a value (lazy evaluation)
   */
  getOrCompute(key: K, compute: () => V): V {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const value = compute();
    this.set(key, value);
    return value;
  }

  /**
   * Async version of getOrCompute
   */
  async getOrComputeAsync(key: K, compute: () => Promise<V>): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const value = await compute();
    this.set(key, value);
    return value;
  }

  /**
   * Dispose of the cache manager and stop cleanup
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private isExpired(entry: CacheEntry<V>): boolean {
    return Date.now() - entry.timestamp > this.ttlMs;
  }

  private evictLRU(): void {
    let lruKey: K | undefined;
    let lruTime = Infinity;
    let lruAccess = Infinity;
    
    // Find least recently used entry
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < lruTime || 
          (entry.timestamp === lruTime && entry.accessCount < lruAccess)) {
        lruKey = key;
        lruTime = entry.timestamp;
        lruAccess = entry.accessCount;
      }
    }
    
    if (lruKey !== undefined) {
      this.cache.delete(lruKey);
      this.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: K[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        toDelete.push(key);
      }
    }
    
    for (const key of toDelete) {
      this.cache.delete(key);
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);
    
    // Prevent cleanup from keeping process alive
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }
}

// ============================================================================
// SINGLETON CACHE FACTORY
// ============================================================================

/**
 * Global cache registry for named caches
 */
class CacheRegistry {
  private caches = new Map<string, CacheManager<any, any>>();

  get<K, V>(name: string, options?: CacheOptions): CacheManager<K, V> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new CacheManager<K, V>(options));
    }
    return this.caches.get(name)! as CacheManager<K, V>;
  }

  dispose(name: string): void {
    const cache = this.caches.get(name);
    if (cache) {
      cache.dispose();
      this.caches.delete(name);
    }
  }

  disposeAll(): void {
    for (const cache of this.caches.values()) {
      cache.dispose();
    }
    this.caches.clear();
  }
}

export const cacheRegistry = new CacheRegistry();
