/**
 * Pipelines API Service
 * Data processing pipelines
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  type: 'etl' | 'import' | 'export' | 'transformation' | 'validation';
  status: 'idle' | 'running' | 'paused' | 'failed' | 'completed';
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  config: {
    source: Record<string, any>;
    steps: {
      type: string;
      config: Record<string, any>;
    }[];
    destination: Record<string, any>;
  };
  metrics?: {
    recordsProcessed: number;
    recordsFailed: number;
    duration: number;
  };
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class PipelinesApiService {
  private readonly baseUrl = '/pipelines';

  async getAll(filters?: { type?: Pipeline['type']; status?: Pipeline['status'] }): Promise<Pipeline[]> {
    console.log('[LegacyPipelinesApi] getAll called. baseUrl:', '/pipelines');
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      const queryString = params.toString();
      const url = queryString ? `/pipelines?${queryString}` : '/pipelines';
      return await apiClient.get<Pipeline[]>(url);
    } catch (error) {
      console.error('[LegacyPipelinesApi] Error:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Pipeline> {
    return apiClient.get<Pipeline>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Pipeline>): Promise<Pipeline> {
    return apiClient.post<Pipeline>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    return apiClient.put<Pipeline>(`${this.baseUrl}/${id}`, data);
  }

  async run(id: string): Promise<{ executionId: string }> {
    return apiClient.post(`${this.baseUrl}/${id}/run`, {});
  }

  async pause(id: string): Promise<Pipeline> {
    return apiClient.post<Pipeline>(`${this.baseUrl}/${id}/pause`, {});
  }

  async resume(id: string): Promise<Pipeline> {
    return apiClient.post<Pipeline>(`${this.baseUrl}/${id}/resume`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
