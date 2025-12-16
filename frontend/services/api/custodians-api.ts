/**
 * CustodiansApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

export class CustodiansApiService {
  async getAll(filters?: { caseId?: string; status?: string }): Promise<Custodian[]> {
    const response = await apiClient.get<PaginatedResponse<Custodian>>('/discovery/custodians', filters);
    return response.data;
  }

  async getById(id: string): Promise<Custodian> {
    return apiClient.get<Custodian>(`/discovery/custodians/${id}`);
  }

  async create(custodian: Omit<Custodian, 'id' | 'createdAt' | 'updatedAt'>): Promise<Custodian> {
    return apiClient.post<Custodian>('/discovery/custodians', custodian);
  }

  async update(id: string, custodian: Partial<Custodian>): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/discovery/custodians/${id}`, custodian);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/custodians/${id}`);
  }

  async placeOnHold(id: string): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/discovery/custodians/${id}/hold`, { status: 'On Hold', holdDate: new Date().toISOString() });
  }

  async release(id: string): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/discovery/custodians/${id}/release`, { status: 'Released', releaseDate: new Date().toISOString() });
  }

  async getByCaseId(caseId: string): Promise<Custodian[]> {
    return this.getAll({ caseId });
  }
}
