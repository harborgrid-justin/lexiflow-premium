/**
 * SLA Monitoring API
 * Feature 5: SLA monitoring dashboard
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { SLAConfig, SLAStatus } from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Create SLA configuration for workflow
 */
export async function createSLA(
  workflowId: string,
  config: Partial<SLAConfig>
): Promise<SLAConfig> {
  return apiClient.post(`${BASE_URL}/${workflowId}/sla`, config);
}

/**
 * Get SLA configurations
 */
export async function getSLAConfigs(workflowId: string): Promise<SLAConfig[]> {
  return apiClient.get(`${BASE_URL}/${workflowId}/sla`);
}

/**
 * Calculate SLA status for a node
 */
export async function calculateSLAStatus(
  workflowId: string,
  nodeId: string,
  slaConfigId: string
): Promise<SLAStatus> {
  return apiClient.get(
    `${BASE_URL}/${workflowId}/sla/${slaConfigId}/status/${nodeId}`
  );
}

/**
 * Get SLA dashboard metrics
 */
export async function getSLADashboard(workflowId: string): Promise<{
  totalNodes: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  complianceRate: number;
  activeEscalations: number;
  slaStatuses: SLAStatus[];
}> {
  return apiClient.get(`${BASE_URL}/${workflowId}/sla/dashboard`);
}

/**
 * Pause SLA tracking
 */
export async function pauseSLA(
  workflowId: string,
  nodeId: string,
  reason: string
): Promise<void> {
  return apiClient.post(`${BASE_URL}/${workflowId}/sla/pause/${nodeId}`, {
    reason,
  });
}

/**
 * Resume SLA tracking
 */
export async function resumeSLA(workflowId: string, nodeId: string): Promise<void> {
  return apiClient.post(`${BASE_URL}/${workflowId}/sla/resume/${nodeId}`);
}
