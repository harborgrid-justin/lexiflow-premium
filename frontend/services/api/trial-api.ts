/**
 * Trial API Service
 * Manages trial preparation and proceedings
 */

import { apiClient } from '../infrastructure/apiClient';

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

  // Trial Events Management
  async getEvents(filters?: { caseId?: string; trialId?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.trialId) params.append('trialId', filters.trialId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/events?${queryString}` : `${this.baseUrl}/events`;
    return apiClient.get<any[]>(url);
  }

  async createEvent(data: {
    trialId: string;
    eventType: string;
    scheduledAt: string;
    duration?: number;
    description?: string;
  }): Promise<any> {
    return apiClient.post<any>(`${this.baseUrl}/events`, data);
  }

  async updateEvent(id: string, data: Partial<{
    eventType: string;
    scheduledAt: string;
    duration?: number;
    description?: string;
  }>): Promise<any> {
    return apiClient.put<any>(`${this.baseUrl}/events/${id}`, data);
  }

  async deleteEvent(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/events/${id}`);
  }

  // Witness Preparation Management
  async getWitnessPrep(filters?: { trialId?: string; witnessId?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.trialId) params.append('trialId', filters.trialId);
    if (filters?.witnessId) params.append('witnessId', filters.witnessId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/witness-prep?${queryString}` : `${this.baseUrl}/witness-prep`;
    return apiClient.get<any[]>(url);
  }

  async createWitnessPrep(data: {
    trialId: string;
    witnessId: string;
    prepDate: string;
    duration?: number;
    topics?: string[];
    notes?: string;
  }): Promise<any> {
    return apiClient.post<any>(`${this.baseUrl}/witness-prep`, data);
  }
}
