/**
 * Privilege Log API Service
 * Manages privilege logs for discovery
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { PrivilegeLogEntry, PrivilegeLogFilters } from '@/types';

export class PrivilegeLogApiService {
  private readonly baseUrl = '/privilege-log';

  async getAll(filters?: PrivilegeLogFilters): Promise<PrivilegeLogEntry[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.productionId) params.append('productionId', filters.productionId);
    if (filters?.privilegeType) params.append('privilegeType', filters.privilegeType);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: PrivilegeLogEntry[] }>(url);
    // Backend returns paginated response {items, total, page, limit, totalPages}
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<PrivilegeLogEntry> {
    return apiClient.get<PrivilegeLogEntry>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<PrivilegeLogEntry>): Promise<PrivilegeLogEntry> {
    return apiClient.post<PrivilegeLogEntry>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<PrivilegeLogEntry>): Promise<PrivilegeLogEntry> {
    return apiClient.put<PrivilegeLogEntry>(`${this.baseUrl}/${id}`, data);
  }

  async bulkCreate(entries: Partial<PrivilegeLogEntry>[]): Promise<PrivilegeLogEntry[]> {
    return apiClient.post<PrivilegeLogEntry[]>(`${this.baseUrl}/bulk`, { entries });
  }

  async export(filters?: PrivilegeLogFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.productionId) params.append('productionId', filters.productionId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/export?${queryString}` : `${this.baseUrl}/export`;
    return apiClient.get(url, { responseType: 'blob' });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
