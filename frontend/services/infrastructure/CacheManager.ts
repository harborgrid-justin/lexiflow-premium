/**
 * CacheManager - LRU cache management for queries
 * 
 * Purpose: Encapsulates all cache-related logic
 * Pattern: Manager + LRU Cache
 * Extracted from: queryClient.ts
 * 
 * Responsibilities:
 * - Cache storage and retrieval
 * - LRU eviction policy
 * - Cache size limits
 * - Touch/access tracking
 */

import type { QueryState } from './QueryTypes';

export interface CacheStats {
  cacheSize: number;
  maxCacheSize: number;
  hitRate?: number;
  missRate?: number;
}

export class CacheManager<T = any> {
  private cache: Map<string, QueryState<T>> = new Map();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  /**
   * Get cached query state
   * Updates LRU by moving to end
   */
  get(key: string): QueryState<T> | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.hits++;
      this.touch(key);
      return value;
    }
    this.misses++;
    return undefined;
  }
  
  /**
   * Set query state in cache
   * Enforces size limits
   */
  set(key: string, value: QueryState<T>): void {
    this.cache.set(key, value);
    this.enforceLimits();
  }
  
  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
  
  /**
   * Get all cache keys
   */
  keys(): IterableIterator<string> {
    return this.cache.keys();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
      missRate: total > 0 ? this.misses / total : 0
    };
  }
  
  /**
   * Move key to end (most recently used)
   * Implements LRU touch
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
   */
  private enforceLimits(): void {
    if (this.cache.size > this.maxSize) {
      // First entry is oldest (LRU)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }
  
  /**
   * Find all keys matching a pattern
   */
  findMatchingKeys(pattern: string): string[] {
    const matching: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        matching.push(key);
      }
    }
    return matching;
  }
}
