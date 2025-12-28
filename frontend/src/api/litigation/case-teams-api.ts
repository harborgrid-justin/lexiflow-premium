/**
 * Case Teams API Service
 * Manages case team member assignments and roles
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface CaseTeamMember {
  id: string;
  caseId: string;
  userId: string;
  userName?: string;
  role: 'lead_attorney' | 'associate' | 'paralegal' | 'legal_assistant' | 'consultant' | 'expert' | 'support';
  permissions?: string[];
  billableRate?: number;
  assignedDate: string;
  removedDate?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface CaseTeamFilters {
  caseId?: string;
  userId?: string;
  role?: CaseTeamMember['role'];
  isActive?: boolean;
}

export class CaseTeamsApiService {
  private readonly baseUrl = '/case-teams';

  async getAll(filters?: CaseTeamFilters): Promise<CaseTeamMember[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<CaseTeamMember[]>(url);
  }

  async getById(id: string): Promise<CaseTeamMember> {
    return apiClient.get<CaseTeamMember>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<CaseTeamMember[]> {
    return this.getAll({ caseId, isActive: true });
  }

  async create(data: Partial<CaseTeamMember>): Promise<CaseTeamMember> {
    return apiClient.post<CaseTeamMember>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<CaseTeamMember>): Promise<CaseTeamMember> {
    return apiClient.put<CaseTeamMember>(`${this.baseUrl}/${id}`, data);
  }

  async remove(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
