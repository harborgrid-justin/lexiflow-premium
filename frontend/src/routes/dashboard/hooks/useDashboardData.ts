import { useQuery } from "@/hooks/useQueryHooks";
import {
  type BillingStats,
  type DashboardAlert,
  dashboardService,
  type DashboardStats,
} from "@/services/domain/dashboard.service";
import { type WorkflowTask } from "@/types";
import { type ChartDataPoint } from "@/types/dashboard";

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  const result = useQuery<DashboardStats>(
    ["dashboard", "stats"],
    async () => {
      return dashboardService.getStats();
    },
    { staleTime: 300000 } // 5 minutes
  );

  return {
    stats: result.data || null,
    isLoading: result.status === "loading" || result.isFetching,
    error: result.error,
  };
}
/**
 * Hook to fetch billing overview stats for sidebar
 */
export function useBillingStats() {
  const result = useQuery<BillingStats>(
    ["billing", "overview"],
    () => dashboardService.getBillingStats(),
    {
      staleTime: 300000,
      initialData: { realization: 0, totalBilled: 0, month: "Current Month" },
    }
  );

  return {
    billingStats: result.data || {
      realization: 0,
      totalBilled: 0,
      month: "Current Month",
    },
    isLoading: result.status === "loading" || result.isFetching,
    error: result.error,
  };
}
/**
 * Hook to fetch dashboard tasks
 */
export function useDashboardTasks() {
  const result = useQuery<WorkflowTask[]>(
    ["dashboard", "tasks"],
    () => dashboardService.getTasks(),
    { staleTime: 60000 } // 1 minute
  );

  return {
    tasks: result.data || [],
    isLoading: result.status === "loading" || result.isFetching,
    error: result.error,
  };
}

/**
 * Hook to fetch dashboard chart data
 */
export function useDashboardCharts() {
  const result = useQuery<ChartDataPoint[]>(
    ["dashboard", "charts"],
    () => dashboardService.getChartData(),
    { staleTime: 300000 }
  );

  return {
    chartData: result.data || [],
    isLoading: result.status === "loading" || result.isFetching,
    error: result.error,
  };
}

/**
 * Hook to fetch recent dashboard alerts
 */
export function useDashboardAlerts() {
  const result = useQuery<DashboardAlert[]>(
    ["dashboard", "alerts"],
    () => dashboardService.getRecentAlerts(),
    { staleTime: 30000 } // 30 seconds
  );

  return {
    alerts: result.data || [],
    isLoading: result.status === "loading" || result.isFetching,
    error: result.error,
  };
}
