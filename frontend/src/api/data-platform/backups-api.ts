/**
 * @module services/api/data-platform/backups-api
 * @description Backup and restore API service
 * Handles backup snapshots and scheduled backups
 * 
 * @responsibility Manage database backups and restore operations
 */

import { apiClient, type PaginatedResponse } from '@services/infrastructure/apiClient';

/**
 * Backup snapshot interface
 */
export interface BackupSnapshot {
  id: string;
  name: string;
  description?: string;
  type: string;
  size: number;
  location: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Backup schedule interface
 */
export interface BackupSchedule {
  id: string;
  name: string;
  cronExpression: string;
  type: string;
  databases?: string[];
  enabled: boolean;
  retentionDays: number;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
}

/**
 * Backups API service class
 * Provides methods for backup and restore operations
 */
export class BackupsApiService {
  // ==================== Snapshots ====================
  
  /**
   * Get all backup snapshots
   */
  async getSnapshots(filters?: unknown): Promise<PaginatedResponse<BackupSnapshot>> {
    try {
      return await apiClient.get<PaginatedResponse<BackupSnapshot>>('/backups/snapshots', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  /**
   * Create a new backup snapshot
   */
  async createSnapshot(data: {
    name: string;
    description?: string;
    type: string;
  }): Promise<BackupSnapshot> {
    return await apiClient.post<BackupSnapshot>('/backups/snapshots', data);
  }

  /**
   * Delete a backup snapshot
   */
  async deleteSnapshot(id: string): Promise<void> {
    await apiClient.delete(`/backups/snapshots/${id}`);
  }

  /**
   * Restore from a backup snapshot
   */
  async restore(id: string, target: string): Promise<{ jobId: string; status: string }> {
    return await apiClient.post(`/backups/snapshots/${id}/restore`, { target });
  }

  // ==================== Schedules ====================
  
  /**
   * Get all backup schedules
   */
  async getSchedules(): Promise<BackupSchedule[]> {
    try {
      return await apiClient.get<BackupSchedule[]>('/backups/schedules');
    } catch (error) {
      return [];
    }
  }

  /**
   * Create a new backup schedule
   */
  async createSchedule(data: Partial<BackupSchedule>): Promise<BackupSchedule> {
    return await apiClient.post<BackupSchedule>('/backups/schedules', data);
  }

  /**
   * Update a backup schedule
   */
  async updateSchedule(id: string, data: Partial<BackupSchedule>): Promise<BackupSchedule> {
    return await apiClient.put<BackupSchedule>(`/backups/schedules/${id}`, data);
  }

  /**
   * Delete a backup schedule
   */
  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/backups/schedules/${id}`);
  }

  // ==================== Statistics ====================
  
  /**
   * Get backup statistics
   */
  async getStats(): Promise<{
    totalSnapshots: number;
    totalSize: number;
    activeSchedules: number;
  }> {
    try {
      return await apiClient.get('/backups/stats');
    } catch (error) {
      return { totalSnapshots: 0, totalSize: 0, activeSchedules: 0 };
    }
  }
}
