/**
 * External Triggers API
 * Feature 10: Webhook and external integration triggers
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  ExternalTrigger,
  TriggerEvent,
} from "@/types/workflow-advanced-types";

const BASE_URL = "/workflow/advanced";

/**
 * Create external trigger
 */
export async function createExternalTrigger(
  workflowId: string,
  config: Partial<ExternalTrigger>
): Promise<ExternalTrigger> {
  return apiClient.post(`${BASE_URL}/${workflowId}/triggers`, config);
}

/**
 * Get external triggers
 */
export async function getExternalTriggers(
  workflowId: string
): Promise<ExternalTrigger[]> {
  return apiClient.get(`${BASE_URL}/${workflowId}/triggers`);
}

/**
 * Update external trigger
 */
export async function updateExternalTrigger(
  workflowId: string,
  triggerId: string,
  updates: Partial<ExternalTrigger>
): Promise<ExternalTrigger> {
  return apiClient.patch(
    `${BASE_URL}/${workflowId}/triggers/${triggerId}`,
    updates
  );
}

/**
 * Enable/disable external trigger
 */
export async function toggleExternalTrigger(
  workflowId: string,
  triggerId: string,
  enabled: boolean
): Promise<void> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/triggers/${triggerId}/toggle`,
    { enabled }
  );
}

/**
 * Test external trigger
 */
export async function testExternalTrigger(
  workflowId: string,
  triggerId: string,
  payload: Record<string, unknown>
): Promise<TriggerEvent> {
  return apiClient.post(
    `${BASE_URL}/${workflowId}/triggers/${triggerId}/test`,
    { payload }
  );
}

/**
 * Get trigger events
 */
export async function getTriggerEvents(
  workflowId: string,
  triggerId: string,
  limit: number = 50
): Promise<TriggerEvent[]> {
  return apiClient.get(
    `${BASE_URL}/${workflowId}/triggers/${triggerId}/events`,
    { params: { limit } }
  );
}

/**
 * Delete external trigger
 */
export async function deleteExternalTrigger(
  workflowId: string,
  triggerId: string
): Promise<void> {
  return apiClient.delete(`${BASE_URL}/${workflowId}/triggers/${triggerId}`);
}
