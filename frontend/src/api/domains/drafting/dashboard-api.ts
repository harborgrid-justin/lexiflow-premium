/**
 * Dashboard API
 * Dashboard-specific endpoints for drafting module
 */

import { type ApiClient } from "@/services/infrastructure/api-client.service";

import type { GeneratedDocument, DraftingTemplate, DraftingStats } from "./types";

/**
 * Get recent drafts for dashboard
 */
export async function getRecentDrafts(
  client: ApiClient,
  limit: number = 5
): Promise<GeneratedDocument[]> {
  return client.get<GeneratedDocument[]>(
    `/drafting/recent-drafts?limit=${limit}`
  );
}

/**
 * Get templates for dashboard
 */
export async function getTemplates(
  client: ApiClient,
  limit: number = 10
): Promise<DraftingTemplate[]> {
  return client.get<DraftingTemplate[]>(`/drafting/templates?limit=${limit}`);
}

/**
 * Get pending approvals
 */
export async function getPendingApprovals(
  client: ApiClient
): Promise<GeneratedDocument[]> {
  return client.get<GeneratedDocument[]>("/drafting/approvals");
}

/**
 * Get drafting statistics
 */
export async function getStats(client: ApiClient): Promise<DraftingStats> {
  return client.get<DraftingStats>("/drafting/stats");
}
