/**
 * DashboardDomain - Dashboard widgets and metrics service
 * Provides dashboard configuration, widget management, and real-time metrics
 * ? Migrated to backend API (2025-12-21)
 */

import { analyticsApi } from '@/api/domains/analytics.api';
import { delay } from '@/utils/async';
import { STORES, db } from '@/services/data/db';

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
  getAll: async () => db.getAll(STORES.DASHBOARDS),
  getById: async (id: string) => db.get(STORES.DASHBOARDS, id),
  add: async (item: unknown) => db.put(STORES.DASHBOARDS, item),
  update: async (id: string, updates: unknown) => {
    const existing = await db.get(STORES.DASHBOARDS, id);
    return db.put(STORES.DASHBOARDS, {
      ...(existing && typeof existing === 'object' ? existing : {}),
      ...(updates && typeof updates === 'object' ? updates : {}),
      updatedAt: new Date().toISOString()
    });
  },
  delete: async (id: string) => db.delete(STORES.DASHBOARDS, id),
  
  // Dashboard specific methods
  getWidgets: async (dashboardId: string): Promise<DashboardWidget[]> => {
    const dashboard = await db.get<{ widgets?: DashboardWidget[] }>(STORES.DASHBOARDS, dashboardId);
    return dashboard?.widgets || [];
  },
  
  addWidget: async (dashboardId: string, widget: Partial<DashboardWidget>): Promise<DashboardWidget> => {
    const dashboard = await db.get<{ widgets?: DashboardWidget[] }>(STORES.DASHBOARDS, dashboardId);
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      dashboardId,
      type: widget.type || 'metric',
      title: widget.title || 'New Widget',
      position: widget.position || { x: 0, y: 0, w: 4, h: 2 },
      config: widget.config || {},
    };
    const updatedWidgets = [...(dashboard?.widgets || []), newWidget];
    await db.put(STORES.DASHBOARDS, {
      ...(dashboard && typeof dashboard === 'object' ? dashboard : {}),
      widgets: updatedWidgets
    });
    return newWidget;
  },
  
  removeWidget: async (widgetId: string): Promise<boolean> => {
    const dashboards = await db.getAll<{ id: string; widgets?: DashboardWidget[] }>(STORES.DASHBOARDS);
    for (const dashboard of dashboards) {
      if (dashboard?.widgets?.some((w: DashboardWidget) => w.id === widgetId)) {
        const updatedWidgets = dashboard.widgets.filter((w: DashboardWidget) => w.id !== widgetId);
        await db.put(STORES.DASHBOARDS, {
          ...(dashboard && typeof dashboard === 'object' ? dashboard : {}),
          widgets: updatedWidgets
        });
        return true;
      }
    }
    return false;
  },
  
  updateLayout: async (dashboardId: string, layout: unknown): Promise<unknown> => {
    const dashboard = await db.get(STORES.DASHBOARDS, dashboardId);
    const updated = {
      ...(dashboard && typeof dashboard === 'object' ? dashboard : {}),
      layout,
      updatedAt: new Date().toISOString()
    };
    await db.put(STORES.DASHBOARDS, updated);
    return updated;
  },
  
  getMetrics: async (): Promise<DashboardMetrics> => {
    await delay(100); // Simulate calculation time
    const cases = await db.getAll<{ status?: string; upcomingDeadlines?: any[] }>(STORES.CASES);
    const tasks = await db.getAll<{ status?: string }>(STORES.TASKS);
    const timeEntries = await db.getAll<{ date?: string }>(STORES.TIME_ENTRIES);

    return {
      activeCases: cases.filter((c) => c?.status === 'Active').length,
      upcomingDeadlines: cases.reduce((sum: number, c) => sum + (c?.upcomingDeadlines?.length || 0), 0),
      recentActivity: timeEntries.filter((t) => {
        if (!t?.date) return false;
        const date = new Date(t.date);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return date > dayAgo;
      }).length,
      pendingTasks: tasks.filter((t) => t?.status === 'Pending').length,
      utilizationRate: 0.78, // Mock calculation
      revenueThisMonth: 125000, // Mock calculation
    };
  },
};
