/**
 * Collections API Service
 * Manages data collection operations
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { DataCollection } from '@/types/discovery-enhanced';

export class CollectionsApiService {
  private readonly baseUrl = '/discovery/collections';

  async getAll(caseId?: string): Promise<DataCollection[]> {
    const params = new URLSearchParams();
    if (caseId) params.append('caseId', caseId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: DataCollection[] }>(url);
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<DataCollection> {
    return apiClient.get<DataCollection>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<DataCollection>): Promise<DataCollection> {
    return apiClient.post<DataCollection>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<DataCollection>): Promise<DataCollection> {
    return apiClient.put<DataCollection>(`${this.baseUrl}/${id}`, data);
  }

  async pause(id: string): Promise<DataCollection> {
    return apiClient.post<DataCollection>(`${this.baseUrl}/${id}/pause`, {});
  }

  async resume(id: string): Promise<DataCollection> {
    return apiClient.post<DataCollection>(`${this.baseUrl}/${id}/resume`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const collectionsApi = new CollectionsApiService();
