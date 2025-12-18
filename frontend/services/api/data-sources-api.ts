/**
 * Data Sources API Service
 * External data source integrations
 */

import { apiClient } from '../apiClient';

export interface DataSource {
  id: string;
  name: string;
  type: 'pacer' | 'westlaw' | 'lexisnexis' | 'bloomberg_law' | 'courtlink' | 'database' | 'api' | 'custom';
  status: 'active' | 'inactive' | 'error';
  config: {
    url?: string;
    credentials?: Record<string, any>;
    syncSchedule?: string;
    lastSync?: string;
  };
  capabilities?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class DataSourcesApiService {
  private readonly baseUrl = '/data-sources';

  async getAll(filters?: { type?: DataSource['type']; status?: DataSource['status'] }): Promise<DataSource[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<DataSource[]>(url);
  }

  async getById(id: string): Promise<DataSource> {
    return apiClient.get<DataSource>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<DataSource>): Promise<DataSource> {
    return apiClient.post<DataSource>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<DataSource>): Promise<DataSource> {
    return apiClient.put<DataSource>(`${this.baseUrl}/${id}`, data);
  }

  async test(id: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(`${this.baseUrl}/${id}/test`, {});
  }

  async sync(id: string): Promise<{ jobId: string }> {
    return apiClient.post(`${this.baseUrl}/${id}/sync`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
