/**
 * Integrations API Service
 * Manages third-party integrations and connections
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Integration {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'disconnected';
  config?: Record<string, any>;
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
  };
  syncEnabled: boolean;
  lastSyncedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationCredentials {
  accessToken: string;
  refreshToken: string;
}

export class IntegrationsApiService {
  private readonly baseUrl = '/integrations';

  async getAll(): Promise<Integration[]> {
    return apiClient.get<Integration[]>(this.baseUrl);
  }

  async getById(id: string): Promise<Integration> {
    return apiClient.get<Integration>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Integration>): Promise<Integration> {
    return apiClient.post<Integration>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Integration>): Promise<Integration> {
    return apiClient.put<Integration>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async connect(id: string, credentials: IntegrationCredentials): Promise<Integration> {
    return apiClient.post<Integration>(`${this.baseUrl}/${id}/connect`, credentials);
  }

  async disconnect(id: string): Promise<Integration> {
    return apiClient.post<Integration>(`${this.baseUrl}/${id}/disconnect`, {});
  }

  async refreshCredentials(id: string): Promise<Integration> {
    return apiClient.post<Integration>(`${this.baseUrl}/${id}/refresh`, {});
  }

  async sync(id: string): Promise<Integration> {
    return apiClient.post<Integration>(`${this.baseUrl}/${id}/sync`, {});
  }

  async testConnection(id: string): Promise<{ status: string; connected: boolean }> {
    return apiClient.get(`${this.baseUrl}/${id}/test`);
  }
}
