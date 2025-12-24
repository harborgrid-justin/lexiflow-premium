/**
 * Depositions API Service
 * Manages depositions in discovery
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Deposition {
  id: string;
  caseId: string;
  witnessId?: string;
  witnessName: string;
  depositionDate: string;
  location?: string;
  type: 'oral' | 'written' | 'video';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  court_reporter?: string;
  attorneys?: {
    name: string;
    role: string;
    party: string;
  }[];
  transcript?: {
    documentId?: string;
    pageCount?: number;
    status: 'pending' | 'available';
  };
  duration?: number; // in minutes
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepositionFilters {
  caseId?: string;
  witnessId?: string;
  status?: Deposition['status'];
  startDate?: string;
  endDate?: string;
}

export class DepositionsApiService {
  private readonly baseUrl = '/depositions';

  async getAll(filters?: DepositionFilters): Promise<Deposition[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.witnessId) params.append('witnessId', filters.witnessId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Deposition[]>(url);
  }

  async getById(id: string): Promise<Deposition> {
    return apiClient.get<Deposition>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Deposition[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<Deposition>): Promise<Deposition> {
    return apiClient.post<Deposition>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Deposition>): Promise<Deposition> {
    return apiClient.put<Deposition>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Deposition['status']): Promise<Deposition> {
    return apiClient.patch<Deposition>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
