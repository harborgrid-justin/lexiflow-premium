/**
 * Discovery API Service
 * Main discovery process management (aggregates sub-services)
 */

import { apiClient } from '../infrastructure/apiClient';

export interface DiscoveryProcess {
  id: string;
  caseId: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed';
  phase: 'identification' | 'preservation' | 'collection' | 'processing' | 'review' | 'analysis' | 'production';
  deadlines?: {
    phase: string;
    date: string;
    status: 'upcoming' | 'overdue' | 'met';
  }[];
  custodians?: string[];
  dataSources?: string[];
  summary?: {
    totalDocuments: number;
    reviewedDocuments: number;
    privilegedDocuments: number;
    responsiveDocuments: number;
  };
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class DiscoveryApiService {
  private readonly baseUrl = '/discovery';

  async getAll(filters?: { caseId?: string; status?: DiscoveryProcess['status'] }): Promise<DiscoveryProcess[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<DiscoveryProcess[]>(url);
  }

  async getById(id: string): Promise<DiscoveryProcess> {
    return apiClient.get<DiscoveryProcess>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<DiscoveryProcess>): Promise<DiscoveryProcess> {
    return apiClient.post<DiscoveryProcess>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<DiscoveryProcess>): Promise<DiscoveryProcess> {
    return apiClient.put<DiscoveryProcess>(`${this.baseUrl}/${id}`, data);
  }

  async updatePhase(id: string, phase: DiscoveryProcess['phase']): Promise<DiscoveryProcess> {
    return apiClient.patch<DiscoveryProcess>(`${this.baseUrl}/${id}/phase`, { phase });
  }

  async getSummary(id: string): Promise<any> {
    return apiClient.get(`${this.baseUrl}/${id}/summary`);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
