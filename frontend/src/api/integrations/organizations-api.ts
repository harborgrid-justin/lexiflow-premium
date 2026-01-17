/**
 * Organizations API Service
 * Manages organization entities including corporations, LLCs, partnerships, etc.
 */

import { apiClient } from '@/services/infrastructure/apiClient';

import type { Organization } from '@/types';

export interface OrganizationFilters {
  organizationType?: Organization['organizationType'];
  status?: Organization['status'];
  jurisdiction?: string;
  search?: string;
}

export class OrganizationsApiService {
  private readonly baseUrl = '/organizations';

  async getAll(filters?: OrganizationFilters): Promise<Organization[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Organization[]>(url);
  }

  async getById(id: string): Promise<Organization> {
    return apiClient.get<Organization>(`${this.baseUrl}/${id}`);
  }

  async getByType(type: Organization['organizationType']): Promise<Organization[]> {
    return apiClient.get<Organization[]>(`${this.baseUrl}/type/${type}`);
  }

  async getByStatus(status: Organization['status']): Promise<Organization[]> {
    return apiClient.get<Organization[]>(`${this.baseUrl}/status/${status}`);
  }

  async getByJurisdiction(jurisdiction: string): Promise<Organization[]> {
    return apiClient.get<Organization[]>(`${this.baseUrl}/jurisdiction/${jurisdiction}`);
  }

  async search(searchTerm: string): Promise<Organization[]> {
    return this.getAll({ search: searchTerm });
  }

  async create(data: Partial<Organization>): Promise<Organization> {
    return apiClient.post<Organization>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    return apiClient.put<Organization>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
