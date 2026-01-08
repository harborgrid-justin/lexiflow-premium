/**
 * Backups API Service
 * System backup management
 */

import { apiClient } from "@/services/infrastructure/apiClient";

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

export interface ArchiveStats {
  totalSize: string;
  objectCount: number;
  monthlyCost: number;
  retentionPolicy: string;
}

export class BackupsApiService {
  private readonly baseUrl = "/backups";

  async getAll(): Promise<Backup[]> {
    return apiClient.get<Backup[]>(this.baseUrl);
  }

  async getArchiveStats(): Promise<ArchiveStats> {
    return apiClient.get<ArchiveStats>(`${this.baseUrl}/stats/archive`);
  }

  async getById(id: string): Promise<Backup> {
    return apiClient.get<Backup>(`${this.baseUrl}/${id}`);
  }

  async create(data: { name: string; type: Backup["type"] }): Promise<Backup> {
    return apiClient.post<Backup>(this.baseUrl, data);
  }

  async restore(id: string): Promise<unknown> {
    return apiClient.post(`${this.baseUrl}/${id}/restore`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
