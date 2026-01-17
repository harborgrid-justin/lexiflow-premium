/**
 * Versioning API
 * Feature 3: Workflow versioning with semantic versioning
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type {
  WorkflowVersion,
  WorkflowDiff,
  EnhancedWorkflowInstance,
} from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Create new workflow version
 */
export async function createVersion(
  workflowId: string,
  versionData: Partial<WorkflowVersion>
): Promise<WorkflowVersion> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/versions`,
    versionData
  );
}

/**
 * Get all versions for a workflow
 */
export async function getVersions(workflowId: string): Promise<WorkflowVersion[]> {
  return apiClient.get(`${BASE_URL}/${workflowId}/versions`);
}

/**
 * Get specific version
 */
export async function getVersion(
  workflowId: string,
  versionId: string
): Promise<WorkflowVersion> {
  return apiClient.get(`${BASE_URL}/${workflowId}/versions/${versionId}`);
}

/**
 * Compare two versions and generate diff
 */
export async function compareVersions(
  workflowId: string,
  versionA: string,
  versionB: string
): Promise<WorkflowDiff> {
  return apiClient.get(`${BASE_URL}/${workflowId}/versions/compare`, {
    params: { versionA, versionB },
  });
}

/**
 * Rollback to specific version
 */
export async function rollbackToVersion(
  workflowId: string,
  versionId: string
): Promise<EnhancedWorkflowInstance> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/versions/${versionId}/rollback`
  );
}

/**
 * Publish version
 */
export async function publishVersion(
  workflowId: string,
  versionId: string
): Promise<WorkflowVersion> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/versions/${versionId}/publish`
  );
}

/**
 * Deprecate version
 */
export async function deprecateVersion(
  workflowId: string,
  versionId: string,
  reason: string
): Promise<WorkflowVersion> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/versions/${versionId}/deprecate`,
    { reason }
  );
}
