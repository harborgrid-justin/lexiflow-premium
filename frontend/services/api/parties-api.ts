/**
 * Parties API Service
 * Manages parties (plaintiffs, defendants, third-parties) in cases
 */

import { apiClient } from '../apiClient';

export interface Party {
  id: string;
  caseId: string;
  name: string;
  partyType: 'plaintiff' | 'defendant' | 'third_party' | 'intervener' | 'amicus';
  entityType?: 'individual' | 'corporation' | 'government' | 'organization';
  email?: string;
  phone?: string;
  address?: string;
  counselId?: string;
  counselName?: string;
  proSe?: boolean;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartyFilters {
  caseId?: string;
  partyType?: Party['partyType'];
  entityType?: Party['entityType'];
}

export class PartiesApiService {
  private readonly baseUrl = '/parties';

  async getAll(filters?: PartyFilters): Promise<Party[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.partyType) params.append('partyType', filters.partyType);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Party[]>(url);
  }

  async getById(id: string): Promise<Party> {
    return apiClient.get<Party>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Party[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<Party>): Promise<Party> {
    return apiClient.post<Party>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Party>): Promise<Party> {
    return apiClient.put<Party>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
