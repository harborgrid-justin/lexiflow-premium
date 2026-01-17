/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * SLA Monitoring Service - Feature 5
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { SLAConfig, SLAStatus } from "@/types/workflow-advanced-types";

export class SLAMonitoringService {
  private readonly baseUrl = "/workflow/advanced";

  async create(workflowId: string, config: Partial<SLAConfig>) {
    return apiClient.post<SLAConfig>(
      `${this.baseUrl}/${workflowId}/sla`,
      config
    );
  }

  async getConfigs(workflowId: string) {
    return apiClient.get<SLAConfig[]>(`${this.baseUrl}/${workflowId}/sla`);
  }

  async calculateStatus(
    workflowId: string,
    nodeId: string,
    slaConfigId: string
  ) {
    return apiClient.get<SLAStatus>(
      `${this.baseUrl}/${workflowId}/sla/${slaConfigId}/status/${nodeId}`
    );
  }

  async getDashboard(workflowId: string) {
    return apiClient.get(`${this.baseUrl}/${workflowId}/sla/dashboard`);
  }

  async pause(workflowId: string, nodeId: string, reason: string) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/sla/pause/${nodeId}`, {
      reason,
    });
  }

  async resume(workflowId: string, nodeId: string) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/sla/resume/${nodeId}`);
  }
}
