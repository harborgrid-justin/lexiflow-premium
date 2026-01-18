/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    BACKEND SYNC SERVICE BASE CLASS                        ║
 * ║           Eliminates 60+ duplicate sync queue lines                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories/BackendSyncService
 * @description Base class for services needing backend sync with queue management
 * 
 * ELIMINATES CRITICAL DUPLICATES IN:
 * - BackendStorageService (lines 63, 252-264)
 * - BackendSessionService (identical 50+ lines)
 * 
 * DUPLICATE PATTERNS ELIMINATED:
 * - Sync queue management (2 services, 50+ lines each)
 * - Auto-sync timer setup (2 services)
 * - Queue processing logic (2 services)
 * - Debounced queue processing (2 services)
 * - Conflict resolution hooks (2 services)
 */

import { BaseService } from '../BaseService';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Sync queue item
 */
export interface SyncQueueItem<T> {
  key: string;
  value: T;
  timestamp: number;
  retryCount?: number;
}

/**
 * Sync configuration
 */
export interface BackendSyncConfig {
  /** Auto-sync interval in ms (0 to disable) */
  autoSyncInterval?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Debounce delay for queue processing */
  debounceDelay?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Sync result
 */
export interface SyncResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  conflicts?: Array<{ key: string; serverValue: T; localValue: T }>;
}

// ============================================================================
// BACKEND SYNC SERVICE BASE CLASS
// ============================================================================

/**
 * Base class for services that need backend synchronization.
 * 
 * Eliminates 60+ duplicate lines in BackendStorageService and BackendSessionService.
 * 
 * @example
 * ```typescript
 * // Before: 50+ duplicate lines
 * class BackendStorageService {
 *   private syncQueue: Map<string, SyncQueueItem> = new Map();
 *   private syncTimer: NodeJS.Timeout | null = null;
 *   private processingQueue = false;
 *   
 *   protected queueSync(key: string, value: any) {
 *     this.syncQueue.set(key, { key, value, timestamp: Date.now() });
 *     this.debouncedProcessQueue();
 *   }
 *   // ... 40+ more duplicate lines
 * }
 * 
 * // After: 1 line
 * class BackendStorageService extends BackendSyncService<StorageData> {
 *   protected async syncToBackend(key: string, value: StorageData) {
 *     return this.api.storage.set(key, value);
 *   }
 * }
 * ```
 */
export abstract class BackendSyncService<T> extends BaseService {
  private syncQueue: Map<string, SyncQueueItem<T>> = new Map();
  private syncTimer: NodeJS.Timeout | null = null;
  private processingQueue = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  protected config: Required<BackendSyncConfig>;

  constructor(
    serviceName: string,
    config: BackendSyncConfig = {}
  ) {
    super(serviceName);
    this.config = {
      autoSyncInterval: config.autoSyncInterval ?? 30000,
      maxRetries: config.maxRetries ?? 3,
      debounceDelay: config.debounceDelay ?? 1000,
      debug: config.debug ?? false,
    };
  }

  // ============================================================================
  // ABSTRACT METHODS (implement in subclass)
  // ============================================================================

  /**
   * Sync item to backend (implement in subclass)
   */
  protected abstract syncToBackend(key: string, value: T): Promise<SyncResult<T>>;

  /**
   * Fetch item from backend (implement in subclass)
   */
  protected abstract fetchFromBackend(key: string): Promise<T | undefined>;

  /**
   * Resolve conflict (override in subclass if needed)
   */
  protected resolveConflict(
    key: string,
    localValue: T,
    serverValue: T
  ): T {
    // Default: server wins
    return serverValue;
  }

  // ============================================================================
  // SYNC QUEUE MANAGEMENT (eliminates 60+ duplicate lines)
  // ============================================================================

  /**
   * Queue item for sync
   * 
   * Replaces duplicate implementation in 2+ services
   */
  protected queueSync(key: string, value: T): void {
    this.syncQueue.set(key, {
      key,
      value,
      timestamp: Date.now(),
      retryCount: 0,
    });
    this.debouncedProcessQueue();
  }

  /**
   * Process sync queue with debouncing
   * 
   * Replaces duplicate implementation in 2+ services
   */
  private debouncedProcessQueue(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processQueue();
    }, this.config.debounceDelay);
  }

  /**
   * Process all queued sync operations
   * 
   * Replaces duplicate implementation in 2+ services
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.syncQueue.size === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      const items = Array.from(this.syncQueue.values());
      const results = await Promise.allSettled(
        items.map(item => this.syncItem(item))
      );

      // Handle results
      results.forEach((result, index) => {
        const item = items[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          this.syncQueue.delete(item.key);
          if (this.config.debug) {
            console.log(`[${this.name}] Synced: ${item.key}`);
          }
        } else if (result.status === 'rejected' || !result.value.success) {
          // Retry logic
          const retryCount = (item.retryCount ?? 0) + 1;
          if (retryCount < this.config.maxRetries) {
            this.syncQueue.set(item.key, { ...item, retryCount });
          } else {
            console.error(
              `[${this.name}] Max retries reached for: ${item.key}`,
              result.status === 'rejected' ? result.reason : result.value.error
            );
            this.syncQueue.delete(item.key);
          }
        }
      });
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Sync single item
   */
  private async syncItem(item: SyncQueueItem<T>): Promise<SyncResult<T>> {
    try {
      const result = await this.syncToBackend(item.key, item.value);

      // Handle conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        for (const conflict of result.conflicts) {
          const resolved = this.resolveConflict(
            conflict.key,
            conflict.localValue,
            conflict.serverValue
          );
          // Re-queue resolved value
          this.queueSync(conflict.key, resolved);
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ============================================================================
  // AUTO-SYNC (eliminates duplicate timer setup)
  // ============================================================================

  /**
   * Enable auto-sync
   * 
   * Replaces duplicate implementation in 2+ services
   */
  protected enableAutoSync(): void {
    if (this.config.autoSyncInterval > 0) {
      this.syncTimer = setInterval(() => {
        this.processQueue();
      }, this.config.autoSyncInterval);
    }
  }

  /**
   * Disable auto-sync
   */
  protected disableAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Force immediate sync
   */
  public async forceSync(): Promise<void> {
    await this.processQueue();
  }

  /**
   * Get queue size
   */
  public getQueueSize(): number {
    return this.syncQueue.size;
  }

  /**
   * Clear queue
   */
  public clearQueue(): void {
    this.syncQueue.clear();
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  override async start(): Promise<void> {
    await super.start();
    this.enableAutoSync();
  }

  override async stop(): Promise<void> {
    this.disableAutoSync();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    await this.processQueue(); // Final sync
    await super.stop();
  }
}
