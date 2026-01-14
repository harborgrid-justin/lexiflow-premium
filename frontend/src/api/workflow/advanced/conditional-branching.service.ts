/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Conditional Branching Service - Feature 1
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { ConditionalBranchingConfig } from "@/types/workflow-advanced-types";

export class ConditionalBranchingService {
  private readonly baseUrl = "/workflow/advanced";

  async create(workflowId: string, config: ConditionalBranchingConfig) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/conditional`, config);
  }

  async evaluate(
    workflowId: string,
    nodeId: string,
    context: Record<string, unknown>
  ) {
    return apiClient.post(
      `${this.baseUrl}/${workflowId}/conditional/${nodeId}/evaluate`,
      { context }
    );
  }

  async update(
    workflowId: string,
    configId: string,
    updates: Partial<ConditionalBranchingConfig>
  ) {
    return apiClient.patch(
      `${this.baseUrl}/${workflowId}/conditional/${configId}`,
      updates
    );
  }

  async delete(workflowId: string, configId: string) {
    return apiClient.delete(
      `${this.baseUrl}/${workflowId}/conditional/${configId}`
    );
  }

  async test(
    workflowId: string,
    config: ConditionalBranchingConfig,
    testCases: Array<{ input: Record<string, unknown>; expectedBranch: string }>
  ) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/conditional/test`, {
      config,
      testCases,
    });
  }
}
