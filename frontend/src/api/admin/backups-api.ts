/**
 * Backups API Service
 * System backup management
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

export interface Backup {
  id: string;
  name: string;
  type: "full" | "incremental" | "differential";
  status: "in_progress" | "completed" | "failed";
  size?: number;
  startedAt: string;
  completedAt?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface BackupSchedule {
  id: string;
  name: string;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  type: "full" | "incremental";
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  retentionDays: number;
}

export class BackupsApiService {
  private readonly baseUrl = "/backups";

  async getAll(): Promise<Backup[]> {
    return apiClient.get<Backup[]>(`${this.baseUrl}/snapshots`);
  }

  async getById(id: string): Promise<Backup> {
    return apiClient.get<Backup>(`${this.baseUrl}/snapshots/${id}`);
  }

  async create(data: { name: string; type: Backup["type"] }): Promise<Backup> {
    return apiClient.post<Backup>(`${this.baseUrl}/snapshots`, data);
  }

  async restore(id: string, target: string = "production"): Promise<unknown> {
    return apiClient.post(`${this.baseUrl}/snapshots/${id}/restore`, {
      target,
    });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/snapshots/${id}`);
  }

  async getSchedules(): Promise<BackupSchedule[]> {
    return apiClient.get<BackupSchedule[]>(`${this.baseUrl}/schedules`);
  }

  async createSchedule(data: Partial<BackupSchedule>): Promise<BackupSchedule> {
    return apiClient.post<BackupSchedule>(`${this.baseUrl}/schedules`, data);
  }

  async updateSchedule(
    id: string,
    data: Partial<BackupSchedule>
  ): Promise<BackupSchedule> {
    return apiClient.put<BackupSchedule>(
      `${this.baseUrl}/schedules/${id}`,
      data
    );
  }
}
