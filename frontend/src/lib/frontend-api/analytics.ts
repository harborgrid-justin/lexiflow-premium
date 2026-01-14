/**
 * Analytics Frontend API
 * Enterprise-grade API layer for dashboards and analytics
 *
 * @module lib/frontend-api/analytics
 * @description Domain-level contract for analytics operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * Covers:
 * - Dashboard metrics and KPIs
 * - Case analytics and trends
 * - Revenue and billing analytics
 * - Team performance metrics
 * - Custom reports
 */

import {
  ApiError,
  client,
  type Result,
  success,
  ValidationError,
} from "./index";

export interface DashboardMetrics {
  totalCases: number;
  activeCases: number;
  upcomingDeadlines: number;
  recentActivity: number;
  revenue: number;
  billableHours: number;
}

export interface CaseAnalytics {
  caseId: string;
  title: string;
  status: string;
  daysOpen: number;
  billableHours: number;
  estimatedValue: number;
  actualValue?: number;
  profitMargin?: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  billableRevenue: number;
  unbilledAmount: number;
  profitMargin: number;
  topClients: Array<{
    clientId: string;
    clientName: string;
    revenue: number;
  }>;
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(): Promise<Result<DashboardMetrics>> {
  const result = await client.get<DashboardMetrics>("/analytics/dashboard");

  if (!result.ok) return result;

  return success(result.data);
}

/**
 * Get analytics for a specific case
 */
export async function getCaseAnalytics(
  caseId: string
): Promise<Result<CaseAnalytics>> {
  if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
    return {
      ok: false,
      error: new ValidationError(
        "Valid case ID is required"
      ) as unknown as ApiError,
    };
  }

  const result = await client.get<CaseAnalytics>(`/analytics/cases/${caseId}`);

  if (!result.ok) return result;

  return success(result.data);
}

/**
 * Get revenue analytics with optional filtering
 */
export async function getRevenueAnalytics(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<Result<RevenueAnalytics>> {
  const params: Record<string, string> = {};
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;

  const result = await client.get<RevenueAnalytics>("/analytics/revenue", {
    params,
  });

  if (!result.ok) return result;

  return success(result.data);
}

/**
 * Get team performance metrics
 */
export async function getTeamMetrics(): Promise<Result<unknown>> {
  const result = await client.get<unknown>("/analytics/team");

  if (!result.ok) return result;

  return success(result.data);
}

/**
 * Get custom report
 */
export async function getCustomReport(
  reportId: string
): Promise<Result<unknown>> {
  if (!reportId || typeof reportId !== "string" || reportId.trim() === "") {
    return {
      ok: false,
      error: new ValidationError(
        "Valid report ID is required"
      ) as unknown as ApiError,
    };
  }

  const result = await client.get<unknown>(`/analytics/reports/${reportId}`);

  if (!result.ok) return result;

  return success(result.data);
}

/**
 * Analytics API module
 */
export const analyticsApi = {
  getDashboardMetrics,
  getCaseAnalytics,
  getRevenueAnalytics,
  getTeamMetrics,
  getCustomReport,
} as const;
