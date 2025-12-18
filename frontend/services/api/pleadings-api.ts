/**
 * Pleadings API Service
 * Manages legal pleadings (complaints, answers, replies, etc.)
 */

import { apiClient } from '../apiClient';

export interface Pleading {
  id: string;
  caseId: string;
  type: 'complaint' | 'answer' | 'reply' | 'counterclaim' | 'cross_claim' | 'amended_complaint' | 'amended_answer';
  title: string;
  filedDate?: string;
  filedBy?: string;
  documentId?: string;
  status: 'draft' | 'filed' | 'served' | 'responded' | 'withdrawn';
  dueDate?: string;
  claims?: string[];
  defenses?: string[];
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PleadingFilters {
  caseId?: string;
  type?: Pleading['type'];
  status?: Pleading['status'];
}

export class PleadingsApiService {
  private readonly baseUrl = '/pleadings';

  async getAll(filters?: PleadingFilters): Promise<Pleading[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Pleading[]>(url);
  }

  async getById(id: string): Promise<Pleading> {
    return apiClient.get<Pleading>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Pleading[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<Pleading>): Promise<Pleading> {
    return apiClient.post<Pleading>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Pleading>): Promise<Pleading> {
    return apiClient.put<Pleading>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
