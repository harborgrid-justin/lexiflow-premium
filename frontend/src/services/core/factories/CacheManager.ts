/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    CACHE MANAGER FACTORY                                  ║
 * ║           Eliminates 30+ duplicate cache management lines                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories/CacheManager
 * @description TTL-based cache with automatic expiration and LRU eviction
 * 
 * ELIMINATES DUPLICATES IN:
 * - BackendCryptoService (70-85)
 * - BackendFeatureFlagService (233)
 * - BackendStorageService
 * - Repository.ts (LRU cache)
 * 
 * DUPLICATE PATTERNS ELIMINATED:
 * - TTL validation checks (3+ services)
 * - Cache entry structure (4+ services)
 * - Expiration checking (3+ services)
 * - LRU eviction (2+ services)
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTTL?: number;
  /** Maximum cache size (0 = unlimited) */
  maxSize?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Cache name for logging */
  name?: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

/**
 * Generic cache manager with TTL and LRU eviction.
 * 
 * Eliminates 30+ duplicate cache management lines.
 * 
 * @example
 * ```typescript
 * // Before: 15+ duplicate lines
 * class FeatureFlagService {
 *   private cache: Map<string, { value: boolean; expiresAt: number }> = new Map();
 *   
 *   get(key: string): boolean | undefined {
 *     const entry = this.cache.get(key);
 *     if (!entry) return undefined;
 *     if (Date.now() > entry.expiresAt) {
 *       this.cache.delete(key);
 *       return undefined;
 *     }
 *     return entry.value;
 *   }
 *   // ... 10+ more lines
 * }
 * 
 * // After: 1 line
 * class FeatureFlagService {
 *   private cache = new CacheManager<boolean>({ defaultTTL: 60000 });
 *   
 *   get(key: string): boolean | undefined {
 *     return this.cache.get(key);
 *   }
 * }
 * ```
 */
export class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL ?? 60000,
      maxSize: config.maxSize ?? 1000,
      debug: config.debug ?? false,
      name: config.name ?? 'Cache',
    };
  }

  // ============================================================================
  // CORE OPERATIONS (eliminates duplicate implementations)
  // ============================================================================

  /**
   * Get value from cache
   * 
   * Replaces duplicate TTL checking in 3+ services
   * 
   * @param key - Cache key
   * @returns Cached value or undefined if expired/missing
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      if (this.config.debug) {
        console.log(`[${this.config.name}] Cache expired: ${key}`);
      }
      return undefined;
    }

    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.value;
  }

  /**
   * Set value in cache
   * 
   * Replaces duplicate cache entry creation in 4+ services
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - TTL in milliseconds (optional, uses default)
   */
  set(key: string, value: T, ttl?: number): void {
    const actualTTL = ttl ?? this.config.defaultTTL;
    const now = Date.now();

    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + actualTTL,
      accessCount: 0,
      lastAccessed: now,
    });

    if (this.config.debug) {
      console.log(`[${this.config.name}] Cache set: ${key} (TTL: ${actualTTL}ms)`);
    }

    // LRU eviction if over max size
    this.evictIfNeeded();
  }

  /**
   * Check if key exists and is not expired
   * 
   * @param key - Cache key
   * @returns True if key exists and not expired
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete key from cache
   * 
   * @param key - Cache key
   * @returns True if key existed
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    if (size > 0) {
      console.log(`[${this.config.name}] Cache cleared: ${size} entries`);
    }
  }

  // ============================================================================
  // LRU EVICTION (eliminates duplicate LRU logic)
  // ============================================================================

  /**
   * Evict least recently used entries if over max size
   * 
   * Replaces duplicate LRU implementation in Repository.ts
   */
  private evictIfNeeded(): void {
    if (this.config.maxSize === 0 || this.cache.size <= this.config.maxSize) {
      return;
    }

    // Sort by last accessed time (LRU)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    );

    // Evict oldest entries until under max size
    const toEvict = this.cache.size - this.config.maxSize;
    for (let i = 0; i < toEvict; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.stats.evictions++;
      if (this.config.debug) {
        console.log(`[${this.config.name}] Cache evicted (LRU): ${key}`);
      }
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get or set value (fetch if not cached)
   * 
   * @param key - Cache key
   * @param fetcher - Function to fetch value if not cached
   * @param ttl - TTL in milliseconds (optional)
   * @returns Cached or fetched value
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const { hits, misses } = this.stats;
    const total = hits + misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? hits / total : 0,
    };
  }

  /**
   * Remove expired entries
   * 
   * @returns Number of expired entries removed
   */
  pruneExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0 && this.config.debug) {
      console.log(`[${this.config.name}] Pruned ${removed} expired entries`);
    }

    return removed;
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values (includes expired)
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }
}
