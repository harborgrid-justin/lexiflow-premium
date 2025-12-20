/**
 * CasesApiService
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

export class CasesApiService {
  // Map backend status to frontend CaseStatus enum
  private mapBackendStatusToFrontend(backendStatus: string): string {
    const backendToFrontendStatusMap: Record<string, string> = {
      'pending': 'Pre-Filing',
      'Open': 'Open',
      'Active': 'Active',
      'Discovery': 'Discovery',
      'Trial': 'Trial',
      'Settled': 'Settled',
      'Closed': 'Closed',
      'Archived': 'Archived',
      'On Hold': 'On Hold',
    };
    return backendToFrontendStatusMap[backendStatus] || 'Active';
  }

  // Transform case data from backend to frontend format
  private transformCase(backendCase: any): Case {
    return {
      ...backendCase,
      status: this.mapBackendStatusToFrontend(backendCase.status),
      matterType: backendCase.practiceArea || 'General',
    };
  }

  async getAll(filters?: { status?: string; type?: string; page?: number; limit?: number; sortBy?: string; order?: string }): Promise<Case[]> {
    const response = await apiClient.get<PaginatedResponse<Case>>('/cases', filters);
    
    // Backend returns nested structure: { success, data: { data: [], total, page, ... }, meta }
    const casesArray = response.data?.data || response.data || [];
    
    // Transform each case to use frontend status values and ensure all required fields
    return casesArray.map((c: any) => {
      const transformed = this.transformCase(c);
      // Ensure required fields for Case type
      return {
        ...transformed,
        client: transformed.client || 'Unknown Client',
        matterType: transformed.matterType || transformed.practiceArea || 'General',
        filingDate: transformed.filingDate || new Date().toISOString().split('T')[0],
      };
    });
  }

  async getById(id: string): Promise<Case> {
    const backendCase = await apiClient.get<Case>(`/cases/${id}`);
    return this.transformCase(backendCase);
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

    const backendCase = await apiClient.post<Case>('/cases', createDto);
    return this.transformCase(backendCase);
  }

  async update(id: string, caseData: Partial<Case>): Promise<Case> {
    const backendCase = await apiClient.put<Case>(`/cases/${id}`, caseData);
    return this.transformCase(backendCase);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/cases/${id}`);
  }

  async archive(id: string): Promise<Case> {
    const backendCase = await apiClient.post<Case>(`/cases/${id}/archive`, {});
    return this.transformCase(backendCase);
  }

  async search(query: string, filters?: Record<string, any>): Promise<Case[]> {
    const response = await apiClient.get<PaginatedResponse<Case>>('/cases', { search: query, ...filters });
    return response.data.map(c => this.transformCase(c));
  }

  async getArchived(filters?: { page?: number; limit?: number }): Promise<any[]> {
    // Try backend first, fallback to local filtering
    try {
      const response = await apiClient.get<PaginatedResponse<any>>('/cases/archived', filters);
      return response.data.map(c => this.transformCase(c));
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
