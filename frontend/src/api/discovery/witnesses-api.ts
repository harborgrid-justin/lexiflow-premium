/**
 * Witnesses API Service
 * Manages witness entities in discovery
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface Witness {
  id: string;
  caseId: string;
  name: string;
  witnessType: 'fact_witness' | 'expert_witness' | 'character_witness' | 'rebuttal_witness' | 'impeachment_witness';
  status: 'identified' | 'contacted' | 'interviewed' | 'subpoenaed' | 'deposed' | 'testifying' | 'testified' | 'unavailable' | 'withdrawn';
  email?: string;
  phone?: string;
  address?: string;
  organization?: string;
  title?: string;
  expertise?: string;
  credibilityScore?: number;
  impeachmentRisks?: string[];
  prepStatus?: number;
  linkedExhibits?: string[];
  notes?: string;
  contactedAt?: string;
  interviewedAt?: string;
  subpoenaedAt?: string;
  deposedAt?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WitnessFilters {
  caseId?: string;
  witnessType?: Witness['witnessType'];
  status?: Witness['status'];
}

export class WitnessesApiService {
  private readonly baseUrl = '/discovery/witnesses';

  async getAll(filters?: WitnessFilters): Promise<Witness[]> {
    return apiClient.get<Witness[]>(this.baseUrl);
  }

  async getById(id: string): Promise<Witness> {
    return apiClient.get<Witness>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Witness[]> {
    return apiClient.get<Witness[]>(`${this.baseUrl}/case/${caseId}`);
  }

  async getByType(witnessType: Witness['witnessType']): Promise<Witness[]> {
    return apiClient.get<Witness[]>(`${this.baseUrl}/type/${witnessType}`);
  }

  async getByStatus(status: Witness['status']): Promise<Witness[]> {
    return apiClient.get<Witness[]>(`${this.baseUrl}/status/${status}`);
  }

  async create(data: Partial<Witness>): Promise<Witness> {
    return apiClient.post<Witness>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Witness>): Promise<Witness> {
    return apiClient.put<Witness>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Witness['status']): Promise<Witness> {
    return apiClient.patch<Witness>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
