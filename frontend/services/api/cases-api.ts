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
    // Map frontend MatterType to backend CaseType enum
    const matterTypeMap: Record<string, string> = {
      'Litigation': 'Civil',
      'M&A': 'Corporate',
      'IP': 'Intellectual Property',
      'Real Estate': 'Real Estate',
      'General': 'Civil',
      'Appeal': 'Civil',
    };

    // Map frontend CaseStatus to backend status strings
    const statusMap: Record<string, string> = {
      'Open': 'Open',
      'Active': 'Active',
      'Discovery': 'Discovery',
      'Trial': 'Trial',
      'Settled': 'Settled',
      'Closed': 'Closed',
      'Archived': 'Archived',
      'On Hold': 'On Hold',
      'Pre-Filing': 'pending',
      'Appeal': 'Active',
      'Transferred': 'Active',
    };

    // Transform frontend Case to backend CreateCaseDto
    const createDto: any = {
      title: caseData.title,
      caseNumber: caseData.caseNumber || `CASE-${Date.now()}`,
      description: caseData.description,
      type: matterTypeMap[caseData.matterType as string] || 'Civil',
      status: statusMap[caseData.status as string] || 'Active',
      practiceArea: caseData.matterType,
      jurisdiction: caseData.jurisdiction,
      court: caseData.court,
      judge: caseData.judge,
      // Convert ISO string to Date object if present
      filingDate: caseData.filingDate ? new Date(caseData.filingDate) : undefined,
      // Optional: only include clientId if available
      ...(caseData.clientId && { clientId: caseData.clientId }),
    };

    // Remove undefined values
    Object.keys(createDto).forEach(key => {
      if (createDto[key] === undefined) {
        delete createDto[key];
      }
    });

    return apiClient.post<Case>('/cases', createDto);
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
