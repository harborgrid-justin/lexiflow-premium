/**
 * Analytics Dashboard API Service
 * Pre-built analytics dashboards
 */

import { apiClient } from '../apiClient';

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  category: 'cases' | 'billing' | 'discovery' | 'compliance' | 'performance' | 'custom';
  widgets: {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'list';
    title: string;
    dataSource: string;
    config: Record<string, any>;
    position: { x: number; y: number; w: number; h: number };
  }[];
  filters?: Record<string, any>;
  refreshInterval?: number;
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class AnalyticsDashboardApiService {
  private readonly baseUrl = '/analytics-dashboard';

  async getAll(filters?: { category?: AnalyticsDashboard['category'] }): Promise<AnalyticsDashboard[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<AnalyticsDashboard[]>(url);
  }

  async getById(id: string): Promise<AnalyticsDashboard> {
    return apiClient.get<AnalyticsDashboard>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<AnalyticsDashboard>): Promise<AnalyticsDashboard> {
    return apiClient.post<AnalyticsDashboard>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<AnalyticsDashboard>): Promise<AnalyticsDashboard> {
    return apiClient.put<AnalyticsDashboard>(`${this.baseUrl}/${id}`, data);
  }

  async getData(id: string, filters?: Record<string, any>): Promise<any> {
    return apiClient.post(`${this.baseUrl}/${id}/data`, { filters });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
