/**
 * WebhooksApiService
 * API service split from apiServices.ts
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";

export interface SystemWebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  status: "active" | "inactive";
  createdAt: string;
  lastTriggered?: string;
  failureCount: number;
}

export class WebhooksApiService {
  async getAll(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<SystemWebhookConfig[]> {
    const response = await apiClient.get<
      PaginatedResponse<SystemWebhookConfig>
    >("/webhooks", { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<SystemWebhookConfig> {
    return apiClient.get<SystemWebhookConfig>(`/webhooks/${id}`);
  }

  async create(
    webhook: Omit<
      SystemWebhookConfig,
      "id" | "createdAt" | "lastTriggered" | "failureCount" | "status"
    >
  ): Promise<SystemWebhookConfig> {
    return apiClient.post<SystemWebhookConfig>("/webhooks", webhook);
  }

  async update(
    id: string,
    webhook: Partial<SystemWebhookConfig>
  ): Promise<SystemWebhookConfig> {
    return apiClient.put<SystemWebhookConfig>(`/webhooks/${id}`, webhook);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/webhooks/${id}`);
  }

  async test(
    id: string
  ): Promise<{ success: boolean; message: string; statusCode?: number }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      statusCode?: number;
    }>(`/webhooks/${id}/test`, {});
  }

  async getDeliveries(
    id: string,
    filters?: { page?: number; limit?: number }
  ): Promise<unknown[]> {
    const response = await apiClient.get<PaginatedResponse<unknown>>(
      `/webhooks/${id}/deliveries`,
      filters
    );
    return response.data;
  }
}
