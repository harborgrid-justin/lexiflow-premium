/**
 * Case Phases API Service
 * Manages case lifecycle phases
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface CasePhase {
  id: string;
  caseId: string;
  phaseName: 'investigation' | 'pleadings' | 'discovery' | 'motion_practice' | 'settlement' | 'trial_prep' | 'trial' | 'post_trial' | 'appeal';
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  milestones?: {
    name: string;
    dueDate?: string;
    completedDate?: string;
    status: 'pending' | 'completed';
  }[];
  notes?: string;
  metadata?: Record<string, never>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CasePhaseFilters {
  caseId?: string;
  phaseName?: CasePhase['phaseName'];
  status?: CasePhase['status'];
}

export class CasePhasesApiService {
  private readonly baseUrl = '/case-phases';

  async getAll(filters?: CasePhaseFilters): Promise<CasePhase[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.phaseName) params.append('phaseName', filters.phaseName);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<CasePhase[]>(url);
  }

  async getById(id: string): Promise<CasePhase> {
    return apiClient.get<CasePhase>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<CasePhase[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<CasePhase>): Promise<CasePhase> {
    return apiClient.post<CasePhase>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<CasePhase>): Promise<CasePhase> {
    return apiClient.put<CasePhase>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: CasePhase['status']): Promise<CasePhase> {
    return apiClient.patch<CasePhase>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
