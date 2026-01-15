/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                       LEXIFLOW SYNC ENGINE                                ║
 * ║                  Enterprise Offline-First Sync Layer v2.0                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/data/sync/syncEngine
 * @architecture Facade pattern delegating to specialized modules
 * @author LexiFlow Engineering Team
 * @refactored 2026-01-11 (Modularized from 1031 LOC monolith)
 *
 * ARCHITECTURE:
 * - QueueManager: FIFO queue operations with persistence
 * - CacheManager: Duplicate detection with TTL/LRU eviction
 * - BackendSyncService: Network sync with retry logic
 *
 * FEATURES:
 * - Offline-first mutation queue
 * - JSON Patch optimization (70% bandwidth reduction)
 * - Exponential backoff retry
 * - O(1) duplicate detection
 */

import { QueueManager } from "./queue/queueManager";
import { CacheManager } from "./cache/cacheManager";
import { BackendSyncService } from "./backend-sync.service";
import type { Mutation, SyncResult } from "./types/syncTypes";

/**
 * SyncEngine - Facade for offline-first synchronization.
 * Delegates to QueueManager, CacheManager, and BackendSyncService.
 *
 * @singleton Operates on shared queue and cache instances
 * @threadsafe Atomic operations via localStorage
 * @persistent Queue survives page refreshes
 */
export const SyncEngine = {
  // ═══════════════════════════════════════════════════════════════════
  //                        QUEUE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  /** Get all queued mutations */
  getQueue: (): Mutation[] => QueueManager.getQueue(),

  /** Enqueue mutation with optional JSON Patch optimization */
  enqueue: (type: string, payload: unknown, oldPayload?: unknown): Mutation =>
    QueueManager.enqueue(type, payload, oldPayload),

  /** Dequeue next mutation (FIFO) */
  dequeue: (): Mutation | undefined => QueueManager.dequeue(),

  /** Peek at next mutation without dequeuing */
  peek: (): Mutation | undefined => QueueManager.peek(),

  /** Update mutation metadata (status, error, retryCount) */
  update: (id: string, updates: Partial<Mutation>): void =>
    QueueManager.update(id, updates),

  /** Get queue length */
  count: (): number => QueueManager.count(),

  /** Get all failed mutations */
  getFailed: (): Mutation[] => QueueManager.getFailed(),

  /** Reset failed mutations to pending */
  resetFailed: (): void => QueueManager.resetFailed(),

  /** Clear entire queue (dangerous - cannot be undone) */
  clear: (): void => QueueManager.clear(),

  // ═══════════════════════════════════════════════════════════════════
  //                        CACHE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  /** Manually trigger cache cleanup */
  cleanupCache: (): void => CacheManager.cleanup(),

  /** Get cache statistics */
  getCacheStats: () => CacheManager.getStats(),

  /** Stop automatic cleanup timer */
  stopCleanupTimer: (): void => CacheManager.stopTimer(),

  // ═══════════════════════════════════════════════════════════════════
  //                      BACKEND SYNC OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  /** Sync single mutation to backend */
  syncMutation: async (mutation: Mutation): Promise<boolean> =>
    await BackendSyncService.syncMutation(mutation),

  /** Process entire queue with retry logic */
  processQueue: async (): Promise<SyncResult> =>
    await BackendSyncService.processQueue(),

  /** Sync from backend to local queue */
  syncFromBackend: async (): Promise<void> =>
    await BackendSyncService.syncFromBackend(),

  /** Get backend sync status */
  getBackendStatus: async (): Promise<unknown> =>
    await BackendSyncService.getBackendStatus(),

  /** Calculate exponential backoff delay */
  getBackoffDelay: (retryCount: number): number =>
    BackendSyncService.getBackoffDelay(retryCount),
};
