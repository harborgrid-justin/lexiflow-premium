/**
 * ApiKeysApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '@services/infrastructure/apiClient';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  status: 'active' | 'revoked';
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class ApiKeysApiService {
  async getAll(): Promise<ApiKey[]> {
    const response = await apiClient.get<PaginatedResponse<ApiKey>>('/admin/api-keys');
    return response.data;
  }

  async getById(id: string): Promise<ApiKey> {
    return apiClient.get<ApiKey>(`/admin/api-keys/${id}`);
  }

  async create(apiKey: { name: string; scopes: string[]; expiresAt?: string }): Promise<ApiKey> {
    return apiClient.post<ApiKey>('/admin/api-keys', apiKey);
  }

  async revoke(id: string): Promise<ApiKey> {
    return apiClient.patch<ApiKey>(`/admin/api-keys/${id}/revoke`, {});
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/api-keys/${id}`);
  }

  async getAvailableScopes(): Promise<{ id: string; label: string; description: string }[]> {
    return apiClient.get<{ id: string; label: string; description: string }[]>('/admin/api-keys/scopes');
  }
}
