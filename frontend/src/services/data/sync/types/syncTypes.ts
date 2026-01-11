/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                        SYNC ENGINE TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module services/data/sync/types/syncTypes
 * @description Core type definitions for the offline-first synchronization engine
 * @author LexiFlow Engineering Team
 * @since 2025-12-18
 */

/**
 * Represents a queued mutation for offline-first synchronization.
 *
 * This type captures all metadata needed for:
 * - Idempotent replay prevention (via UUID)
 * - Network payload optimization (via JSON Patch)
 * - Retry logic with exponential backoff
 * - State machine tracking (pending → syncing → failed)
 *
 * @property {string} id - UUID for idempotent replay prevention
 * @property {string} type - Mutation type discriminator (e.g., 'CASE_UPDATE', 'DOCUMENT_CREATE')
 * @property {unknown} payload - Full mutation payload (type validation in handlers)
 * @property {unknown} patch - JSON Patch array for network optimization (optional)
 * @property {number} timestamp - Unix timestamp for ordering and TTL enforcement
 * @property {string} status - Current mutation state in sync pipeline
 * @property {number} retryCount - Number of failed sync attempts
 * @property {string} lastError - Last error message for debugging (optional)
 *
 * @example
 * ```typescript
 * const mutation: Mutation = {
 *   id: crypto.randomUUID(),
 *   type: 'CASE_UPDATE',
 *   payload: { id: '123', status: 'closed' },
 *   patch: { status: 'closed' },  // Only changed fields
 *   timestamp: Date.now(),
 *   status: 'pending',
 *   retryCount: 0
 * };
 * ```
 */
export interface Mutation {
  id: string;
  type: string;
  payload: unknown;
  patch?: unknown;
  timestamp: number;
  status: "pending" | "syncing" | "failed";
  retryCount: number;
  lastError?: string;
}

/**
 * Represents a cache entry for duplicate detection.
 *
 * Used by bounded Linear Hash for O(1) duplicate mutation detection.
 * Entries are automatically evicted based on:
 * - TTL (time-to-live) policy: 1 hour default
 * - LRU (least recently used) eviction when cache is full
 *
 * @property {boolean} processed - Whether mutation has been dequeued
 * @property {number} timestamp - Unix timestamp for TTL-based eviction
 *
 * @example
 * ```typescript
 * const entry: CacheEntry = {
 *   processed: true,
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface CacheEntry {
  processed: boolean;
  timestamp: number;
}

/**
 * Mutation status discriminated union type.
 * Enables type-safe state machine transitions.
 */
export type MutationStatus = "pending" | "syncing" | "failed";

/**
 * Result type for queue processing operations.
 *
 * @property {number} synced - Number of successfully synced mutations
 * @property {number} failed - Number of failed mutations
 */
export interface SyncResult {
  synced: number;
  failed: number;
}

/**
 * Cache statistics for monitoring and debugging.
 *
 * @property {number} size - Current number of cached entries
 * @property {number} maxSize - Maximum cache capacity
 * @property {number} oldestEntryAge - Age of oldest entry in milliseconds
 * @property {number} ttlMs - Cache TTL in milliseconds
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  oldestEntryAge: number;
  ttlMs: number;
}
