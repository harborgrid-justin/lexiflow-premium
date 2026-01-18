/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                  BACKEND STORAGE SERVICE                                  ║
 * ║           Enterprise Storage with Backend Sync                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/storage/backend-storage.service
 * @description Storage service with backend synchronization for user preferences
 *
 * FEATURES:
 * - Local-first storage (localStorage)
 * - Backend sync for cross-device persistence
 * - Conflict resolution (last-write-wins)
 * - Offline support with sync queue
 * - Real-time updates via polling
 */

import { apiClient } from '../infrastructure/api-client.service';
import { StorageService } from './storage.service';
import { BackendSyncService, SyncResult } from '../core/factories';

// ============================================================================
// TYPES
// ============================================================================

interface StorageItem {
  key: string;
  value: string;
  updatedAt: number;
  userId: string;
}

export interface StorageData {
  value: string;
  timestamp: number;
}

/**
 * Backend storage configuration
 */
export interface BackendStorageConfig {
  /** API endpoint for storage */
  endpoint?: string;
  /** Enable auto-sync */
  autoSync?: boolean;
  /** Sync interval in ms */
  syncInterval?: number;
  /** Enable conflict resolution */
  enableConflictResolution?: boolean;
}

// ============================================================================
// SERVICE
// ============================================================================

/**
 * Storage service with backend synchronization.
 * 
 * Extends BackendSyncService with storage-specific functionality.
 * User preferences sync across devices automatically.
 */
export class BackendStorageService extends BackendSyncService<StorageData> {
  private storageService: StorageService;
  
  private override config: BackendStorageConfig = {
    endpoint: '/api/user/storage',
    autoSync: true,
    syncInterval: 60000, // 1 minute
    enableConflictResolution: true
  };

  constructor(config?: BackendStorageConfig) {
    super('BackendStorageService', {
      autoSyncInterval: config?.syncInterval ?? 60000,
      debounceDelay: 1000,
    });
    
    this.storageService = new StorageService();
    
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  protected override onStart(): void {
    this.storageService.start();
    
    // Initial sync from backend
    this.restoreFromBackend().catch((error) => {
      this.error('Failed to restore from backend:', error);
    });
  }

  protected override onStop(): void {
    this.storageService.stop();
  }

  /**
   * Implement BackendSyncService abstract method
   */
  protected async syncToBackend(key: string, value: StorageData): Promise<SyncResult<StorageData>> {
    try {
      await apiClient.post(`${this.config.endpoint}/sync`, {
        items: [{
          key,
          value: value.value === '__DELETED__' ? null : value.value,
          timestamp: value.timestamp
        }]
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Implement BackendSyncService abstract method
   */
  protected async fetchFromBackend(key: string): Promise<StorageData | undefined> {
    try {
      const response = await apiClient.get<StorageItem>(
        `${this.config.endpoint}/${key}`
      );

      return {
        value: response.value,
        timestamp: response.updatedAt
      };
    } catch (error) {
      this.error(`Failed to fetch ${key} from backend:`, error);
      return undefined;
    }
  }

  /**
   * Set item with backend sync
   */
  setItem(key: string, value: string): void {
    this.storageService.setItem(key, value);
    
    // Queue for backend sync
    this.queueSync(key, { value, timestamp: Date.now() });
  }

  /**
   * Get item from local storage
   */
  getItem(key: string): string | null {
    return this.storageService.getItem(key);
  }

  /**
   * Remove item with backend sync
   */
  removeItem(key: string): void {
    this.storageService.removeItem(key);
    
    // Queue tombstone for backend sync
    this.queueSync(key, { value: '__DELETED__', timestamp: Date.now() });
  }

  /**
   * Restore storage from backend
   */
  async restoreFromBackend(): Promise<void> {
    try {
      const response = await apiClient.get<{ items: StorageItem[] }>(
        `${this.config.endpoint}`
      );

      const items = response.items || [];
      this.log(`Restoring ${items.length} items from backend`);

      items.forEach(item => {
        const localValue = this.storageService.getItem(item.key);
        
        if (this.config.enableConflictResolution) {
          // Conflict resolution: last-write-wins
          const localTimestamp = this.getItemTimestamp(item.key);
          
          if (!localValue || item.updatedAt > localTimestamp) {
            // Backend version is newer
            this.storageService.setItem(item.key, item.value);
            this.setItemTimestamp(item.key, item.updatedAt);
          }
        } else {
          // No conflict resolution - always use backend
          this.storageService.setItem(item.key, item.value);
          this.setItemTimestamp(item.key, item.updatedAt);
        }
      });
      
    } catch (error) {
      this.error('Failed to restore from backend:', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Get item timestamp
   */
  private getItemTimestamp(key: string): number {
    const timestampKey = `__timestamp_${key}`;
    const timestamp = localStorage.getItem(timestampKey);
    return timestamp ? parseInt(timestamp, 10) : 0;
  }

  /**
   * Set item timestamp
   */
  private setItemTimestamp(key: string, timestamp: number): void {
    const timestampKey = `__timestamp_${key}`;
    localStorage.setItem(timestampKey, timestamp.toString());
  }
}
