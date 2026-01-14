/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * External Triggers Service - Feature 10
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  ExternalTrigger,
  TriggerEvent,
} from "@/types/workflow-advanced-types";

export class ExternalTriggersService {
  private readonly baseUrl = "/workflow/advanced";

  async create(workflowId: string, config: Partial<ExternalTrigger>) {
    return apiClient.post<ExternalTrigger>(
      `${this.baseUrl}/${workflowId}/triggers`,
      config
    );
  }

  async getAll(workflowId: string) {
    return apiClient.get<ExternalTrigger[]>(
      `${this.baseUrl}/${workflowId}/triggers`
    );
  }

  async update(
    workflowId: string,
    triggerId: string,
    updates: Partial<ExternalTrigger>
  ) {
    return apiClient.patch<ExternalTrigger>(
      `${this.baseUrl}/${workflowId}/triggers/${triggerId}`,
      updates
    );
  }

  async toggle(workflowId: string, triggerId: string, enabled: boolean) {
    return apiClient.post(
      `${this.baseUrl}/${workflowId}/triggers/${triggerId}/toggle`,
      { enabled }
    );
  }

  async test(
    workflowId: string,
    triggerId: string,
    payload: Record<string, unknown>
  ) {
    return apiClient.post<TriggerEvent>(
      `${this.baseUrl}/${workflowId}/triggers/${triggerId}/test`,
      { payload }
    );
  }

  async getEvents(workflowId: string, triggerId: string, limit: number = 50) {
    return apiClient.get<TriggerEvent[]>(
      `${this.baseUrl}/${workflowId}/triggers/${triggerId}/events`,
      { limit }
    );
  }

  async delete(workflowId: string, triggerId: string) {
    return apiClient.delete(
      `${this.baseUrl}/${workflowId}/triggers/${triggerId}`
    );
  }
}
