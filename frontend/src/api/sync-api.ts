/**
 * Sync API Service
 * Data synchronization and conflict resolution
 */

import { apiClient } from '../infrastructure/apiClient';

export interface AdminSyncStatus {
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: 'idle' | 'syncing' | 'error';
  pendingChanges: number;
  conflicts: number;
}

export interface AdminSyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: unknown;
  remoteVersion: unknown;
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

  async getStatus(): Promise<AdminSyncStatus> {
    return apiClient.get<AdminSyncStatus>(`${this.baseUrl}/status`);
  }

  async triggerSync(): Promise<SyncResult> {
    return apiClient.post<SyncResult>(`${this.baseUrl}/trigger`, {});
  }

  async getConflicts(): Promise<AdminSyncConflict[]> {
    return apiClient.get<AdminSyncConflict[]>(`${this.baseUrl}/conflicts`);
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: unknown): Promise<void> {
    return apiClient.post(`${this.baseUrl}/conflicts/${conflictId}/resolve`, {
      resolution,
      mergedData,
    });
  }

  async getPendingChanges(): Promise<any[]> {
    return apiClient.get(`${this.baseUrl}/pending`);
  }
}
