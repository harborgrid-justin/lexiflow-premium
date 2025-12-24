/**
 * Query Workbench API Service
 * Ad-hoc SQL query execution
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface QueryExecution {
  id: string;
  query: string;
  status: 'running' | 'completed' | 'failed';
  results?: {
    columns: string[];
    rows: unknown[][];
    rowCount: number;
  };
  executionTime?: number;
  error?: string;
  executedAt: string;
  executedBy?: string;
  metadata?: Record<string, any>;
}

export class QueryWorkbenchApiService {
  private readonly baseUrl = '/query-workbench';

  async execute(query: string): Promise<QueryExecution> {
    return apiClient.post<QueryExecution>(`${this.baseUrl}/execute`, { query });
  }

  async getHistory(limit?: number): Promise<QueryExecution[]> {
    const url = limit ? `${this.baseUrl}/history?limit=${limit}` : `${this.baseUrl}/history`;
    return apiClient.get<QueryExecution[]>(url);
  }

  async getById(id: string): Promise<QueryExecution> {
    return apiClient.get<QueryExecution>(`${this.baseUrl}/${id}`);
  }

  async export(id: string, format: 'csv' | 'json' | 'xlsx'): Promise<Blob> {
    const response = await fetch(`/api${this.baseUrl}/${id}/export?format=${format}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.blob();
  }
}
