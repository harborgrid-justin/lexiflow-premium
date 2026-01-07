/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Analytics Engine Service - Feature 8
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { WorkflowAnalytics } from "@/types/workflow-advanced-types";

export class AnalyticsService {
  private readonly baseUrl = "/workflow/advanced";

  async getAnalytics(
    workflowId: string,
    options: {
      start: string;
      end: string;
      includeBottlenecks?: boolean;
      includeSuggestions?: boolean;
      includeTrends?: boolean;
    }
  ) {
    return apiClient.get<WorkflowAnalytics>(
      `${this.baseUrl}/${workflowId}/analytics`,
      options
    );
  }

  async getRealTime(workflowId: string) {
    return apiClient.get(`${this.baseUrl}/${workflowId}/analytics/realtime`);
  }

  async getNodeAnalytics(workflowId: string, nodeId: string) {
    return apiClient.get(
      `${this.baseUrl}/${workflowId}/analytics/nodes/${nodeId}`
    );
  }

  async export(
    workflowId: string,
    format: "pdf" | "excel" | "csv",
    dateRange: { start: string; end: string }
  ) {
    return apiClient.getBlob(`${this.baseUrl}/${workflowId}/analytics/export`, {
      format,
      ...dateRange,
    });
  }
}
