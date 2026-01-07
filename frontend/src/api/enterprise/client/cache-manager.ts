/**
 * Cache Manager for Enterprise API Client
 */

import type { CacheEntry } from "./types";

export class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheTTL = ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTTL,
    };
    this.cache.set(key, entry);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Update default TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}
