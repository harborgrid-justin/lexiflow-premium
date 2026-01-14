/**
 * Conditional Branching API
 * Feature 1: Conditional branching engine
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { ConditionalBranchingConfig } from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Create conditional branching configuration
 */
export async function createConditionalBranching(
  workflowId: string,
  config: ConditionalBranchingConfig
): Promise<ConditionalBranchingConfig> {
  return apiClient.post(`${BASE_URL}/${workflowId}/conditional`, config);
}

/**
 * Evaluate conditional rules for a specific context
 */
export async function evaluateConditionalBranching(
  workflowId: string,
  nodeId: string,
  context: Record<string, unknown>
): Promise<{ branchId: string; matched: boolean; evaluationTime: number }> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/conditional/${nodeId}/evaluate`,
    { context }
  );
}

/**
 * Update conditional branching configuration
 */
export async function updateConditionalBranching(
  workflowId: string,
  configId: string,
  updates: Partial<ConditionalBranchingConfig>
): Promise<ConditionalBranchingConfig> {
  return apiClient.patch(
    `${BASE_URL}/${workflowId}/conditional/${configId}`,
    updates
  );
}

/**
 * Delete conditional branching configuration
 */
export async function deleteConditionalBranching(
  workflowId: string,
  configId: string
): Promise<void> {
  return apiClient.delete(
    `${BASE_URL}/${workflowId}/conditional/${configId}`
  );
}

/**
 * Test conditional rules with sample data
 */
export async function testConditionalRules(
  workflowId: string,
  config: ConditionalBranchingConfig,
  testCases: Array<{ input: Record<string, unknown>; expectedBranch: string }>
): Promise<
  Array<{
    input: Record<string, unknown>;
    actualBranch: string;
    passed: boolean;
  }>
> {
  return apiClient.post(`${BASE_URL}/${workflowId}/conditional/test`, {
    config,
    testCases,
  });
}
