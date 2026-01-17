/**
 * Parallel Execution API
 * Feature 2: Parallel execution system
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { ParallelExecutionConfig } from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Create parallel execution configuration
 */
export async function createParallelExecution(
  workflowId: string,
  config: ParallelExecutionConfig
): Promise<ParallelExecutionConfig> {
  return apiClient.post(`${BASE_URL}/${workflowId}/parallel`, config);
}

/**
 * Execute parallel branches
 */
export async function executeParallelBranches(
  workflowId: string,
  configId: string,
  context: Record<string, unknown>
): Promise<{
  completedBranches: string[];
  failedBranches: string[];
  executionTime: number;
  metrics: Record<string, unknown>;
}> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/parallel/${configId}/execute`,
    { context }
  );
}

/**
 * Get parallel execution metrics
 */
export async function getParallelExecutionMetrics(
  workflowId: string,
  configId: string
): Promise<{
  totalExecutions: number;
  averageDuration: number;
  successRate: number;
  branchMetrics: Record<string, unknown>;
}> {
  return apiClient.get(
    `${BASE_URL}/${workflowId}/parallel/${configId}/metrics`
  );
}

/**
 * Update parallel execution configuration
 */
export async function updateParallelExecution(
  workflowId: string,
  configId: string,
  updates: Partial<ParallelExecutionConfig>
): Promise<ParallelExecutionConfig> {
  return apiClient.patch(
    `${BASE_URL}/${workflowId}/parallel/${configId}`,
    updates
  );
}
