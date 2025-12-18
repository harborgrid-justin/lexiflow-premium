/**
 * Correspondence API Service
 * Legal correspondence tracking
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Correspondence {
  id: string;
  caseId?: string;
  clientId?: string;
  correspondenceType: 'letter' | 'email' | 'memo' | 'notice' | 'demand' | 'response';
  subject: string;
  sender?: string;
  recipients?: string[];
  date: string;
  documentId?: string;
  status: 'draft' | 'sent' | 'received' | 'filed';
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CorrespondenceFilters {
  caseId?: string;
  clientId?: string;
  correspondenceType?: Correspondence['correspondenceType'];
  status?: Correspondence['status'];
}

export class CorrespondenceApiService {
  private readonly baseUrl = '/correspondence';

  async getAll(filters?: CorrespondenceFilters): Promise<Correspondence[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.correspondenceType) params.append('correspondenceType', filters.correspondenceType);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Correspondence[]>(url);
  }

  async getById(id: string): Promise<Correspondence> {
    return apiClient.get<Correspondence>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Correspondence>): Promise<Correspondence> {
    return apiClient.post<Correspondence>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Correspondence>): Promise<Correspondence> {
    return apiClient.put<Correspondence>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
