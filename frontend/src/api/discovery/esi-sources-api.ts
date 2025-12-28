/**
 * ESI Sources API Service
 * Electronically Stored Information sources management
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface ESISource {
  id: string;
  caseId: string;
  custodianId?: string;
  sourceType: 'email' | 'file_server' | 'database' | 'cloud_storage' | 'mobile_device' | 'social_media' | 'application';
  name: string;
  description?: string;
  location?: string;
  status: 'identified' | 'preserved' | 'collected' | 'processed' | 'reviewed';
  dateRange?: {
    start: string;
    end: string;
  };
  estimatedSize?: number;
  actualSize?: number;
  collectionDate?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ESISourceFilters {
  caseId?: string;
  custodianId?: string;
  sourceType?: ESISource['sourceType'];
  status?: ESISource['status'];
}

export class ESISourcesApiService {
  private readonly baseUrl = '/esi-sources';

  async getAll(filters?: ESISourceFilters): Promise<ESISource[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.custodianId) params.append('custodianId', filters.custodianId);
    if (filters?.sourceType) params.append('sourceType', filters.sourceType);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: ESISource[] }>(url);
    // Backend returns paginated response {items, total, page, limit, totalPages}
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<ESISource> {
    return apiClient.get<ESISource>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<ESISource>): Promise<ESISource> {
    return apiClient.post<ESISource>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<ESISource>): Promise<ESISource> {
    return apiClient.put<ESISource>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: ESISource['status']): Promise<ESISource> {
    return apiClient.patch<ESISource>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
