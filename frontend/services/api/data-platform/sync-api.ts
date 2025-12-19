/**
 * @module services/api/data-platform/sync-api
 * @description Data synchronization engine API service
 * Handles sync status, queue management, and conflict resolution
 * 
 * @responsibility Manage data synchronization operations
 */

import { apiClient, type PaginatedResponse } from '../../infrastructure/apiClient';

/**
 * Sync status overview interface
 */
export interface SyncStatus {
  pending: number;
  syncing: number;
  completed: number;
  failed: number;
  conflicts: number;
  lastSyncTime: string | null;
  isHealthy: boolean;
}

/**
 * Sync queue item interface
 */
export interface SyncQueueItem {
  id: string;
  operation: string;
  entityType: string;
  entityId: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';
  retryCount: number;
  error?: string;
  createdAt: string;
}

/**
 * Sync conflict interface
 */
export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: Record<string, any>;
  remoteVersion: Record<string, any>;
  conflictType: string;
  resolved: boolean;
  resolution?: string;
  createdAt: string;
}

/**
 * Sync API service class
 * Provides methods for managing data synchronization
 */
export class SyncApiService {
  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    try {
      return await apiClient.get<SyncStatus>('/sync/status');
    } catch (error) {
      return {
        pending: 0,
        syncing: 0,
        completed: 0,
        failed: 0,
        conflicts: 0,
        lastSyncTime: null,
        isHealthy: true,
      };
    }
  }

  /**
   * Get sync queue items
   */
  async getQueue(filters?: any): Promise<PaginatedResponse<SyncQueueItem>> {
    try {
      return await apiClient.get<PaginatedResponse<SyncQueueItem>>('/sync/queue', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  /**
   * Get sync conflicts
   */
  async getConflicts(filters?: any): Promise<PaginatedResponse<SyncConflict>> {
    try {
      return await apiClient.get<PaginatedResponse<SyncConflict>>('/sync/conflicts', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  /**
   * Resolve a sync conflict
   */
  async resolveConflict(
    id: string,
    resolution: 'local' | 'remote' | 'merge',
    userId: string,
  ): Promise<SyncConflict> {
    return await apiClient.post<SyncConflict>(`/sync/conflicts/${id}/resolve`, { resolution, userId });
  }

  /**
   * Retry failed sync operations
   */
  async retryFailed(ids: string[]): Promise<{ updated: number }> {
    return await apiClient.post('/sync/retry', { ids });
  }

  /**
   * Clear completed sync operations
   */
  async clearCompleted(): Promise<{ deleted: number }> {
    return await apiClient.post('/sync/clear-completed', {});
  }
}
