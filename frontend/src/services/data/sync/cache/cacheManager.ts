/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                           CACHE MANAGER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module services/data/sync/cache/cacheManager
 * @description Manages duplicate detection cache with TTL and LRU eviction
 * @author LexiFlow Engineering Team
 * @since 2025-12-18
 */

import { defaultWindowAdapter } from "@/services/infrastructure/adapters/WindowAdapter";
import { LinearHash } from "@/utils/datastructures/linearHash";

import {
  MAX_CACHE_SIZE,
  CACHE_TTL_MS,
  CLEANUP_INTERVAL_MS,
  CACHE_EVICTION_RATIO,
} from "../config/syncConfig";

import type { CacheEntry, CacheStats } from "../types/syncTypes";


/**
 * Bounded Linear Hash for O(1) duplicate detection.
 * Singleton instance shared across all cache operations.
 */
const processedCache = new LinearHash<string, CacheEntry>();

/**
 * Timer ID for periodic cleanup (null when stopped).
 */
let cleanupInterval: number | null = null;

/**
 * Removes expired cache entries based on TTL policy.
 * Runs periodically to prevent unbounded cache growth.
 *
 * @complexity O(k) where k = number of expired entries
 * @sideEffect Modifies processedCache by deleting expired entries
 *
 * @example
 * ```typescript
 * // Called automatically every hour via cleanup timer
 * CacheManager.cleanup();
 * // Logs: "[CacheManager] Cleaned 15 expired cache entries"
 * ```
 */
const cleanup = (): void => {
  const now = Date.now();
  const keys = processedCache.keys();
  let cleanedCount = 0;

  for (const key of keys) {
    const entry = processedCache.get(key);
    if (entry && now - entry.timestamp > CACHE_TTL_MS) {
      processedCache.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[CacheManager] Cleaned ${cleanedCount} expired entries`);
  }
};

/**
 * Enforces cache size limit using LRU-style eviction.
 * Removes oldest 20% of entries when max size is exceeded.
 *
 * @complexity O(n log n) due to sorting, where n = cache size
 * @optimization Only triggers when size exceeds MAX_CACHE_SIZE
 *
 * @example
 * ```typescript
 * // Automatically called after each dequeue
 * CacheManager.enforceLimit();
 * // Logs: "[CacheManager] Evicted 200 oldest entries to maintain size limit"
 * ```
 */
const enforceLimit = (): void => {
  const size = processedCache.size();
  if (size > MAX_CACHE_SIZE) {
    const keys = processedCache.keys();
    const entries: [string, CacheEntry][] = [];

    for (const key of keys) {
      const entry = processedCache.get(key);
      if (entry) {
        entries.push([key, entry]);
      }
    }

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest percentage of entries
    const toRemove = Math.floor(size * CACHE_EVICTION_RATIO);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const entry = entries[i];
      if (entry) {
        processedCache.delete(entry[0]);
      }
    }

    console.log(
      `[CacheManager] Evicted ${toRemove} oldest entries to maintain size limit`
    );
  }
};

/**
 * Starts periodic cleanup timer for automatic cache maintenance.
 * Ensures singleton timer instance to prevent duplicate intervals.
 *
 * @sideEffect Creates global interval timer
 * @idempotent Multiple calls have no effect if timer already running
 *
 * @example
 * ```typescript
 * // Automatically called on first cache access
 * CacheManager.startTimer();
 * ```
 */
const startTimer = (): void => {
  if (cleanupInterval) return;

  cleanupInterval = defaultWindowAdapter.setInterval(() => {
    cleanup();
    enforceLimit();
  }, CLEANUP_INTERVAL_MS);
};

/**
 * Cache Manager - Singleton module for duplicate detection and eviction.
 *
 * Provides bounded Linear Hash cache with:
 * - O(1) duplicate detection
 * - TTL-based automatic expiration
 * - LRU eviction when size limit exceeded
 * - Periodic background cleanup
 */
export const CacheManager = {
  /**
   * Gets a cache entry by mutation ID.
   *
   * @param {string} id - Mutation UUID
   * @returns {CacheEntry | undefined} Cache entry or undefined if not found
   *
   * @complexity O(1) - hash table lookup
   */
  get: (id: string): CacheEntry | undefined => {
    return processedCache.get(id);
  },

  /**
   * Sets a cache entry for a mutation ID.
   *
   * @param {string} id - Mutation UUID
   * @param {CacheEntry} entry - Cache entry to store
   *
   * @complexity O(1) - hash table insert
   */
  set: (id: string, entry: CacheEntry): void => {
    processedCache.set(id, entry);
  },

  /**
   * Deletes a cache entry by mutation ID.
   *
   * @param {string} id - Mutation UUID
   *
   * @complexity O(1) - hash table delete
   */
  delete: (id: string): void => {
    processedCache.delete(id);
  },

  /**
   * Returns current cache size.
   *
   * @returns {number} Number of cached entries
   *
   * @complexity O(1) - size property access
   */
  size: (): number => {
    return processedCache.size();
  },

  /**
   * Manually triggers cache cleanup (expired entries + size limit enforcement).
   * Normally runs automatically every hour.
   *
   * @complexity O(k + n log n) where k = expired, n = cache size
   */
  cleanup: (): void => {
    cleanup();
    enforceLimit();
  },

  /**
   * Returns cache statistics for monitoring.
   *
   * @returns {CacheStats} Cache size, max size, oldest entry age, TTL
   *
   * @complexity O(n) where n = cache size (iterates to find oldest)
   */
  getStats: (): CacheStats => {
    const size = processedCache.size();
    const keys = processedCache.keys();
    let oldestTimestamp = Date.now();

    for (const key of keys) {
      const entry = processedCache.get(key);
      if (entry && entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      size,
      maxSize: MAX_CACHE_SIZE,
      oldestEntryAge: Date.now() - oldestTimestamp,
      ttlMs: CACHE_TTL_MS,
    };
  },

  /**
   * Starts periodic cleanup timer.
   * Idempotent - safe to call multiple times.
   */
  startTimer,

  /**
   * Stops the automatic cleanup timer.
   * Should be called on component unmount.
   *
   * @idempotent Safe to call multiple times
   */
  stopTimer: (): void => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  },

  /**
   * Enforces cache size limit.
   * Called automatically after dequeue operations.
   */
  enforceLimit,
};
