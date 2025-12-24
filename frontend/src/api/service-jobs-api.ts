/**
 * Service Jobs API Service
 * Background job monitoring
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface ServiceJob {
  id: string;
  jobType: 'ocr' | 'sync' | 'backup' | 'report' | 'email' | 'cleanup' | 'import' | 'export' | 'custom';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: Record<string, any>;
  metadata?: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
}

export interface ServiceJobFilters {
  jobType?: ServiceJob['jobType'];
  status?: ServiceJob['status'];
  priority?: ServiceJob['priority'];
}

export class ServiceJobsApiService {
  private readonly baseUrl = '/service-jobs';

  async getAll(filters?: ServiceJobFilters): Promise<ServiceJob[]> {
    const params = new URLSearchParams();
    if (filters?.jobType) params.append('jobType', filters.jobType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<ServiceJob[]>(url);
  }

  async getById(id: string): Promise<ServiceJob> {
    return apiClient.get<ServiceJob>(`${this.baseUrl}/${id}`);
  }

  async create(data: { jobType: ServiceJob['jobType']; priority?: ServiceJob['priority']; metadata?: Record<string, any> }): Promise<ServiceJob> {
    return apiClient.post<ServiceJob>(this.baseUrl, data);
  }

  async cancel(id: string): Promise<ServiceJob> {
    return apiClient.post<ServiceJob>(`${this.baseUrl}/${id}/cancel`, {});
  }

  async retry(id: string): Promise<ServiceJob> {
    return apiClient.post<ServiceJob>(`${this.baseUrl}/${id}/retry`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
