/**
 * Analytics Provider Types
 * Type definitions for analytics/reporting context
 *
 * @module lib/analytics/types
 */

import type { CaseMetrics, UserActivityMetrics } from "@/types/analytics";

export interface AnalyticsStateValue {
  caseMetrics: CaseMetrics | null;
  performanceMetrics: UserActivityMetrics | null;
  customReports: Array<{ id: string; name: string; data?: unknown }>;
  isLoading: boolean;
  error: Error | null;
  lastRefresh: string | null;
}

export interface AnalyticsActionsValue {
  loadCaseMetrics: (caseId?: string) => Promise<void>;
  loadPerformanceMetrics: (filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) => Promise<void>;
  loadCustomReport: (reportId: string) => Promise<unknown>;
  generateReport: (
    reportType: string,
    filters: Record<string, unknown>
  ) => Promise<unknown>;
  exportReport: (
    reportId: string,
    format: "csv" | "pdf" | "xlsx"
  ) => Promise<Blob>;
  refreshAnalytics: () => Promise<void>;
}

export interface AnalyticsProviderProps {
  children: React.ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number;
  caseId?: string;
}
