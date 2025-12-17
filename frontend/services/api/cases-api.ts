/**
 * CasesApiService
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

export class CasesApiService {
  async getAll(filters?: { status?: string; type?: string; page?: number; limit?: number; sortBy?: string; order?: string }): Promise<Case[]> {
    const response = await apiClient.get<PaginatedResponse<Case>>('/cases', filters);
    return response.data;
  }

  async getById(id: string): Promise<Case> {
    return apiClient.get<Case>(`/cases/${id}`);
  }

  async add(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    return apiClient.post<Case>('/cases', caseData);
  }

  async update(id: string, caseData: Partial<Case>): Promise<Case> {
    return apiClient.put<Case>(`/cases/${id}`, caseData);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/cases/${id}`);
  }

  async archive(id: string): Promise<Case> {
    return apiClient.post<Case>(`/cases/${id}/archive`, {});
  }

  async search(query: string, filters?: Record<string, any>): Promise<Case[]> {
    const response = await apiClient.get<PaginatedResponse<Case>>('/cases', { search: query, ...filters });
    return response.data;
  }

  async getArchived(filters?: { page?: number; limit?: number }): Promise<any[]> {
    // Try backend first, fallback to local filtering
    try {
      const response = await apiClient.get<PaginatedResponse<any>>('/cases/archived', filters);
      return response.data;
    } catch (error) {
      // Fallback: filter locally by status
      const allCases = await this.getAll({ status: 'Closed' });
      // getAll returns an array of cases
      const casesArray = Array.isArray(allCases) ? allCases : [];
      return casesArray.map(c => ({
        id: c.id,
        date: c.dateTerminated || c.filingDate,
        title: c.title,
        client: c.client,
        outcome: c.status
      }));
    }
  }
}
