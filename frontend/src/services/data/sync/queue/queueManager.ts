/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                           QUEUE MANAGER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module services/data/sync/queue/queueManager
 * @description Manages FIFO mutation queue with persistent storage
 * @author LexiFlow Engineering Team
 * @since 2025-12-18
 */

import { StorageUtils } from "@/utils/storage";
import type { Mutation } from "../types/syncTypes";
import { QUEUE_KEY } from "../config/syncConfig";
import { CacheManager } from "../cache/cacheManager";
import { createPatch, isPatchEmpty } from "../utils/patchGenerator";

/**
 * Queue Manager - Singleton module for mutation queue operations.
 *
 * Provides FIFO queue with:
 * - Persistent storage (survives page refresh)
 * - Duplicate detection via cache
 * - JSON Patch optimization for UPDATE operations
 * - Atomic queue operations
 */
export const QueueManager = {
  /**
   * Retrieves the current mutation queue from persistent storage.
   * Automatically starts cleanup timer on first access.
   *
   * @returns {Mutation[]} Array of pending, syncing, or failed mutations
   *
   * @complexity O(1) - direct localStorage read
   * @sideEffect Initializes cleanup timer on first call
   *
   * @example
   * ```typescript
   * const queue = QueueManager.getQueue();
   * console.log(`${queue.length} mutations in queue`);
   * ```
   */
  getQueue: (): Mutation[] => {
    CacheManager.startTimer(); // Ensure cleanup timer is running
    return StorageUtils.get(QUEUE_KEY, []);
  },

  /**
   * Enqueues a mutation for background synchronization.
   * Automatically generates JSON Patch for UPDATE operations.
   * Skips duplicate mutations via cache lookup.
   *
   * @param {string} type - Mutation type (e.g., 'CASE_UPDATE', 'DOCUMENT_CREATE')
   * @param {unknown} payload - Full mutation payload
   * @param {unknown} oldPayload - Previous state for patch generation (optional)
   * @returns {Mutation} Created mutation with UUID and metadata
   *
   * @complexity O(1) - hash lookup + array append
   * @optimization Skips enqueue if no fields changed (empty patch)
   *
   * @example
   * ```typescript
   * // Simple create operation
   * const mutation = QueueManager.enqueue('CASE_CREATE', newCase);
   *
   * // Update with patch optimization
   * const mutation = QueueManager.enqueue('CASE_UPDATE', updatedCase, originalCase);
   * console.log(mutation.patch); // Only changed fields
   * ```
   */
  enqueue: (type: string, payload: unknown, oldPayload?: unknown): Mutation => {
    const queue = QueueManager.getQueue();

    // Optimization: Calculate patch if updating
    let patch = undefined;
    if (type.includes("UPDATE") && oldPayload) {
      patch = createPatch(oldPayload, payload);
      // If no changes, skip enqueue
      if (isPatchEmpty(patch)) {
        return {
          id: "",
          type,
          payload,
          timestamp: 0,
          status: "pending",
          retryCount: 0,
        };
      }
    }

    const mutation: Mutation = {
      id: crypto.randomUUID(),
      type,
      payload,
      patch,
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
    };

    // Check for duplicates in cache
    const cached = CacheManager.get(mutation.id);
    if (cached) {
      console.log(`[QueueManager] Skipping duplicate mutation: ${mutation.id}`);
      return mutation; // Don't re-add
    }

    queue.push(mutation);
    StorageUtils.set(QUEUE_KEY, queue);
    return mutation;
  },

  /**
   * Removes and returns the next mutation from the queue (FIFO).
   * Marks mutation as processed in cache to prevent duplicate execution.
   *
   * @returns {Mutation | undefined} Next pending mutation, or undefined if queue empty
   *
   * @complexity O(1) - array shift + hash insert
   * @sideEffect Updates localStorage and processedCache
   * @sideEffect Triggers cache size limit check
   *
   * @example
   * ```typescript
   * const mutation = QueueManager.dequeue();
   * if (mutation) {
   *   await processMutation(mutation);
   * }
   * ```
   */
  dequeue: (): Mutation | undefined => {
    const queue = QueueManager.getQueue();
    if (queue.length === 0) return undefined;

    const item = queue.shift();
    if (item) {
      CacheManager.set(item.id, { processed: true, timestamp: Date.now() });
      CacheManager.enforceLimit(); // Check size limit on each dequeue
    }

    StorageUtils.set(QUEUE_KEY, queue);
    return item;
  },

  /**
   * Returns the next mutation without removing it from the queue.
   * Useful for inspecting before processing or implementing retry logic.
   *
   * @returns {Mutation | undefined} Next pending mutation, or undefined if queue empty
   *
   * @complexity O(1) - array index access
   * @pure No side effects, read-only operation
   *
   * @example
   * ```typescript
   * const next = QueueManager.peek();
   * if (next && next.retryCount < 3) {
   *   await attemptSync(next);
   * }
   * ```
   */
  peek: (): Mutation | undefined => {
    const queue = QueueManager.getQueue();
    return queue.length > 0 ? queue[0] : undefined;
  },

  /**
   * Updates a specific mutation's metadata (status, error, retry count).
   * Used to track sync progress and implement retry logic.
   *
   * @param {string} id - Mutation UUID to update
   * @param {Partial<Mutation>} updates - Fields to update (partial)
   *
   * @complexity O(n) where n = queue length (linear search)
   * @sideEffect Updates localStorage if mutation found
   *
   * @example
   * ```typescript
   * // Mark as syncing
   * QueueManager.update(mutation.id, { status: 'syncing' });
   *
   * // Mark as failed with error
   * QueueManager.update(mutation.id, {
   *   status: 'failed',
   *   lastError: 'Network timeout',
   *   retryCount: mutation.retryCount + 1
   * });
   * ```
   */
  update: (id: string, updates: Partial<Mutation>): void => {
    const queue = QueueManager.getQueue();
    const index = queue.findIndex((m) => m.id === id);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates } as Mutation;
      StorageUtils.set(QUEUE_KEY, queue);
    }
  },

  /**
   * Returns the current number of mutations in the queue.
   *
   * @returns {number} Total queue length
   *
   * @complexity O(1) - array length property
   * @pure No side effects, read-only operation
   */
  count: (): number => {
    return QueueManager.getQueue().length;
  },

  /**
   * Returns all mutations with 'failed' status.
   *
   * @returns {Mutation[]} Array of failed mutations
   *
   * @complexity O(n) where n = queue length
   * @pure No side effects, read-only operation
   */
  getFailed: (): Mutation[] => {
    return QueueManager.getQueue().filter((m) => m.status === "failed");
  },

  /**
   * Resets all failed mutations back to 'pending' status for retry.
   * Clears error messages and retry counters.
   *
   * @complexity O(n) where n = queue length
   * @sideEffect Updates localStorage with reset mutations
   */
  resetFailed: (): void => {
    const queue = QueueManager.getQueue();
    const updated = queue.map((m) =>
      m.status === "failed"
        ? { ...m, status: "pending" as const, retryCount: 0, lastError: undefined }
        : m
    );
    StorageUtils.set(QUEUE_KEY, updated);
  },

  /**
   * Clears the entire mutation queue.
   * Use with caution - permanently deletes all pending syncs.
   *
   * @complexity O(1) - single localStorage write
   * @sideEffect Removes all queued mutations permanently
   * @dangerous Cannot be undone
   */
  clear: (): void => {
    StorageUtils.set(QUEUE_KEY, []);
  },
};
