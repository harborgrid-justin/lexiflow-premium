/**
 * WebhooksApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';
import type {
  Case,
  DocketEntry,
  LegalDocument,
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';
import type { WebhookConfig } from '../../types/system';

export class WebhooksApiService {
  async getAll(filters?: { status?: string; page?: number; limit?: number }): Promise<WebhookConfig[]> {
    const response = await apiClient.get<PaginatedResponse<WebhookConfig>>('/webhooks', filters);
    return response.data;
  }

  async getById(id: string): Promise<WebhookConfig> {
    return apiClient.get<WebhookConfig>(`/webhooks/${id}`);
  }

  async create(webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'lastTriggered' | 'failureCount' | 'status'>): Promise<WebhookConfig> {
    return apiClient.post<WebhookConfig>('/webhooks', webhook);
  }

  async update(id: string, webhook: Partial<WebhookConfig>): Promise<WebhookConfig> {
    return apiClient.put<WebhookConfig>(`/webhooks/${id}`, webhook);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/webhooks/${id}`);
  }

  async test(id: string): Promise<{ success: boolean; message: string; statusCode?: number }> {
    return apiClient.post<{ success: boolean; message: string; statusCode?: number }>(`/webhooks/${id}/test`, {});
  }

  async getDeliveries(id: string, filters?: { page?: number; limit?: number }): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<unknown>>(`/webhooks/${id}/deliveries`, filters);
    return response.data;
  }
}
