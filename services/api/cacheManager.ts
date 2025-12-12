/**
 * API Response Cache Manager
 *
 * Provides client-side caching for API responses to:
 * - Reduce network requests
 * - Improve application performance
 * - Provide offline capability
 * - Reduce server load
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size in entries
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  keyPrefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
    };
    this.options = {
      ttl: options.ttl || 300, // 5 minutes default
      maxSize: options.maxSize || 100,
      storage: options.storage || 'memory',
      keyPrefix: options.keyPrefix || 'lexiflow_cache_',
    };

    // Load from persistent storage if configured
    if (this.options.storage !== 'memory') {
      this.loadFromStorage();
    }

    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Generate cache key from URL and params
   */
  private generateKey(url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${this.options.keyPrefix}${url}${paramsStr}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp > entry.ttl * 1000;
  }

  /**
   * Get value from cache
   */
  get<T = any>(url: string, params?: any): T | null {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T = any>(url: string, params: any, data: T, ttl?: number): void {
    const key = this.generateKey(url, params);

    // Check cache size limit
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
      key,
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;

    // Persist to storage if configured
    if (this.options.storage !== 'memory') {
      this.saveToStorage(key, entry);
    }
  }

  /**
   * Check if key exists in cache
   */
  has(url: string, params?: any): boolean {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Delete specific cache entry
   */
  delete(url: string, params?: any): boolean {
    const key = this.generateKey(url, params);
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.stats.size = this.cache.size;

      if (this.options.storage !== 'memory') {
        this.deleteFromStorage(key);
      }
    }

    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;

    if (this.options.storage !== 'memory') {
      this.clearStorage();
    }
  }

  /**
   * Clear cache entries matching pattern
   */
  clearPattern(pattern: string | RegExp): number {
    let count = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(entry.key)) {
        this.cache.delete(key);

        if (this.options.storage !== 'memory') {
          this.deleteFromStorage(key);
        }

        count++;
      }
    }

    this.stats.size = this.cache.size;
    return count;
  }

  /**
   * Invalidate cache for specific URL
   */
  invalidate(url: string): number {
    return this.clearPattern(new RegExp(`^${this.options.keyPrefix}${url}`));
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
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.updateHitRate();
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);

      if (this.options.storage !== 'memory') {
        this.deleteFromStorage(oldestKey);
      }
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);

        if (this.options.storage !== 'memory') {
          this.deleteFromStorage(key);
        }

        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      console.log(`[Cache Cleanup] Removed ${cleaned} expired entries`);
    }
  }

  /**
   * Load cache from persistent storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    const storage = this.getStorage();
    if (!storage) return;

    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);

        if (key && key.startsWith(this.options.keyPrefix)) {
          const item = storage.getItem(key);

          if (item) {
            const entry: CacheEntry = JSON.parse(item);

            if (!this.isExpired(entry)) {
              this.cache.set(key, entry);
            } else {
              storage.removeItem(key);
            }
          }
        }
      }

      this.stats.size = this.cache.size;
    } catch (error) {
      console.error('[Cache] Error loading from storage:', error);
    }
  }

  /**
   * Save entry to persistent storage
   */
  private saveToStorage(key: string, entry: CacheEntry): void {
    if (typeof window === 'undefined') return;

    const storage = this.getStorage();
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('[Cache] Error saving to storage:', error);

      // If quota exceeded, clear old entries
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.evictOldest();
        this.saveToStorage(key, entry);
      }
    }
  }

  /**
   * Delete entry from persistent storage
   */
  private deleteFromStorage(key: string): void {
    if (typeof window === 'undefined') return;

    const storage = this.getStorage();
    if (!storage) return;

    try {
      storage.removeItem(key);
    } catch (error) {
      console.error('[Cache] Error deleting from storage:', error);
    }
  }

  /**
   * Clear persistent storage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    const storage = this.getStorage();
    if (!storage) return;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);

        if (key && key.startsWith(this.options.keyPrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.error('[Cache] Error clearing storage:', error);
    }
  }

  /**
   * Get storage instance based on configuration
   */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    try {
      switch (this.options.storage) {
        case 'localStorage':
          return window.localStorage;
        case 'sessionStorage':
          return window.sessionStorage;
        default:
          return null;
      }
    } catch (error) {
      console.error('[Cache] Storage not available:', error);
      return null;
    }
  }

  /**
   * Export cache as JSON
   */
  export(): string {
    const entries = Array.from(this.cache.entries());
    return JSON.stringify({
      entries,
      stats: this.stats,
      options: this.options,
    });
  }

  /**
   * Import cache from JSON
   */
  import(json: string): void {
    try {
      const data = JSON.parse(json);

      if (data.entries && Array.isArray(data.entries)) {
        this.cache = new Map(data.entries);
        this.stats.size = this.cache.size;
      }
    } catch (error) {
      console.error('[Cache] Error importing cache:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager({
  ttl: 300, // 5 minutes
  maxSize: 100,
  storage: 'memory', // Use memory by default, can be changed to localStorage
  keyPrefix: 'lexiflow_api_',
});

// Export factory function for custom instances
export function createCacheManager(options: CacheOptions): CacheManager {
  return new CacheManager(options);
}

export default cacheManager;
