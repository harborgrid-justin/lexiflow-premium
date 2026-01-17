/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Workflow Versioning Service - Feature 3
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type {
  EnhancedWorkflowInstance,
  WorkflowDiff,
  WorkflowVersion,
} from "@/types/workflow-advanced-types";

export class VersioningService {
  private readonly baseUrl = "/workflow/advanced";

  async create(workflowId: string, versionData: Partial<WorkflowVersion>) {
    return apiClient.post<WorkflowVersion>(
      `${this.baseUrl}/${workflowId}/versions`,
      versionData
    );
  }

  async getAll(workflowId: string) {
    return apiClient.get<WorkflowVersion[]>(
      `${this.baseUrl}/${workflowId}/versions`
    );
  }

  async getById(workflowId: string, versionId: string) {
    return apiClient.get<WorkflowVersion>(
      `${this.baseUrl}/${workflowId}/versions/${versionId}`
    );
  }

  async compare(workflowId: string, versionA: string, versionB: string) {
    return apiClient.get<WorkflowDiff>(
      `${this.baseUrl}/${workflowId}/versions/compare`,
      {
        params: { versionA, versionB },
      }
    );
  }

  async rollback(workflowId: string, versionId: string) {
    return apiClient.post<EnhancedWorkflowInstance>(
      `${this.baseUrl}/${workflowId}/versions/${versionId}/rollback`
    );
  }

  async publish(workflowId: string, versionId: string) {
    return apiClient.post<WorkflowVersion>(
      `${this.baseUrl}/${workflowId}/versions/${versionId}/publish`
    );
  }

  async deprecate(workflowId: string, versionId: string, reason: string) {
    return apiClient.post<WorkflowVersion>(
      `${this.baseUrl}/${workflowId}/versions/${versionId}/deprecate`,
      { reason }
    );
  }
}
