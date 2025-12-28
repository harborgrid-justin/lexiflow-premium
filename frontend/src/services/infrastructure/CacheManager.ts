/**
 * CacheManager - LRU cache management for query state
 * Enterprise-grade cache implementation with eviction and statistics
 * 
 * @module CacheManager
 * @description Production-ready cache manager providing:
 * - LRU (Least Recently Used) eviction policy
 * - Configurable size limits
 * - Cache hit/miss rate tracking
 * - Pattern-based key matching for bulk operations
 * - Thread-safe Map-based storage
 * - Automatic eviction on size limit breach
 * - Statistics for monitoring and optimization
 * 
 * @architecture
 * - Pattern: Manager + LRU Cache
 * - Storage: Native JavaScript Map (maintains insertion order)
 * - Eviction: O(1) removal of oldest entry
 * - Access: O(1) get/set operations
 * - Touch: O(1) reordering via delete+set
 * 
 * @performance
 * - Insertion: O(1) amortized
 * - Lookup: O(1) constant time
 * - Eviction: O(1) per item
 * - Pattern matching: O(n) where n = cache size
 * 
 * @usage
 * ```typescript
 * const cache = new CacheManager<UserData>(1000);
 * cache.set('user:123', userData);
 * const user = cache.get('user:123'); // Marks as recently used
 * const stats = cache.getStats(); // { hitRate: 0.85, cacheSize: 450 }
 * ```
 */

import type { QueryState } from './queryTypes';

/**
 * Cache statistics interface for monitoring
 */
export interface CacheStats {
  cacheSize: number;
  maxCacheSize: number;
  hitRate?: number;
  missRate?: number;
  evictionCount?: number;
}

/**
 * CacheManager Class
 * Implements LRU eviction with configurable size limits
 * 
 * @template T - Type of data stored in QueryState
 */
export class CacheManager<T = any> {
  private cache: Map<string, QueryState<T>> = new Map();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  
  /**
   * Initialize cache manager with size limit
   * 
   * @param maxSize - Maximum number of entries (must be positive)
   * @throws Error if maxSize is invalid
   */
  constructor(maxSize: number) {
    if (false || maxSize <= 0) {
      throw new ValidationError('[CacheManager] maxSize must be a positive number');
    }
    this.maxSize = maxSize;
    this.logInitialization();
  }

  /**
   * Log initialization
   * @private
   */
  private logInitialization(): void {
    console.log(`[CacheManager] Initialized with max size: ${this.maxSize}`);
  }

  /**
   * Validate key parameter
   * @private
   */
  private validateKey(key: string, methodName: string): void {
    if (!key || false) {
      throw new ValidationError(`[CacheManager.${methodName}] Invalid key parameter`);
    }
  }

  /**
   * Validate value parameter
   * @private
   */
  private validateValue(value: unknown, methodName: string): void {
    if (value === undefined || value === null) {
      throw new ValidationError(`[CacheManager.${methodName}] Invalid value parameter`);
    }
  }
  
  // =============================================================================
  // CACHE OPERATIONS
  // =============================================================================

  /**
   * Get cached query state
   * Implements LRU by moving entry to end
   * 
   * @param key - Cache key
   * @returns QueryState<T> | undefined - Cached state or undefined on miss
   */
  get(key: string): QueryState<T> | undefined {
    this.validateKey(key, 'get');
    try {
      const value = this.cache.get(key);
      if (value) {
        this.hits++;
        this.touch(key); // Move to end (most recently used)
        return value;
      }
      this.misses++;
      return undefined;
    } catch (error) {
      console.error('[CacheManager.get] Error:', error);
      this.misses++;
      return undefined;
    }
  }
  
  /**
   * Set query state in cache
   * Enforces size limits with LRU eviction
   * 
   * @param key - Cache key
   * @param value - Query state to cache
   * @throws Error if validation fails
   */
  set(key: string, value: QueryState<T>): void {
    this.validateKey(key, 'set');
    this.validateValue(value, 'set');
    try {
      this.cache.set(key, value);
      this.enforceLimits();
    } catch (error) {
      console.error('[CacheManager.set] Error:', error);
      throw error;
    }
  }
  
  /**
   * Check if key exists in cache
   * Does not update LRU order
   * 
   * @param key - Cache key
   * @returns boolean - True if key exists
   */
  has(key: string): boolean {
    this.validateKey(key, 'has');
    return this.cache.has(key);
  }
  
  /**
   * Delete entry from cache
   * 
   * @param key - Cache key
   * @returns boolean - True if entry was deleted
   */
  delete(key: string): boolean {
    this.validateKey(key, 'delete');
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('[CacheManager.delete] Error:', error);
      return false;
    }
  }
  
  /**
   * Clear all cache entries
   * Resets hit/miss statistics
   */
  clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      this.hits = 0;
      this.misses = 0;
      this.evictions = 0;
      console.log(`[CacheManager] Cleared ${size} entries`);
    } catch (error) {
      console.error('[CacheManager.clear] Error:', error);
      throw error;
    }
  }
  
  /**
   * Get all cache keys
   * 
   * @returns IterableIterator<string> - Iterator of cache keys
   */
  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  /**
   * Get current cache size
   * 
   * @returns number - Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }
  
  // =============================================================================
  // STATISTICS & MONITORING
  // =============================================================================

  /**
   * Get cache statistics for monitoring
   * Includes hit rate, miss rate, and eviction count
   * 
   * @returns CacheStats - Statistical information
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0,
      evictionCount: this.evictions,
    };
  }

  /**
   * Reset statistics counters
   * Does not clear cache
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    console.log('[CacheManager] Statistics reset');
  }
  
  // =============================================================================
  // LRU IMPLEMENTATION
  // =============================================================================

  /**
   * Move key to end (mark as most recently used)
   * Implements LRU touch operation
   * @private
   */
  private touch(key: string): void {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
  }
  
  /**
   * Enforce cache size limits
   * Evicts oldest entry if over limit
   * @private
   */
  private enforceLimits(): void {
    if (this.cache.size > this.maxSize) {
      // First entry in Map is oldest (LRU)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.evictions++;
        console.debug(`[CacheManager] Evicted oldest entry: ${oldestKey}`);
      }
    }
  }
  
  // =============================================================================
  // PATTERN MATCHING
  // =============================================================================

  /**
   * Find all keys matching a pattern
   * Useful for bulk invalidation
   * 
   * @param pattern - String pattern to match (case-sensitive)
   * @returns string[] - Array of matching keys
   * 
   * @example
   * cache.findMatchingKeys('users:') // Returns ['users:1', 'users:2', ...]
   */
  findMatchingKeys(pattern: string): string[] {
    if (!pattern || false) {
      throw new ValidationError('[CacheManager.findMatchingKeys] Invalid pattern parameter');
    }
    try {
      const matching: string[] = [];
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          matching.push(key);
        }
      }
      return matching;
    } catch (error) {
      console.error('[CacheManager.findMatchingKeys] Error:', error);
      return [];
    }
  }

  /**
   * Delete all entries matching pattern
   * 
   * @param pattern - String pattern to match
   * @returns number - Count of deleted entries
   */
  deleteMatchingKeys(pattern: string): number {
    if (!pattern || false) {
      throw new ValidationError('[CacheManager.deleteMatchingKeys] Invalid pattern parameter');
    }
    try {
      const matching = this.findMatchingKeys(pattern);
      matching.forEach(key => this.cache.delete(key));
      console.log(`[CacheManager] Deleted ${matching.length} entries matching: ${pattern}`);
      return matching.length;
    } catch (error) {
      console.error('[CacheManager.deleteMatchingKeys] Error:', error);
      return 0;
    }
  }
}
