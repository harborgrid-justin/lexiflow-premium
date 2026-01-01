/**
 * Processing API Service
 * Manages document processing jobs
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { ProcessingJob } from '@/types/discovery-enhanced';

export class ProcessingApiService {
  private readonly baseUrl = '/discovery/processing';

  async getAll(caseId?: string): Promise<ProcessingJob[]> {
    const params = new URLSearchParams();
    if (caseId) params.append('caseId', caseId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: ProcessingJob[] }>(url);
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<ProcessingJob> {
    return apiClient.get<ProcessingJob>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<ProcessingJob>): Promise<ProcessingJob> {
    return apiClient.post<ProcessingJob>(this.baseUrl, data);
  }

  async pause(id: string): Promise<ProcessingJob> {
    return apiClient.post<ProcessingJob>(`${this.baseUrl}/${id}/pause`, {});
  }

  async resume(id: string): Promise<ProcessingJob> {
    return apiClient.post<ProcessingJob>(`${this.baseUrl}/${id}/resume`, {});
  }

  async retry(id: string): Promise<ProcessingJob> {
    return apiClient.post<ProcessingJob>(`${this.baseUrl}/${id}/retry`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const processingApi = new ProcessingApiService();
