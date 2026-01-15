/**
 * Sync API Service
 * Data synchronization and conflict resolution
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface AdminSyncStatus {
  pending: number;
  syncing: number;
  completed: number;
  failed: number;
  conflicts: number;
  lastSyncTime: string | null;
  isHealthy: boolean;
}

export interface AdminSyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: unknown;
  remoteVersion: unknown;
  conflictType: "update_update" | "update_delete" | "create_create";
  detectedAt: string;
  resolvedAt?: string;
  resolution?: "local" | "remote" | "merge" | "manual";
  resolved: boolean;
  resolvedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  itemsSynced: number;
  conflicts: number;
  errors?: string[];
}

export interface SyncQueueItem {
  id: string;
  status: "pending" | "syncing" | "completed" | "failed";
  entityType: string;
  entityId: string;
  operation: "create" | "update" | "delete";
  data: unknown;
  error?: string;
  retryCount: number;
  createdAt: string;
  syncedAt?: string;
}

export class SyncApiService {
  private readonly baseUrl = "/sync";

  async getStatus(): Promise<AdminSyncStatus> {
    return apiClient.get<AdminSyncStatus>(`${this.baseUrl}/status`);
  }

  async getQueue(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: SyncQueueItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiClient.get(`${this.baseUrl}/queue`, { params: filters });
  }

  async getConflicts(filters?: {
    resolved?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: AdminSyncConflict[]; total: number }> {
    return apiClient.get(`${this.baseUrl}/conflicts`, { params: filters });
  }

  async resolveConflict(
    conflictId: string,
    resolution: "local" | "remote" | "merge",
    userId: string
  ): Promise<AdminSyncConflict> {
    return apiClient.post(`${this.baseUrl}/conflicts/${conflictId}/resolve`, {
      resolution,
      userId,
    });
  }

  async retryFailed(ids: string[]): Promise<{ updated: number }> {
    return apiClient.post(`${this.baseUrl}/retry`, { ids });
  }

  async clearCompleted(): Promise<{ deleted: number }> {
    return apiClient.post(`${this.baseUrl}/clear-completed`, {});
  }
}
