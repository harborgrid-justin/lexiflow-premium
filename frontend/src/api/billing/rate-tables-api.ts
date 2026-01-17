/**
 * RateTablesApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';

import type { RateTable } from '@/types/financial';

export class RateTablesApiService {
  async getAll(): Promise<RateTable[]> {
    const response = await apiClient.get<PaginatedResponse<RateTable>>('/billing/rates');
    return response.data;
  }

  async getById(id: string): Promise<RateTable> {
    return apiClient.get<RateTable>(`/billing/rates/${id}`);
  }

  async getActive(): Promise<RateTable[]> {
    const response = await apiClient.get<PaginatedResponse<RateTable>>('/billing/rates/active');
    return response.data;
  }

  async getDefault(firmId: string): Promise<RateTable> {
    return apiClient.get<RateTable>(`/billing/rates/default/${firmId}`);
  }

  async getUserRate(firmId: string, userId: string): Promise<{ role: string; hourlyRate: number }> {
    return apiClient.get<{ role: string; hourlyRate: number }>(`/billing/rates/user-rate/${firmId}/${userId}`);
  }

  async create(rateTable: Omit<RateTable, 'id' | 'createdAt' | 'updatedAt'>): Promise<RateTable> {
    return apiClient.post<RateTable>('/billing/rates', rateTable);
  }

  async update(id: string, rateTable: Partial<RateTable>): Promise<RateTable> {
    return apiClient.put<RateTable>(`/billing/rates/${id}`, rateTable);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/rates/${id}`);
  }
}
