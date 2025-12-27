/**
 * Conflict Checks API Service
 * Automated conflict of interest checking
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface ConflictCheck {
  id: string;
  clientName: string;
  opposingParties?: string[];
  caseType?: string;
  status: 'pending' | 'clear' | 'conflict_found' | 'requires_review';
  conflicts?: {
    type: 'client' | 'opposing_party' | 'related_matter' | 'ethical_wall';
    description: string;
    severity: 'low' | 'medium' | 'high';
    relatedCaseId?: string;
  }[];
  checkedBy?: string;
  checkedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export class ConflictChecksApiService {
  private readonly baseUrl = '/api/v1/compliance/conflicts';

  async run(data: { clientName: string; opposingParties?: string[]; caseType?: string }): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>(`${this.baseUrl}/run`, data);
  }

  async getAll(filters?: { status?: ConflictCheck['status'] }): Promise<ConflictCheck[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<ConflictCheck[]>(url);
  }

  async getById(id: string): Promise<ConflictCheck> {
    return apiClient.get<ConflictCheck>(`${this.baseUrl}/${id}`);
  }

  async approve(id: string, notes?: string): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>(`${this.baseUrl}/${id}/approve`, { notes });
  }

  async reject(id: string, reason: string): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  async resolve(id: string, data: {
    resolution: string;
    approvedBy?: string;
    notes?: string;
  }): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>(`${this.baseUrl}/${id}/resolve`, data);
  }

  async waive(id: string, data: {
    reason: string;
    waivedBy: string;
    expiresAt?: string;
  }): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>(`${this.baseUrl}/${id}/waive`, data);
  }

  async check(data: {
    clientName: string;
    opposingParties?: string[];
    caseType?: string;
  }): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>(`${this.baseUrl}/check`, data);
  }
}
