/**
 * Analytics API
 * Feature 8: Workflow analytics engine
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { WorkflowAnalytics } from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Get comprehensive workflow analytics
 */
export async function getAnalytics(
  workflowId: string,
  options: {
    start: string;
    end: string;
    includeBottlenecks?: boolean;
    includeSuggestions?: boolean;
    includeTrends?: boolean;
  }
): Promise<WorkflowAnalytics> {
  return apiClient.get(`${BASE_URL}/${workflowId}/analytics`, {
    params: options,
  });
}

/**
 * Get real-time workflow metrics
 */
export async function getRealTimeMetrics(workflowId: string): Promise<{
  activeInstances: number;
  completedToday: number;
  averageDuration: number;
  currentBottlenecks: string[];
}> {
  return apiClient.get(`${BASE_URL}/${workflowId}/analytics/realtime`);
}

/**
 * Get node-specific analytics
 */
export async function getNodeAnalytics(
  workflowId: string,
  nodeId: string
): Promise<{
  executionCount: number;
  averageDuration: number;
  failureRate: number;
  waitTime: number;
  throughput: number;
}> {
  return apiClient.get(`${BASE_URL}/${workflowId}/analytics/nodes/${nodeId}`);
}

/**
 * Export analytics report
 */
export async function exportAnalytics(
  workflowId: string,
  format: "pdf" | "excel" | "csv",
  dateRange: { start: string; end: string }
): Promise<Blob> {
  return apiClient.getBlob(`${BASE_URL}/${workflowId}/analytics/export`, {
    format,
    ...dateRange,
  });
}
