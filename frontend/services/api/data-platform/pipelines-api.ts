/**
 * @module services/api/data-platform/pipelines-api
 * @description ETL/ELT pipeline management API service
 * Handles pipeline creation, execution, and monitoring
 * 
 * @responsibility Manage data integration pipelines
 */

import { apiClient, type PaginatedResponse } from '../../infrastructure/apiClient';

/**
 * Pipeline interface
 */
export interface Pipeline {
  id: string;
  name: string;
  type: 'ETL' | 'ELT' | 'Streaming' | 'Batch';
  sourceConnector: string;
  targetConnector: string;
  configuration: Record<string, any>;
  status: 'Running' | 'Active' | 'Paused' | 'Failed' | 'Draft' | 'Success';
  schedule?: string;
  recordsProcessed: number;
  lastRun?: string;
  lastRunStatus?: string;
  createdAt: string;
  // Additional fields for compatibility with PipelineJob
  duration?: number;
  volume?: number;
  logs?: Array<{ timestamp: string; level: string; message: string }>;
}

/**
 * Pipelines API service class
 * Provides methods for managing ETL/ELT pipelines
 */
export class PipelinesApiService {
  /**
   * Get all pipelines with optional filters
   */
  async getAll(filters?: any): Promise<PaginatedResponse<Pipeline>> {
    try {
      return await apiClient.get<PaginatedResponse<Pipeline>>('/pipelines', filters);
    } catch (error) {
      console.error('[PipelinesApi] Error fetching pipelines:', error);
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  /**
   * Get a specific pipeline by ID
   */
  async getById(id: string): Promise<Pipeline> {
    return await apiClient.get<Pipeline>(`/pipelines/${id}`);
  }

  /**
   * Create a new pipeline
   */
  async create(data: Partial<Pipeline>): Promise<Pipeline> {
    return await apiClient.post<Pipeline>('/pipelines', data);
  }

  /**
   * Update an existing pipeline
   */
  async update(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    return await apiClient.put<Pipeline>(`/pipelines/${id}`, data);
  }

  /**
   * Delete a pipeline
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pipelines/${id}`);
  }

  /**
   * Execute a pipeline
   */
  async execute(id: string): Promise<{ jobId: string; status: string }> {
    return await apiClient.post(`/pipelines/${id}/execute`, {});
  }

  /**
   * Get pipeline statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    failed: number;
    paused: number;
    totalRecordsProcessed: number;
  }> {
    try {
      return await apiClient.get('/pipelines/stats');
    } catch (error) {
      return { total: 0, active: 0, failed: 0, paused: 0, totalRecordsProcessed: 0 };
    }
  }
}
