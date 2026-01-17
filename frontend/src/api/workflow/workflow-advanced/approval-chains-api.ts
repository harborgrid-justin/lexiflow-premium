/**
 * Approval Chains API
 * Feature 6: Multi-level approval chains
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type {
  ApprovalChain,
  ApprovalDecision,
  ApprovalInstance,
} from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Create approval chain
 */
export async function createApprovalChain(
  workflowId: string,
  chain: Partial<ApprovalChain>
): Promise<ApprovalChain> {
  return apiClient.post(`${BASE_URL}/${workflowId}/approvals`, chain);
}

/**
 * Get approval chains
 */
export async function getApprovalChains(
  workflowId: string
): Promise<ApprovalChain[]> {
  return apiClient.get(`${BASE_URL}/${workflowId}/approvals`);
}

/**
 * Get approval instance
 */
export async function getApprovalInstance(
  workflowId: string,
  instanceId: string
): Promise<ApprovalInstance> {
  return apiClient.get(
    `${BASE_URL}/${workflowId}/approvals/instances/${instanceId}`
  );
}

/**
 * Submit approval decision
 */
export async function submitApprovalDecision(
  workflowId: string,
  instanceId: string,
  decision: Partial<ApprovalDecision>
): Promise<{ approved: boolean; chainComplete: boolean }> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/approvals/instances/${instanceId}/decide`,
    decision
  );
}

/**
 * Delegate approval
 */
export async function delegateApproval(
  workflowId: string,
  instanceId: string,
  toUserId: string,
  reason?: string
): Promise<void> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/approvals/instances/${instanceId}/delegate`,
    {
      toUserId,
      reason,
    }
  );
}

/**
 * Get pending approvals for user
 */
export async function getPendingApprovals(
  userId: string
): Promise<ApprovalInstance[]> {
  return apiClient.get(`${BASE_URL}/approvals/pending`, { params: { userId } });
}
