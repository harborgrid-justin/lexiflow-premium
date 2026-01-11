/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                      SYNC ENGINE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module services/data/sync/config/syncConfig
 * @description Configuration constants for offline-first synchronization engine
 * @author LexiFlow Engineering Team
 * @since 2025-12-18
 */

import { SYNC_CACHE_MAX_SIZE } from "@/config/database/cache.config";

/**
 * Storage key for persistent mutation queue in localStorage.
 * Queue survives page refreshes and browser restarts.
 */
export const QUEUE_KEY = "lexiflow_sync_queue" as const;

/**
 * Maximum cache entries before LRU eviction.
 * When exceeded, oldest 20% of entries are removed.
 *
 * @default 1000 (from cache.config)
 */
export const MAX_CACHE_SIZE = SYNC_CACHE_MAX_SIZE;

/**
 * Cache time-to-live in milliseconds.
 * Entries older than this are automatically evicted.
 *
 * @default 3600000 (1 hour)
 */
export const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Maximum retry attempts before marking mutation as permanently failed.
 * After this threshold, mutations require manual intervention.
 *
 * @default 3
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Base delay for exponential backoff in milliseconds.
 * Actual delay = BASE_RETRY_DELAY * (2 ^ retryCount) + jitter
 *
 * @default 1000 (1 second)
 */
export const BASE_RETRY_DELAY = 1000;

/**
 * Cleanup interval in milliseconds.
 * How often to run cache cleanup and size enforcement.
 *
 * @default 3600000 (1 hour)
 */
export const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Maximum backoff delay in milliseconds.
 * Caps exponential backoff to prevent excessive wait times.
 *
 * @default 30000 (30 seconds)
 */
export const MAX_BACKOFF_DELAY_MS = 30000;

/**
 * Jitter factor for exponential backoff (0-1).
 * Adds randomness to prevent thundering herd.
 *
 * @default 0.3 (30% jitter)
 */
export const BACKOFF_JITTER_FACTOR = 0.3;

/**
 * Percentage of cache entries to evict when size limit exceeded.
 *
 * @default 0.2 (20%)
 */
export const CACHE_EVICTION_RATIO = 0.2;
