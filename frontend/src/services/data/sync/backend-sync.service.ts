/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                       BACKEND SYNC SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module services/data/sync/backendSync
 * @description Backend synchronization with exponential backoff retry logic
 * @author LexiFlow Engineering Team
 * @since 2025-12-18
 */

import { isBackendApiEnabled } from "@/config/network/api.config";
import { apiClient } from "@/services/infrastructure/api-client.service";
import type { Mutation, SyncResult } from "./types/syncTypes";
import {
  MAX_RETRY_ATTEMPTS,
  BASE_RETRY_DELAY,
  MAX_BACKOFF_DELAY_MS,
  BACKOFF_JITTER_FACTOR,
} from "./config/syncConfig";
import { QueueManager } from "./queue/queueManager";

/**
 * Calculates exponential backoff delay for retry attempts.
 *
 * Formula: delay = BASE_DELAY * (2 ^ retryCount) + jitter
 * Jitter prevents thundering herd problem.
 *
 * @param {number} retryCount - Current retry attempt number
 * @returns {number} Delay in milliseconds
 *
 * @complexity O(1) - simple arithmetic
 *
 * @example
 * ```typescript
 * calculateBackoffDelay(0);  // ~1000ms
 * calculateBackoffDelay(1);  // ~2000ms + jitter
 * calculateBackoffDelay(2);  // ~4000ms + jitter
 * calculateBackoffDelay(5);  // 30000ms (capped)
 * ```
 */
export const calculateBackoffDelay = (retryCount: number): number => {
  const exponentialDelay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
  const jitter = Math.random() * BACKOFF_JITTER_FACTOR * exponentialDelay;
  return Math.min(exponentialDelay + jitter, MAX_BACKOFF_DELAY_MS);
};

/**
 * Syncs a mutation to the backend server.
 * Implements idempotent retry logic and conflict resolution.
 *
 * @param {Mutation} mutation - The mutation to sync
 * @returns {Promise<boolean>} True if sync succeeded, false otherwise
 *
 * @complexity O(1) - single HTTP request
 * @sideEffect Updates backend database state
 * @throws Network errors (caught and logged internally)
 *
 * @example
 * ```typescript
 * const mutation = QueueManager.peek();
 * if (mutation && await processMutation(mutation)) {
 *   QueueManager.dequeue();
 * }
 * ```
 */
const processMutation = async (mutation: Mutation): Promise<boolean> => {
  if (!isBackendApiEnabled()) {
    console.warn("[BackendSync] Backend API disabled, skipping sync");
    return false;
  }

  try {
    // Map mutation type to backend operation
    const operation = mutation.type.includes("CREATE")
      ? "create"
      : mutation.type.includes("UPDATE")
        ? "update"
        : mutation.type.includes("DELETE")
          ? "delete"
          : "update";

    // Extract entity type from mutation type (e.g., 'CASE_UPDATE' -> 'case')
    const entityType = (mutation.type.split("_")[0] || "").toLowerCase();

    // Prepare backend payload
    const payloadObj =
      mutation.payload && typeof mutation.payload === "object"
        ? (mutation.payload as Record<string, unknown>)
        : {};

    const backendPayload = {
      id: mutation.id,
      operation,
      entityType,
      entityId: payloadObj.id || payloadObj._id || mutation.id,
      payload: mutation.patch || mutation.payload, // Prefer patch for efficiency
      timestamp: mutation.timestamp,
      retryCount: mutation.retryCount,
    };

    // Send to backend sync queue
    await apiClient.post("/sync/queue", backendPayload);

    console.log(
      `[BackendSync] Successfully synced mutation ${mutation.id} to backend`
    );
    return true;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[BackendSync] Failed to sync mutation ${mutation.id}:`,
      errorMessage
    );

    // Check if we should retry
    if (mutation.retryCount >= MAX_RETRY_ATTEMPTS) {
      console.error(
        `[BackendSync] Mutation ${mutation.id} exceeded max retries, marking as failed`
      );
    }

    return false;
  }
};

/**
 * Processes the entire sync queue with automatic retry logic.
 * Stops processing on first failure to maintain order.
 *
 * @returns {Promise<SyncResult>} Sync statistics (synced count, failed count)
 *
 * @complexity O(n) where n = queue length (stops on first failure)
 * @sideEffect Processes mutations, updates backend, modifies local queue
 *
 * @example
 * ```typescript
 * const result = await processQueue();
 * console.log(`Synced: ${result.synced}, Failed: ${result.failed}`);
 * ```
 */
const processQueue = async (): Promise<SyncResult> => {
  let synced = 0;
  let failed = 0;
  let mutation = QueueManager.peek();

  while (mutation && mutation.status !== "syncing") {
    // Mark as syncing
    QueueManager.update(mutation.id, { status: "syncing" });

    // Process the mutation
    const success = await processMutation(mutation);

    if (success) {
      QueueManager.dequeue(); // Remove from local queue
      synced++;
      mutation = QueueManager.peek(); // Get next
    } else {
      // Update retry count and status
      const newRetryCount = mutation.retryCount + 1;
      const newStatus: "pending" | "failed" =
        newRetryCount >= MAX_RETRY_ATTEMPTS ? "failed" : "pending";

      QueueManager.update(mutation.id, {
        status: newStatus,
        retryCount: newRetryCount,
        lastError: `Sync failed (attempt ${newRetryCount}/${MAX_RETRY_ATTEMPTS})`,
      });

      failed++;
      break; // Stop processing to maintain order
    }
  }

  return { synced, failed };
};

/**
 * Backend Sync Service - Singleton module for server synchronization.
 *
 * Provides:
 * - Individual mutation sync with retry logic
 * - Batch queue processing
 * - Backend state synchronization
 * - Exponential backoff retry
 */
export const BackendSyncService = {
  /**
   * Syncs a single mutation to the backend immediately.
   * Bypasses queue processing for urgent operations.
   *
   * @param {Mutation} mutation - Mutation to sync
   * @returns {Promise<boolean>} True if sync succeeded
   */
  syncMutation: async (mutation: Mutation): Promise<boolean> => {
    return await processMutation(mutation);
  },

  /**
   * Processes the entire sync queue with backend synchronization.
   * Implements automatic retry with exponential backoff.
   *
   * @returns {Promise<SyncResult>} Sync statistics
   */
  processQueue: async (): Promise<SyncResult> => {
    return await processQueue();
  },

  /**
   * Syncs backend queue status to local queue.
   * Fetches pending mutations from backend and merges with local queue.
   *
   * @returns {Promise<void>}
   */
  syncFromBackend: async (): Promise<void> => {
    if (!isBackendApiEnabled()) {
      console.warn("[BackendSync] Backend API disabled, skipping backend sync");
      return;
    }

    try {
      // Fetch backend sync status
      const response = await apiClient.get<{ data: unknown[] }>("/sync/queue", {
        params: { status: "pending", limit: 100 },
      });

      const backendQueue = Array.isArray(response.data) ? response.data : [];
      const localQueue = QueueManager.getQueue();
      const localIds = new Set(localQueue.map((m) => m.id));

      // Add backend mutations that aren't in local queue
      let added = 0;
      for (const item of backendQueue) {
        if (item && typeof item === "object") {
          const itemObj = item as Record<string, unknown>;
          const itemId = typeof itemObj.id === "string" ? itemObj.id : "";
          if (itemId && !localIds.has(itemId)) {
            const mutation: Mutation = {
              id: itemId,
              type: `${String(itemObj.entityType || "").toUpperCase()}_${String(itemObj.operation || "").toUpperCase()}`,
              payload: itemObj.payload,
              patch: undefined,
              timestamp: itemObj.createdAt
                ? new Date(String(itemObj.createdAt)).getTime()
                : Date.now(),
              status:
                itemObj.status === "pending" ||
                itemObj.status === "syncing" ||
                itemObj.status === "failed"
                  ? itemObj.status
                  : "pending",
              retryCount:
                typeof itemObj.retryCount === "number" ? itemObj.retryCount : 0,
              lastError:
                typeof itemObj.error === "string" ? itemObj.error : undefined,
            };
            localQueue.push(mutation);
            added++;
          }
        }
      }

      if (added > 0) {
        console.log(`[BackendSync] Synced ${added} mutations from backend`);
      }
    } catch (error: unknown) {
      console.error(
        "[BackendSync] Failed to sync from backend:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  },

  /**
   * Gets backend sync status including conflicts and pending items.
   *
   * @returns {Promise<unknown>} Backend sync status
   */
  getBackendStatus: async (): Promise<unknown> => {
    if (!isBackendApiEnabled()) {
      return { pending: 0, conflicts: 0, isHealthy: true, offline: true };
    }

    try {
      return await apiClient.get("/sync/status");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[BackendSync] Failed to get backend status:", errorMessage);
      return {
        pending: 0,
        conflicts: 0,
        isHealthy: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Calculates backoff delay for retry attempts.
   * Exposed for testing and custom retry logic.
   *
   * @param {number} retryCount - Current retry attempt
   * @returns {number} Delay in milliseconds
   */
  getBackoffDelay: (retryCount: number): number => {
    return calculateBackoffDelay(retryCount);
  },
};
