/**
 * LRU (Least Recently Used) Cache Implementation
 *
 * A simple but efficient LRU cache using Map for O(1) operations.
 * When capacity is reached, the oldest (least recently used) entry is evicted.
 *
 * Usage:
 * ```typescript
 * const cache = new LRUCache<User>(100);
 * cache.put('user1', userData);
 * const user = cache.get('user1');
 * cache.delete('user1');
 * cache.clear();
 * ```
 */

interface LRUCacheOptions<T> {
  onEvict?: (key: string, value: T) => void;
  ttl?: number; // Time to live in milliseconds
  resetTTLOnAccess?: boolean;
}

interface CacheEntry<T> {
  value: T;
  timestamp?: number;
}

export class LRUCache<T> {
  private readonly _capacity: number;
  private cache: Map<string, CacheEntry<T>>;
  private readonly options: LRUCacheOptions<T>;
  private hits: number = 0;
  private misses: number = 0;

  constructor(capacity: number, options: LRUCacheOptions<T> = {}) {
    this._capacity = capacity;
    this.cache = new Map();
    this.options = options;
  }

  /**
   * Get current cache size as a property (standard Map API).
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get a value from the cache.
   * Accessing an item moves it to the end (most recently used).
   */
  get(key: string): T | undefined {
    if (!this.cache.has(key)) {
      this.misses++;
      return undefined;
    }

    const entry = this.cache.get(key)!;

    // Check TTL expiration
    if (this.options.ttl && entry.timestamp) {
      const age = Date.now() - entry.timestamp;
      if (age > this.options.ttl) {
        this.cache.delete(key);
        this.misses++;
        return undefined;
      }

      // Reset TTL on access if enabled
      if (this.options.resetTTLOnAccess) {
        entry.timestamp = Date.now();
      }
    }

    this.hits++;
    const value = entry.value;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return value;
  }

  /**
   * Put a value into the cache.
   * If key exists, it's updated and moved to end.
   * If capacity is reached, oldest entry is evicted.
   */
  put(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this._capacity) {
      // Evict oldest (first) entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        const oldEntry = this.cache.get(oldestKey);
        this.cache.delete(oldestKey);

        // Call eviction callback
        if (this.options.onEvict && oldEntry) {
          this.options.onEvict(oldestKey, oldEntry.value);
        }
      }
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: this.options.ttl ? Date.now() : undefined,
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete a specific key from the cache.
   */
  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry && this.options.onEvict) {
      this.options.onEvict(key, entry.value);
    }
    this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    if (this.options.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.options.onEvict(key, entry.value);
      }
    }
    this.cache.clear();
  }

  /**
   * Alias for put() to match Map API.
   */
  set(key: string, value: T): void {
    this.put(key, value);
  }

  /**
   * Get cache capacity as a property.
   */
  get capacity(): number {
    return this._capacity;
  }

  /**
   * Get cache capacity as a method.
   */
  getCapacity(): number {
    return this._capacity;
  }

  /**
   * Check if cache contains a key (respects TTL).
   */
  has(key: string): boolean {
    if (!this.cache.has(key)) {
      return false;
    }

    // Check TTL if enabled
    if (this.options.ttl) {
      const entry = this.cache.get(key)!;
      if (entry.timestamp) {
        const age = Date.now() - entry.timestamp;
        if (age > this.options.ttl) {
          this.cache.delete(key);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get all keys in the cache as an array (from oldest to newest).
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in the cache as an array (from oldest to newest).
   */
  values(): T[] {
    return Array.from(this.cache.values()).map((entry) => entry.value);
  }

  /**
   * Iterate over cache entries.
   */
  forEach(callback: (value: T, key: string, cache: this) => void): void {
    this.cache.forEach((entry, key) => {
      callback(entry.value, key, this);
    });
  }

  /**
   * Get all entries as an iterator.
   */
  entries(): IterableIterator<[string, T]> {
    const entries: [string, T][] = [];
    for (const [key, entry] of this.cache.entries()) {
      entries.push([key, entry.value]);
    }
    return entries[Symbol.iterator]();
  }

  /**
   * Make the cache iterable.
   */
  [Symbol.iterator](): IterableIterator<[string, T]> {
    return this.entries();
  }

  /**
   * Get cache statistics.
   */
  getStats() {
    return {
      size: this.cache.size,
      capacity: this._capacity,
      hits: this.hits,
      misses: this.misses,
      hitRate:
        this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
    };
  }

  /**
   * Get memory usage estimation (rough bytes estimate).
   * @returns Estimated memory in bytes
   */
  getMemoryEstimate(): number {
    // Rough estimate: ~100 bytes per entry overhead + value size
    const entryOverhead = 100;
    let totalSize = this.cache.size * entryOverhead;

    // Try to estimate value sizes (rough approximation)
    for (const entry of this.cache.values()) {
      const value = entry.value;
      if (typeof value === "string") {
        totalSize += value.length * 2; // UTF-16 encoding
      } else if (typeof value === "object" && value !== null) {
        try {
          totalSize += JSON.stringify(value).length * 2;
        } catch {
          totalSize += 1000; // Fallback estimate for non-serializable objects
        }
      } else {
        totalSize += 8; // Primitive types (number, boolean, etc.)
      }
    }

    return totalSize;
  }
}

// Export default that creates proxied instances
export default LRUCache;
