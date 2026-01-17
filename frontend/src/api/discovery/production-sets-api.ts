/**
 * Production Sets API Service
 * Manages production set creation and delivery
 */

import { apiClient } from '@/services/infrastructure/apiClient';

import type { ProductionSet } from '@/types/discovery-enhanced';

export class ProductionSetsApiService {
  private readonly baseUrl = '/discovery/production-sets';

  async getAll(caseId?: string): Promise<ProductionSet[]> {
    const params = new URLSearchParams();
    if (caseId) params.append('caseId', caseId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: ProductionSet[] }>(url);
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<ProductionSet> {
    return apiClient.get<ProductionSet>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<ProductionSet>): Promise<ProductionSet> {
    return apiClient.post<ProductionSet>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<ProductionSet>): Promise<ProductionSet> {
    return apiClient.put<ProductionSet>(`${this.baseUrl}/${id}`, data);
  }

  async stage(id: string): Promise<ProductionSet> {
    return apiClient.post<ProductionSet>(`${this.baseUrl}/${id}/stage`, {});
  }

  async produce(id: string): Promise<ProductionSet> {
    return apiClient.post<ProductionSet>(`${this.baseUrl}/${id}/produce`, {});
  }

  async deliver(id: string): Promise<ProductionSet> {
    return apiClient.post<ProductionSet>(`${this.baseUrl}/${id}/deliver`, {});
  }

  async generateBates(id: string, prefix: string, startNumber: number): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${id}/bates`, { prefix, startNumber });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const productionSetsApi = new ProductionSetsApiService();
