/**
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Rollback Mechanism Service - Feature 7
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type {
  RollbackOperation,
  WorkflowSnapshot,
} from "@/types/workflow-advanced-types";

export class RollbackService {
  private readonly baseUrl = "/workflow/advanced";

  async createSnapshot(
    workflowId: string,
    data: {
      type: "manual" | "milestone" | "scheduled";
      label?: string;
      description?: string;
    }
  ) {
    return apiClient.post<WorkflowSnapshot>(
      `${this.baseUrl}/${workflowId}/snapshots`,
      data
    );
  }

  async getSnapshots(workflowId: string) {
    return apiClient.get<WorkflowSnapshot[]>(
      `${this.baseUrl}/${workflowId}/snapshots`
    );
  }

  async getSnapshot(workflowId: string, snapshotId: string) {
    return apiClient.get<WorkflowSnapshot>(
      `${this.baseUrl}/${workflowId}/snapshots/${snapshotId}`
    );
  }

  async rollback(
    workflowId: string,
    snapshotId: string,
    strategy: "full" | "partial" | "compensating" = "full",
    dryRun: boolean = false
  ) {
    return apiClient.post<RollbackOperation>(
      `${this.baseUrl}/${workflowId}/snapshots/${snapshotId}/rollback`,
      { strategy, dryRun }
    );
  }

  async deleteSnapshot(workflowId: string, snapshotId: string) {
    return apiClient.delete(
      `${this.baseUrl}/${workflowId}/snapshots/${snapshotId}`
    );
  }

  async configureAuto(
    workflowId: string,
    config: {
      enabled: boolean;
      interval?: number;
      maxSnapshots?: number;
      retentionDays?: number;
    }
  ) {
    return apiClient.post(
      `${this.baseUrl}/${workflowId}/snapshots/auto-config`,
      config
    );
  }
}
