/**
 * Citations API Service
 * Legal citation management and validation
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Citation {
  id: string;
  caseId?: string;
  documentId?: string;
  citationText: string;
  citationType: 'case_law' | 'statute' | 'regulation' | 'constitution' | 'treatise' | 'law_review';
  jurisdiction?: string;
  court?: string;
  year?: string;
  volume?: string;
  reporter?: string;
  page?: string;
  pinCite?: string;
  bluebookFormat?: string;
  shepardized?: boolean;
  shepardStatus?: 'good_law' | 'questioned' | 'criticized' | 'overruled';
  url?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CitationFilters {
  caseId?: string;
  documentId?: string;
  citationType?: Citation['citationType'];
  jurisdiction?: string;
}

export class CitationsApiService {
  private readonly baseUrl = '/citations';

  async getAll(filters?: CitationFilters): Promise<Citation[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.documentId) params.append('documentId', filters.documentId);
    if (filters?.citationType) params.append('citationType', filters.citationType);
    if (filters?.jurisdiction) params.append('jurisdiction', filters.jurisdiction);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Citation[]>(url);
  }

  async getById(id: string): Promise<Citation> {
    return apiClient.get<Citation>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Citation>): Promise<Citation> {
    return apiClient.post<Citation>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Citation>): Promise<Citation> {
    return apiClient.put<Citation>(`${this.baseUrl}/${id}`, data);
  }

  async validate(citationText: string): Promise<{ valid: boolean; formatted?: string; errors?: string[] }> {
    return apiClient.post(`${this.baseUrl}/validate`, { citationText });
  }

  async shepardize(id: string): Promise<Citation> {
    return apiClient.post<Citation>(`${this.baseUrl}/${id}/shepardize`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
