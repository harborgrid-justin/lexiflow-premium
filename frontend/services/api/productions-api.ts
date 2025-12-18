/**
 * Productions API Service
 * Manages discovery productions
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Production {
  id: string;
  caseId: string;
  name: string;
  productionNumber?: string;
  type: 'initial' | 'supplemental' | 'rolling';
  status: 'draft' | 'in_progress' | 'ready' | 'produced' | 'objected';
  producedTo?: string;
  producedBy?: string;
  productionDate?: string;
  dueDate?: string;
  format: 'native' | 'tiff' | 'pdf' | 'paper' | 'electronic';
  documentCount?: number;
  pageCount?: number;
  beginBatesNumber?: string;
  endBatesNumber?: string;
  custodians?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  privilegeLog?: {
    documentId?: string;
    entryCount?: number;
  };
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductionFilters {
  caseId?: string;
  status?: Production['status'];
  type?: Production['type'];
}

export class ProductionsApiService {
  private readonly baseUrl = '/productions';

  async getAll(filters?: ProductionFilters): Promise<Production[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Production[]>(url);
  }

  async getById(id: string): Promise<Production> {
    return apiClient.get<Production>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Production[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<Production>): Promise<Production> {
    return apiClient.post<Production>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Production>): Promise<Production> {
    return apiClient.put<Production>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Production['status']): Promise<Production> {
    return apiClient.patch<Production>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
