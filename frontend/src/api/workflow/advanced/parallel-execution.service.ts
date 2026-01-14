/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Parallel Execution Service - Feature 2
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { ParallelExecutionConfig } from "@/types/workflow-advanced-types";

export class ParallelExecutionService {
  private readonly baseUrl = "/workflow/advanced";

  async create(workflowId: string, config: ParallelExecutionConfig) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/parallel`, config);
  }

  async execute(
    workflowId: string,
    configId: string,
    context: Record<string, unknown>
  ) {
    return apiClient.post(
      `${this.baseUrl}/${workflowId}/parallel/${configId}/execute`,
      { context }
    );
  }

  async getMetrics(workflowId: string, configId: string) {
    return apiClient.get(
      `${this.baseUrl}/${workflowId}/parallel/${configId}/metrics`
    );
  }

  async update(
    workflowId: string,
    configId: string,
    updates: Partial<ParallelExecutionConfig>
  ) {
    return apiClient.patch(
      `${this.baseUrl}/${workflowId}/parallel/${configId}`,
      updates
    );
  }
}
