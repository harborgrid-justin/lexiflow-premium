/**
 * External API Service
 * External API integration management
 */

import { apiClient } from '../apiClient';

export interface ExternalAPIConfig {
  id: string;
  name: string;
  provider: 'pacer' | 'westlaw' | 'lexisnexis' | 'bloomberg' | 'courtlink' | 'custom';
  baseUrl: string;
  authType: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key';
  credentials?: Record<string, any>;
  rateLimit?: {
    requestsPerSecond: number;
    requestsPerDay: number;
  };
  status: 'active' | 'inactive' | 'error';
  lastUsed?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExternalAPICall {
  id: string;
  apiConfigId: string;
  method: string;
  endpoint: string;
  status: number;
  requestTime: number;
  timestamp: string;
  error?: string;
}

export class ExternalAPIService {
  private readonly baseUrl = '/external-api';

  async getAll(): Promise<ExternalAPIConfig[]> {
    return apiClient.get<ExternalAPIConfig[]>(this.baseUrl);
  }

  async getById(id: string): Promise<ExternalAPIConfig> {
    return apiClient.get<ExternalAPIConfig>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<ExternalAPIConfig>): Promise<ExternalAPIConfig> {
    return apiClient.post<ExternalAPIConfig>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<ExternalAPIConfig>): Promise<ExternalAPIConfig> {
    return apiClient.put<ExternalAPIConfig>(`${this.baseUrl}/${id}`, data);
  }

  async test(id: string): Promise<{ success: boolean; message?: string; responseTime?: number }> {
    return apiClient.post(`${this.baseUrl}/${id}/test`, {});
  }

  async getCallHistory(id: string, limit?: number): Promise<ExternalAPICall[]> {
    const url = limit ? `${this.baseUrl}/${id}/history?limit=${limit}` : `${this.baseUrl}/${id}/history`;
    return apiClient.get<ExternalAPICall[]>(url);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
