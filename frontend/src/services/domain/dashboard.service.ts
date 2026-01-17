// ================================================================================
// DASHBOARD DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → DashboardService → Frontend API → Backend
//
// PURPOSE:
//   - Dashboard widget management and configuration
//   - Real-time metrics and KPI aggregation
//   - User-specific dashboard customization
//
// USAGE:
//   Called by DashboardContext and route loaders.
//   Never called directly from view components.
//
// ================================================================================

/**
 * DashboardDomain - Dashboard widgets and metrics service
 * Provides dashboard configuration, widget management, and real-time metrics
 * ? Migrated to backend API (2025-12-21)
 */

import { api } from "@/api";
import { apiClient } from "@/services/infrastructure/api-client.service";
import { type TaskStatusBackend } from "@/types";
import { type Invoice } from "@/types/financial";

interface DashboardWidget {
  id: string;
  dashboardId: string;
  type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: unknown;
}

interface DashboardMetrics {
  activeCases: number;
  upcomingDeadlines: number;
  recentActivity: number;
  pendingTasks: number;
  utilizationRate: number;
  revenueThisMonth: number;
}

export const DashboardService = {
  getAll: async () => {
    return apiClient.get("/dashboards");
  },
  getById: async (id: string) => {
    return apiClient.get(`/dashboards/${id}`);
  },
  add: async (item: unknown) => {
    return apiClient.post("/dashboards", item);
  },
  update: async (id: string, updates: unknown) => {
    return apiClient.patch(`/dashboards/${id}`, updates);
  },
  delete: async (id: string) => {
    return apiClient.delete(`/dashboards/${id}`);
  },

  // Dashboard specific methods
  getWidgets: async (dashboardId: string): Promise<DashboardWidget[]> => {
    const dashboard = await apiClient.get<{ widgets?: DashboardWidget[] }>(
      `/dashboards/${dashboardId}`,
    );
    return dashboard?.widgets || [];
  },

  addWidget: async (
    dashboardId: string,
    widget: Partial<DashboardWidget>,
  ): Promise<DashboardWidget> => {
    return apiClient.post<DashboardWidget>(
      `/dashboards/${dashboardId}/widgets`,
      widget,
    );
  },

  removeWidget: async (widgetId: string): Promise<boolean> => {
    await apiClient.delete(`/dashboards/widgets/${widgetId}`);
    return true;
  },

  updateLayout: async (
    dashboardId: string,
    layout: unknown,
  ): Promise<unknown> => {
    return apiClient.patch(`/dashboards/${dashboardId}/layout`, { layout });
  },

  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).toISOString();

      const [stats, tasks, invoices, auditLogs] = await Promise.all([
        api.cases.getStats().catch(() => ({
          totalActive: 0,
          upcomingDeadlines: 0,
          utilizationRate: 0,
        })),
        api.tasks
          .getAll({ status: "Pending" as TaskStatusBackend })
          .catch(() => []),
        api.invoices
          .getAll({
            startDate: startOfMonth,
            endDate: endOfMonth,
          })
          .catch(() => []),
        apiClient
          .get<{ total: number }>("/audit/logs/count?period=recent")
          .catch(() => ({ total: 0 })),
      ]);

      const revenue = Array.isArray(invoices)
        ? invoices.reduce(
            (sum: number, inv: Invoice) => sum + (inv.totalAmount || 0),
            0,
          )
        : 0;

      return {
        activeCases: stats?.totalActive || 0,
        upcomingDeadlines: stats?.upcomingDeadlines || 0,
        recentActivity: auditLogs?.total || 0,
        pendingTasks: Array.isArray(tasks) ? tasks.length : 0,
        utilizationRate: stats?.utilizationRate || 0,
        revenueThisMonth: revenue,
      };
    } catch (error) {
      console.error(
        "[DashboardService.getMetrics] Error fetching metrics:",
        error,
      );
      return {
        activeCases: 0,
        upcomingDeadlines: 0,
        recentActivity: 0,
        pendingTasks: 0,
        utilizationRate: 0,
        revenueThisMonth: 0,
      };
    }
  },

  getStats: async () => {
    try {
      const [stats, motions, timeEntries] = await Promise.all([
        api.cases.getStats().catch(() => ({
          totalActive: 0,
          atRisk: 0,
        })),
        api.motions.getAll().catch(() => []),
        api.timeEntries.getAll({ billable: true }).catch(() => []),
      ]);

      const pendingMotions = Array.isArray(motions)
        ? motions.filter((m) => !["Decided", "Withdrawn"].includes(m.status))
            .length
        : 0;

      const billableHours = Array.isArray(timeEntries)
        ? timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
        : 0;

      return {
        activeCases: stats?.totalActive || 0,
        pendingMotions,
        billableHours,
        highRisks: stats?.atRisk || 0,
      };
    } catch (error) {
      console.error("[DashboardService.getStats] Error:", error);
      return {
        activeCases: 0,
        pendingMotions: 0,
        billableHours: 0,
        highRisks: 0,
      };
    }
  },

  getChartData: async () => {
    // Mock response until backend endpoint is implemented
    return [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 600 },
      { name: "Apr", value: 800 },
      { name: "May", value: 500 },
    ];
    // return apiClient.get("/dashboards/chart-data");
  },

  getRecentAlerts: async () => {
    // Mock response until backend endpoint is implemented
    return [];
    // return apiClient.get("/dashboards/alerts");
  },
};

// Export lowercase alias for compatibility
export const dashboardService = DashboardService;
