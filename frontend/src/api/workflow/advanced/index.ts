/**
 * [PROTOCOL 10] COMPONENT COLOCATION (BARRELING)
 * Main Advanced Workflow API - Composition Facade (~90 LOC)
 * Reduced from 910 LOC to modular, testable services
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import { AISuggestionsService } from "./ai-suggestions.service";
import { AnalyticsService } from "./analytics.service";
import { ApprovalChainsService } from "./approval-chains.service";
import { ConditionalBranchingService } from "./conditional-branching.service";
import { ExternalTriggersService } from "./external-triggers.service";
import { ParallelExecutionService } from "./parallel-execution.service";
import { RollbackService } from "./rollback.service";
import { SLAMonitoringService } from "./sla-monitoring.service";
import { TemplateLibraryService } from "./template-library.service";
import { VersioningService } from "./versioning.service";

export * from "@/types/workflow-advanced-types";

/**
 * Unified Advanced Workflow API - 10 Feature Modules
 */
export class WorkflowAdvancedApiService {
  private readonly baseUrl = "/workflow/advanced";

  // Feature services (composition over monolith)
  public readonly conditionalBranching = new ConditionalBranchingService();
  public readonly parallelExecution = new ParallelExecutionService();
  public readonly versioning = new VersioningService();
  public readonly templates = new TemplateLibraryService();
  public readonly sla = new SLAMonitoringService();
  public readonly approvals = new ApprovalChainsService();
  public readonly rollback = new RollbackService();
  public readonly analytics = new AnalyticsService();
  public readonly ai = new AISuggestionsService();
  public readonly triggers = new ExternalTriggersService();

  // Core workflow instance operations
  async getEnhanced(workflowId: string) {
    return apiClient.get(`${this.baseUrl}/${workflowId}/enhanced`);
  }

  async createEnhanced(data: Record<string, unknown>) {
    return apiClient.post(`${this.baseUrl}/enhanced`, data);
  }

  async updateEnhanced(workflowId: string, updates: Record<string, unknown>) {
    return apiClient.patch(`${this.baseUrl}/${workflowId}/enhanced`, updates);
  }

  async queryEnhanced(
    filters: Record<string, unknown>,
    sort?: Record<string, unknown>,
    pagination?: { page?: number; limit?: number }
  ) {
    return apiClient.post(`${this.baseUrl}/enhanced/query`, {
      filters,
      sort,
      pagination,
    });
  }

  async executeEnhanced(
    workflowId: string,
    input?: Record<string, unknown>,
    options?: Record<string, unknown>
  ) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/execute`, {
      input,
      options,
    });
  }

  async pause(workflowId: string, reason?: string) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/pause`, { reason });
  }

  async resume(workflowId: string) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/resume`);
  }

  async cancel(workflowId: string, reason?: string) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/cancel`, { reason });
  }

  async clone(workflowId: string, name: string) {
    return apiClient.post(`${this.baseUrl}/${workflowId}/clone`, { name });
  }

  async export(workflowId: string, format: "json" | "yaml" | "bpmn") {
    return apiClient.get(`${this.baseUrl}/${workflowId}/export`, {
      params: { format },
    });
  }

  async import(file: File, format: "json" | "yaml" | "bpmn") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);
    return apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

export const workflowAdvancedApi = new WorkflowAdvancedApiService();
