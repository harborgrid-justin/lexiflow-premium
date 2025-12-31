/**
 * Dashboard API Service
 * Dashboard configuration and widgets
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface DashboardConfig {
  id: string;
  userId: string;
  name: string;
  layout: {
    widgetId: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
  widgets: {
    id: string;
    type: string;
    config: Record<string, unknown>;
  }[];
  isDefault: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export class DashboardApiService {
  private readonly baseUrl = '/dashboard';

  async getAll(): Promise<DashboardConfig[]> {
    return apiClient.get<DashboardConfig[]>(this.baseUrl);
  }

  async getById(id: string): Promise<DashboardConfig> {
    return apiClient.get<DashboardConfig>(`${this.baseUrl}/${id}`);
  }

  async getDefault(): Promise<DashboardConfig> {
    return apiClient.get<DashboardConfig>(`${this.baseUrl}/default`);
  }

  async create(data: Partial<DashboardConfig>): Promise<DashboardConfig> {
    return apiClient.post<DashboardConfig>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<DashboardConfig>): Promise<DashboardConfig> {
    return apiClient.put<DashboardConfig>(`${this.baseUrl}/${id}`, data);
  }

  async setDefault(id: string): Promise<DashboardConfig> {
    return apiClient.post<DashboardConfig>(`${this.baseUrl}/${id}/set-default`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
