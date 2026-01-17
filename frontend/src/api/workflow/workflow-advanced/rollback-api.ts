/**
 * Rollback API
 * Feature 7: Snapshot and rollback mechanism
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type {
  WorkflowSnapshot,
  RollbackOperation,
} from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Create workflow snapshot
 */
export async function createSnapshot(
  workflowId: string,
  data: {
    type: "manual" | "milestone" | "scheduled";
    label?: string;
    description?: string;
  }
): Promise<WorkflowSnapshot> {
  return apiClient.post(`${BASE_URL}/${workflowId}/snapshots`, data);
}

/**
 * Get workflow snapshots
 */
export async function getSnapshots(workflowId: string): Promise<WorkflowSnapshot[]> {
  return apiClient.get(`${BASE_URL}/${workflowId}/snapshots`);
}

/**
 * Get specific snapshot
 */
export async function getSnapshot(
  workflowId: string,
  snapshotId: string
): Promise<WorkflowSnapshot> {
  return apiClient.get(
    `${BASE_URL}/${workflowId}/snapshots/${snapshotId}`
  );
}

/**
 * Rollback to snapshot
 */
export async function rollback(
  workflowId: string,
  snapshotId: string,
  strategy: "full" | "partial" | "compensating" = "full",
  dryRun: boolean = false
): Promise<RollbackOperation> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/snapshots/${snapshotId}/rollback`,
    {
      strategy,
      dryRun,
    }
  );
}

/**
 * Delete snapshot
 */
export async function deleteSnapshot(workflowId: string, snapshotId: string): Promise<void> {
  return apiClient.delete(
    `${BASE_URL}/${workflowId}/snapshots/${snapshotId}`
  );
}

/**
 * Auto-snapshot configuration
 */
export async function configureAutoSnapshots(
  workflowId: string,
  config: {
    enabled: boolean;
    interval?: number;
    maxSnapshots?: number;
    retentionDays?: number;
  }
): Promise<void> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/snapshots/auto-config`,
    config
  );
}
