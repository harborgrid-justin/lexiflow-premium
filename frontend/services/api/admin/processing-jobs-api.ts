/**
 * Processing Jobs API Service (Admin/Monitoring)
 * For monitoring background jobs: OCR, PDF generation, email, etc.
 * Coverage: 5/5 endpoints
 */

import { apiClient, type PaginatedResponse } from '../../infrastructure/apiClient';

export interface ProcessingJob {
  id: string;
  type: 'ocr' | 'pdf_generation' | 'email' | 'report' | 'backup' | 'document_processing';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  entityId?: string;
  entityType?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
  createdBy: string;
  createdAt: string;
}

export interface JobFilters {
  type?: string;
  status?: string;
  entityId?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export class ProcessingJobsApiService {
  /**
   * Get all processing jobs with filters
   * GET ${API_PREFIX}/processing-jobs
   */
  async getAll(filters?: JobFilters): Promise<ProcessingJob[]> {
    const response = await apiClient.get<PaginatedResponse<ProcessingJob>>('/processing-jobs', filters);
    return response.data;
  }

  /**
   * Get job by ID
   * GET ${API_PREFIX}/processing-jobs/:id
   */
  async getById(id: string): Promise<ProcessingJob> {
    return apiClient.get<ProcessingJob>(`/processing-jobs/${id}`);
  }

  /**
   * Get jobs by entity (e.g., all jobs for a specific document)
   * GET ${API_PREFIX}/processing-jobs/entity/:entityType/:entityId
   */
  async getByEntity(entityType: string, entityId: string): Promise<ProcessingJob[]> {
    const response = await apiClient.get<PaginatedResponse<ProcessingJob>>(
      `/processing-jobs/entity/${entityType}/${entityId}`
    );
    return response.data;
  }

  /**
   * Cancel a running job
   * POST ${API_PREFIX}/processing-jobs/:id/cancel
   */
  async cancel(id: string): Promise<ProcessingJob> {
    return apiClient.post<ProcessingJob>(`/processing-jobs/${id}/cancel`, {});
  }

  /**
   * Retry a failed job
   * POST ${API_PREFIX}/processing-jobs/:id/retry
   */
  async retry(id: string): Promise<ProcessingJob> {
    return apiClient.post<ProcessingJob>(`/processing-jobs/${id}/retry`, {});
  }

  /**
   * Get job statistics
   * GET ${API_PREFIX}/processing-jobs/stats
   */
  async getStats(): Promise<{
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    byType: { type: string; count: number }[];
  }> {
    return apiClient.get('/processing-jobs/stats');
  }
}

