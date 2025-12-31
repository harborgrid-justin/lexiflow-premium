/**
 * Knowledge API Service
 * Knowledge base and FAQ management
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  author?: string;
  status: 'draft' | 'published' | 'archived';
  viewCount?: number;
  lastViewedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeFilters {
  category?: string;
  status?: KnowledgeArticle['status'];
  search?: string;
}

export class KnowledgeApiService {
  private readonly baseUrl = '/knowledge';

  async getAll(filters?: KnowledgeFilters): Promise<KnowledgeArticle[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<KnowledgeArticle[]>(url);
  }

  async getById(id: string): Promise<KnowledgeArticle> {
    return apiClient.get<KnowledgeArticle>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
    return apiClient.post<KnowledgeArticle>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
    return apiClient.put<KnowledgeArticle>(`${this.baseUrl}/${id}`, data);
  }

  async search(query: string): Promise<KnowledgeArticle[]> {
    return this.getAll({ search: query, status: 'published' });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
