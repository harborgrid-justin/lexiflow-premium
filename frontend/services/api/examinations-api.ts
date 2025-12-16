/**
 * ExaminationsApiService
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

export class ExaminationsApiService {
  async getAll(filters?: { caseId?: string; status?: string; type?: string }): Promise<Examination[]> {
    const response = await apiClient.get<PaginatedResponse<Examination>>('/discovery/examinations', filters);
    return response.data;
  }

  async getById(id: string): Promise<Examination> {
    return apiClient.get<Examination>(`/discovery/examinations/${id}`);
  }

  async create(examination: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>): Promise<Examination> {
    return apiClient.post<Examination>('/discovery/examinations', examination);
  }

  async update(id: string, examination: Partial<Examination>): Promise<Examination> {
    return apiClient.patch<Examination>(`/discovery/examinations/${id}`, examination);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/examinations/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Examination[]> {
    return this.getAll({ caseId });
  }
}
