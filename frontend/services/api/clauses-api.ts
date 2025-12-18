/**
 * Clauses API Service
 * Legal clause library and templates
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Clause {
  id: string;
  name: string;
  category: 'boilerplate' | 'custom' | 'standard' | 'statutory' | 'contractual';
  clauseType: string;
  text: string;
  variables?: {
    name: string;
    type: string;
    defaultValue?: string;
  }[];
  jurisdiction?: string;
  tags?: string[];
  isPublic: boolean;
  usageCount?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClauseFilters {
  category?: Clause['category'];
  clauseType?: string;
  jurisdiction?: string;
  search?: string;
}

export class ClausesApiService {
  private readonly baseUrl = '/clauses';

  async getAll(filters?: ClauseFilters): Promise<Clause[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.clauseType) params.append('clauseType', filters.clauseType);
    if (filters?.jurisdiction) params.append('jurisdiction', filters.jurisdiction);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Clause[]>(url);
  }

  async getById(id: string): Promise<Clause> {
    return apiClient.get<Clause>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Clause>): Promise<Clause> {
    return apiClient.post<Clause>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Clause>): Promise<Clause> {
    return apiClient.put<Clause>(`${this.baseUrl}/${id}`, data);
  }

  async render(id: string, variables: Record<string, any>): Promise<{ text: string }> {
    return apiClient.post(`${this.baseUrl}/${id}/render`, { variables });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
