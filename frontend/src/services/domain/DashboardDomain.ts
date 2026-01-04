/**
 * DashboardDomain - Dashboard widgets and metrics service
 * Provides dashboard configuration, widget management, and real-time metrics
 * ? Migrated to backend API (2025-12-21)
 */

import { api, isBackendApiEnabled } from "@/api";
import { TaskStatusBackend } from "@/types";
import { apiClient } from "@/services/infrastructure/apiClient";

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
    if (isBackendApiEnabled()) {
      return apiClient.get("/dashboards");
    }
    return [];
  },
  getById: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.get(`/dashboards/${id}`);
    }
    return undefined;
  },
  add: async (item: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.post("/dashboards", item);
    }
    throw new Error("Backend API required");
  },
  update: async (id: string, updates: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.patch(`/dashboards/${id}`, updates);
    }
    throw new Error("Backend API required");
  },
  delete: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.delete(`/dashboards/${id}`);
    }
    throw new Error("Backend API required");
  },

  // Dashboard specific methods
  getWidgets: async (dashboardId: string): Promise<DashboardWidget[]> => {
    if (isBackendApiEnabled()) {
      const dashboard = await apiClient.get<{ widgets?: DashboardWidget[] }>(
        `/dashboards/${dashboardId}`
      );
      return dashboard?.widgets || [];
    }
    return [];
  },

  addWidget: async (
    dashboardId: string,
    widget: Partial<DashboardWidget>
  ): Promise<DashboardWidget> => {
    if (isBackendApiEnabled()) {
      return apiClient.post<DashboardWidget>(
        `/dashboards/${dashboardId}/widgets`,
        widget
      );
    }
    throw new Error("Backend API required");
  },

  removeWidget: async (widgetId: string): Promise<boolean> => {
    if (isBackendApiEnabled()) {
      await apiClient.delete(`/dashboards/widgets/${widgetId}`);
      return true;
    }
    throw new Error("Backend API required");
  },

  updateLayout: async (
    dashboardId: string,
    layout: unknown
  ): Promise<unknown> => {
    if (isBackendApiEnabled()) {
      return apiClient.patch(`/dashboards/${dashboardId}/layout`, { layout });
    }
    throw new Error("Backend API required");
  },

  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString();

      const [stats, tasks, invoices, auditLogs] = await Promise.all([
        api.cases.getStats(),
        api.tasks.getAll({ status: "Pending" as TaskStatusBackend }),
        api.invoices.getAll({ startDate: startOfMonth, endDate: endOfMonth }),
        isBackendApiEnabled()
          ? apiClient.get<{ total: number }>("/audit/logs/count?period=recent")
          : Promise.resolve({ total: 0 }),
      ]);

      const revenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

      return {
        activeCases: stats.totalActive,
        upcomingDeadlines: stats.upcomingDeadlines,
        recentActivity: auditLogs.total,
        pendingTasks: tasks.length,
        utilizationRate: stats.utilizationRate,
        revenueThisMonth: revenue,
      };
    } catch (error) {
      console.error(
        "[DashboardService.getMetrics] Error fetching metrics:",
        error
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
    const stats = await api.cases.getStats();
    return {
      activeCases: stats.totalActive,
      pendingMotions: 0,
      billableHours: 0,
      highRisks: stats.atRisk,
    };
  },

  getChartData: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/dashboards/chart-data");
    }
    return [];
  },

  getRecentAlerts: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/dashboards/alerts");
    }
    return [];
  },
};
