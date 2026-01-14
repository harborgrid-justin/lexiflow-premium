/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Approval Chains Service - Feature 6
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  ApprovalChain,
  ApprovalDecision,
  ApprovalInstance,
} from "@/types/workflow-advanced-types";

export class ApprovalChainsService {
  private readonly baseUrl = "/workflow/advanced";

  async create(workflowId: string, chain: Partial<ApprovalChain>) {
    return apiClient.post<ApprovalChain>(
      `${this.baseUrl}/${workflowId}/approvals`,
      chain
    );
  }

  async getChains(workflowId: string) {
    return apiClient.get<ApprovalChain[]>(
      `${this.baseUrl}/${workflowId}/approvals`
    );
  }

  async getInstance(workflowId: string, instanceId: string) {
    return apiClient.get<ApprovalInstance>(
      `${this.baseUrl}/${workflowId}/approvals/instances/${instanceId}`
    );
  }

  async submitDecision(
    workflowId: string,
    instanceId: string,
    decision: Partial<ApprovalDecision>
  ) {
    return apiClient.post(
      `${this.baseUrl}/${workflowId}/approvals/instances/${instanceId}/decide`,
      decision
    );
  }

  async delegate(
    workflowId: string,
    instanceId: string,
    toUserId: string,
    reason?: string
  ) {
    return apiClient.post(
      `${this.baseUrl}/${workflowId}/approvals/instances/${instanceId}/delegate`,
      { toUserId, reason }
    );
  }

  async getPending(userId: string) {
    return apiClient.get<ApprovalInstance[]>(
      `${this.baseUrl}/approvals/pending`,
      { userId }
    );
  }
}
