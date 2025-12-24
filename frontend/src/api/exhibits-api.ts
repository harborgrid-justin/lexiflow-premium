/**
 * Exhibits API Service
 * Manages trial exhibits
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Exhibit {
  id: string;
  caseId: string;
  exhibitNumber: string;
  title: string;
  description?: string;
  exhibitType: 'documentary' | 'physical' | 'demonstrative' | 'testimonial';
  party: 'plaintiff' | 'defendant' | 'third_party' | 'joint';
  status: 'identified' | 'marked' | 'offered' | 'admitted' | 'excluded' | 'withdrawn';
  documentId?: string;
  witnessId?: string;
  markedDate?: string;
  offeredDate?: string;
  admittedDate?: string;
  ruling?: string;
  objections?: string[];
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExhibitFilters {
  caseId?: string;
  party?: Exhibit['party'];
  status?: Exhibit['status'];
  exhibitType?: Exhibit['exhibitType'];
}

export class ExhibitsApiService {
  private readonly baseUrl = '/exhibits';

  async getAll(filters?: ExhibitFilters): Promise<Exhibit[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.party) params.append('party', filters.party);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.exhibitType) params.append('exhibitType', filters.exhibitType);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Exhibit[]>(url);
  }

  async getById(id: string): Promise<Exhibit> {
    return apiClient.get<Exhibit>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Exhibit[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<Exhibit>): Promise<Exhibit> {
    return apiClient.post<Exhibit>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Exhibit>): Promise<Exhibit> {
    return apiClient.put<Exhibit>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Exhibit['status']): Promise<Exhibit> {
    return apiClient.patch<Exhibit>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
