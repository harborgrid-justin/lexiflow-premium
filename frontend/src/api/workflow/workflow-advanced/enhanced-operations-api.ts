/**
 * Enhanced Operations API
 * Core workflow operations with advanced features
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  EnhancedWorkflowInstance,
  WorkflowQueryFilters,
  WorkflowSortOptions,
} from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Get enhanced workflow instance
 */
export async function getEnhanced(workflowId: string): Promise<EnhancedWorkflowInstance> {
  return apiClient.get(`${BASE_URL}/${workflowId}/enhanced`);
}

/**
 * Create enhanced workflow instance
 */
export async function createEnhanced(
  data: Partial<EnhancedWorkflowInstance>
): Promise<EnhancedWorkflowInstance> {
  return apiClient.post(`${BASE_URL}/enhanced`, data);
}

/**
 * Update enhanced workflow instance
 */
export async function updateEnhanced(
  workflowId: string,
  updates: Partial<EnhancedWorkflowInstance>
): Promise<EnhancedWorkflowInstance> {
  return apiClient.patch(`${BASE_URL}/${workflowId}/enhanced`, updates);
}

/**
 * Query enhanced workflows with advanced filters
 */
export async function queryEnhanced(
  filters: WorkflowQueryFilters,
  sort?: WorkflowSortOptions,
  pagination?: { page: number; limit: number }
): Promise<{
  data: EnhancedWorkflowInstance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  return apiClient.post(`${BASE_URL}/enhanced/query`, {
    filters,
    sort,
    pagination,
  });
}

/**
 * Execute workflow with all features enabled
 */
export async function executeEnhanced(
  workflowId: string,
  input?: Record<string, unknown>,
  options?: {
    dryRun?: boolean;
    enableSnapshots?: boolean;
    enableSLA?: boolean;
    enableAI?: boolean;
  }
): Promise<{
  instanceId: string;
  status: string;
  estimatedCompletion: string;
}> {
  return apiClient.post(`${BASE_URL}/${workflowId}/execute`, {
    input,
    options,
  });
}

/**
 * Pause workflow execution
 */
export async function pauseWorkflow(workflowId: string, reason?: string): Promise<void> {
  return apiClient.post(`${BASE_URL}/${workflowId}/pause`, { reason });
}

/**
 * Resume workflow execution
 */
export async function resumeWorkflow(workflowId: string): Promise<void> {
  return apiClient.post(`${BASE_URL}/${workflowId}/resume`);
}

/**
 * Cancel workflow execution
 */
export async function cancelWorkflow(workflowId: string, reason?: string): Promise<void> {
  return apiClient.post(`${BASE_URL}/${workflowId}/cancel`, { reason });
}

/**
 * Clone workflow with all configurations
 */
export async function cloneWorkflow(
  workflowId: string,
  name: string
): Promise<EnhancedWorkflowInstance> {
  return apiClient.post(`${BASE_URL}/${workflowId}/clone`, { name });
}

/**
 * Export workflow configuration
 */
export async function exportWorkflow(
  workflowId: string,
  format: "json" | "yaml" | "bpmn"
): Promise<Blob> {
  return apiClient.get(`${BASE_URL}/${workflowId}/export`, {
    params: { format },
    responseType: "blob",
  });
}

/**
 * Import workflow configuration
 */
export async function importWorkflow(
  file: File,
  format: "json" | "yaml" | "bpmn"
): Promise<EnhancedWorkflowInstance> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);

  return apiClient.post(`${BASE_URL}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
