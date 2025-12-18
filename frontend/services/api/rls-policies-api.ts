/**
 * RLS Policies API Service
 * Row-level security policy management
 */

import { apiClient } from '../apiClient';

export interface RLSPolicy {
  id: string;
  tableName: string;
  policyName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  using?: string; // SQL expression for check
  withCheck?: string; // SQL expression for new rows
  roles?: string[];
  enabled: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class RLSPoliciesApiService {
  private readonly baseUrl = '/rls-policies';

  async getAll(filters?: { tableName?: string; enabled?: boolean }): Promise<RLSPolicy[]> {
    const params = new URLSearchParams();
    if (filters?.tableName) params.append('tableName', filters.tableName);
    if (filters?.enabled !== undefined) params.append('enabled', String(filters.enabled));
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<RLSPolicy[]>(url);
  }

  async getById(id: string): Promise<RLSPolicy> {
    return apiClient.get<RLSPolicy>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<RLSPolicy>): Promise<RLSPolicy> {
    return apiClient.post<RLSPolicy>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<RLSPolicy>): Promise<RLSPolicy> {
    return apiClient.put<RLSPolicy>(`${this.baseUrl}/${id}`, data);
  }

  async enable(id: string): Promise<RLSPolicy> {
    return apiClient.patch<RLSPolicy>(`${this.baseUrl}/${id}/enable`, {});
  }

  async disable(id: string): Promise<RLSPolicy> {
    return apiClient.patch<RLSPolicy>(`${this.baseUrl}/${id}/disable`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
