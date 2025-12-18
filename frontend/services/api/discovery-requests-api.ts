/**
 * Discovery Requests API Service
 * Manages discovery requests (interrogatories, RFPs, RFAs)
 */

import { apiClient } from '../apiClient';

export interface DiscoveryRequest {
  id: string;
  caseId: string;
  requestType: 'interrogatory' | 'rfp' | 'rfa' | 'subpoena' | 'notice_deposition';
  requestNumber?: string;
  title: string;
  description?: string;
  requestedBy?: string;
  requestedFrom?: string;
  servedDate?: string;
  responseDate?: string;
  dueDate?: string;
  status: 'draft' | 'served' | 'pending_response' | 'responded' | 'overdue' | 'withdrawn';
  items?: {
    number: string;
    text: string;
    response?: string;
    objections?: string[];
    status?: 'pending' | 'answered' | 'objected';
  }[];
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscoveryRequestFilters {
  caseId?: string;
  requestType?: DiscoveryRequest['requestType'];
  status?: DiscoveryRequest['status'];
}

export class DiscoveryRequestsApiService {
  private readonly baseUrl = '/discovery-requests';

  async getAll(filters?: DiscoveryRequestFilters): Promise<DiscoveryRequest[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.requestType) params.append('requestType', filters.requestType);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<DiscoveryRequest[]>(url);
  }

  async getById(id: string): Promise<DiscoveryRequest> {
    return apiClient.get<DiscoveryRequest>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<DiscoveryRequest[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<DiscoveryRequest>): Promise<DiscoveryRequest> {
    return apiClient.post<DiscoveryRequest>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<DiscoveryRequest>): Promise<DiscoveryRequest> {
    return apiClient.put<DiscoveryRequest>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: DiscoveryRequest['status']): Promise<DiscoveryRequest> {
    return apiClient.patch<DiscoveryRequest>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
