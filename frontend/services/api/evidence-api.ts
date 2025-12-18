/**
 * EvidenceApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

export class EvidenceApiService {
  async getAll(caseId?: string): Promise<EvidenceItem[]> {
    const params = caseId ? { caseId } : {};
    const response = await apiClient.get<PaginatedResponse<EvidenceItem>>('/discovery/evidence', params);
    return response.data;
  }

  async getById(id: string): Promise<EvidenceItem> {
    return apiClient.get<EvidenceItem>(`/discovery/evidence/${id}`);
  }

  async add(item: Omit<EvidenceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvidenceItem> {
    return apiClient.post<EvidenceItem>('/discovery/evidence', item);
  }

  async update(id: string, item: Partial<EvidenceItem>): Promise<EvidenceItem> {
    return apiClient.patch<EvidenceItem>(`/discovery/evidence/${id}`, item);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/evidence/${id}`);
  }
}
