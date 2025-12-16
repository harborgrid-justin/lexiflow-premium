/**
 * DocketApiService
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

export class DocketApiService {
  async getAll(caseId?: string): Promise<DocketEntry[]> {
    const params = caseId ? { caseId } : {};
    const response = await apiClient.get<PaginatedResponse<DocketEntry>>('/docket', params);
    return response.data;
  }

  async getById(id: string): Promise<DocketEntry> {
    return apiClient.get<DocketEntry>(`/docket/${id}`);
  }

  async add(entry: Omit<DocketEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocketEntry> {
    return apiClient.post<DocketEntry>('/docket', entry);
  }

  async update(id: string, entry: Partial<DocketEntry>): Promise<DocketEntry> {
    return apiClient.patch<DocketEntry>(`/docket/${id}`, entry);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/docket/${id}`);
  }

  async getByCaseId(caseId: string): Promise<DocketEntry[]> {
    return this.getAll(caseId);
  }
}
