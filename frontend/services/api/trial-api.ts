/**
 * Trial API Service
 * Manages trial preparation and proceedings
 */

import { apiClient } from '../apiClient';

export interface Trial {
  id: string;
  caseId: string;
  trialType: 'jury' | 'bench' | 'arbitration' | 'administrative';
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'settled';
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number; // in days
  judge?: string;
  courtroom?: string;
  venue?: string;
  jury?: {
    size: number;
    alternates: number;
    selectedJurors?: string[];
  };
  phases?: {
    name: string;
    status: 'pending' | 'active' | 'completed';
    startDate?: string;
    endDate?: string;
  }[];
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrialFilters {
  caseId?: string;
  status?: Trial['status'];
  trialType?: Trial['trialType'];
}

export class TrialApiService {
  private readonly baseUrl = '/trial';

  async getAll(filters?: TrialFilters): Promise<Trial[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.trialType) params.append('trialType', filters.trialType);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Trial[]>(url);
  }

  async getById(id: string): Promise<Trial> {
    return apiClient.get<Trial>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Trial[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<Trial>): Promise<Trial> {
    return apiClient.post<Trial>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Trial>): Promise<Trial> {
    return apiClient.put<Trial>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Trial['status']): Promise<Trial> {
    return apiClient.patch<Trial>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
