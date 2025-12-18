/**
 * Sync API Service
 * Data synchronization and conflict resolution
 */

import { apiClient } from '../apiClient';

export interface SyncStatus {
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: 'idle' | 'syncing' | 'error';
  pendingChanges: number;
  conflicts: number;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  conflictType: 'update_update' | 'update_delete' | 'create_create';
  detectedAt: string;
  resolvedAt?: string;
  resolution?: 'local' | 'remote' | 'merge' | 'manual';
  metadata?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  itemsSynced: number;
  conflicts: number;
  errors?: string[];
}

export class SyncApiService {
  private readonly baseUrl = '/sync';

  async getStatus(): Promise<SyncStatus> {
    return apiClient.get<SyncStatus>(`${this.baseUrl}/status`);
  }

  async triggerSync(): Promise<SyncResult> {
    return apiClient.post<SyncResult>(`${this.baseUrl}/trigger`, {});
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return apiClient.get<SyncConflict[]>(`${this.baseUrl}/conflicts`);
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: any): Promise<void> {
    return apiClient.post(`${this.baseUrl}/conflicts/${conflictId}/resolve`, {
      resolution,
      mergedData,
    });
  }

  async getPendingChanges(): Promise<any[]> {
    return apiClient.get(`${this.baseUrl}/pending`);
  }
}
