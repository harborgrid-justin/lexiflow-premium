/**
 * Analytics Frontend API
 * Domain contract for dashboards and analytics
 */

import { client, type Result, success } from "./index";

export interface DashboardMetrics {
  totalCases: number;
  activeCases: number;
  upcomingDeadlines: number;
  recentActivity: number;
  revenue: number;
  billableHours: number;
}

export async function getDashboardMetrics(): Promise<Result<DashboardMetrics>> {
  const result = await client.get<DashboardMetrics>("/analytics/dashboard");

  if (!result.ok) return result;

  return success(result.data);
}

export async function getCaseAnalytics(
  caseId: string
): Promise<Result<unknown>> {
  const result = await client.get<unknown>(`/analytics/cases/${caseId}`);

  if (!result.ok) return result;

  return success(result.data);
}

export async function getRevenueAnalytics(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<Result<unknown>> {
  const params = filters || {};
  const result = await client.get<unknown>("/analytics/revenue", { params });

  if (!result.ok) return result;

  return success(result.data);
}

export const analyticsApi = {
  getDashboardMetrics,
  getCaseAnalytics,
  getRevenueAnalytics,
};
