/**
 * Custom hook for Case Analytics Dashboard data
 * Extracts data fetching logic from component per enterprise architecture
 *
 * @module routes/cases/hooks/useCaseAnalytics
 */

import { useMemo } from "react";

import { api } from "@/api";
import { useQuery } from "@/hooks/useQueryHooks";
import { CaseStatus } from "@/types";

export type DateRange = "7d" | "30d" | "90d" | "ytd" | "all";

type CaseSummary = {
  createdAt?: string;
  updatedAt?: string;
  practiceArea?: string;
  status?: CaseStatus;
};

type TimeEntrySummary = {
  duration?: number;
};

type InvoiceSummary = {
  createdAt?: string;
  totalAmount?: number;
};

export interface CaseAnalyticsData {
  matters: CaseSummary[];
  timeEntries: TimeEntrySummary[];
  invoices: InvoiceSummary[];
  metrics: {
    totalMatters: number;
    revenue: number;
    avgResolution: number;
    utilization: number;
  };
  isLoading: boolean;
}

export function useCaseAnalytics(
  caseId?: string,
  dateRange: DateRange = "30d",
  practiceAreaFilter: string = "all",
): CaseAnalyticsData {
  // Fetch matters data
  const { data: matters = [], isLoading: loadingMatters } = useQuery(
    ["matters", "all", caseId],
    () =>
      caseId ? api.cases.getById(caseId).then((c) => [c]) : api.cases.getAll(),
  );

  // Fetch time entries for revenue calculation
  const { data: timeEntries = [], isLoading: loadingTime } = useQuery(
    ["billing", "time-entries"],
    () => api.billing.getTimeEntries(),
  );

  // Fetch invoices for revenue data
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery(
    ["billing", "invoices"],
    () => api.billing.getInvoices(),
  );

  // Calculate analytics metrics
  const metrics = useMemo(() => {
    if (!matters.length)
      return { totalMatters: 0, revenue: 0, avgResolution: 0, utilization: 0 };

    const now = new Date();
    const cutoffDate = new Date();
    if (dateRange === "7d") cutoffDate.setDate(now.getDate() - 7);
    else if (dateRange === "30d") cutoffDate.setDate(now.getDate() - 30);
    else if (dateRange === "90d") cutoffDate.setDate(now.getDate() - 90);
    else if (dateRange === "ytd") cutoffDate.setMonth(0, 1);

    const filteredMatters = matters.filter(
      (m) =>
        m.createdAt &&
        new Date(m.createdAt) >= cutoffDate &&
        (practiceAreaFilter === "all" || m.practiceArea === practiceAreaFilter),
    );

    const totalRevenue = invoices
      .filter(
        (inv) =>
          (inv as { createdAt?: string }).createdAt &&
          new Date((inv as { createdAt: string }).createdAt) >= cutoffDate,
      )
      .reduce(
        (sum: number, inv) =>
          sum + ((inv as { totalAmount?: number }).totalAmount || 0),
        0,
      );

    const closedMatters = filteredMatters.filter(
      (m) => m.status === CaseStatus.Closed,
    );
    const avgResolution =
      closedMatters.length > 0
        ? Math.round(
            closedMatters.reduce((sum, m) => {
              if (!m.createdAt || !m.updatedAt) return sum;
              const created = new Date(m.createdAt);
              const closed = new Date(m.updatedAt);
              return (
                sum +
                (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
              );
            }, 0) / closedMatters.length,
          )
        : 0;

    const totalHours = timeEntries.reduce(
      (sum, t) => sum + (t.duration || 0),
      0,
    );
    const utilization =
      totalHours > 0
        ? Math.round((totalHours / (filteredMatters.length * 160)) * 100)
        : 0;

    return {
      totalMatters: filteredMatters.length,
      revenue: totalRevenue,
      avgResolution,
      utilization,
    };
  }, [matters, timeEntries, invoices, dateRange, practiceAreaFilter]);

  return {
    matters,
    timeEntries,
    invoices,
    metrics,
    isLoading: loadingMatters || loadingTime || loadingInvoices,
  };
}
