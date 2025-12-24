/**
 * Custodian Interviews API Service
 * Manages custodian interviews for discovery
 */

import { apiClient } from '../infrastructure/apiClient';

export interface CustodianInterview {
  id: string;
  caseId: string;
  custodianId: string;
  custodianName?: string;
  interviewDate: string;
  interviewer?: string;
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  topics?: string[];
  notes?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustodianInterviewFilters {
  caseId?: string;
  custodianId?: string;
  status?: CustodianInterview['status'];
  startDate?: string;
  endDate?: string;
}

export class CustodianInterviewsApiService {
  private readonly baseUrl = '/custodian-interviews';

  async getAll(filters?: CustodianInterviewFilters): Promise<CustodianInterview[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.custodianId) params.append('custodianId', filters.custodianId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: CustodianInterview[] }>(url);
    // Backend returns paginated response {items, total, page, limit, totalPages}
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<CustodianInterview> {
    return apiClient.get<CustodianInterview>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<CustodianInterview>): Promise<CustodianInterview> {
    return apiClient.post<CustodianInterview>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<CustodianInterview>): Promise<CustodianInterview> {
    return apiClient.put<CustodianInterview>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: CustodianInterview['status']): Promise<CustodianInterview> {
    return apiClient.patch<CustodianInterview>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
