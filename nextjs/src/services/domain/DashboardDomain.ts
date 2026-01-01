/**
 * DashboardDomain - Dashboard widgets and metrics service
 * Provides dashboard configuration, widget management, and real-time metrics
 * ? Migrated to backend API (2025-12-21)
 */

import { api } from '@/api';
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
    const stats = await api.cases.getStats();
    return {
      activeCases: stats.totalActive,
      upcomingDeadlines: stats.upcomingDeadlines,
      recentActivity: 0,
      pendingTasks: 0,
      utilizationRate: stats.utilizationRate,
      revenueThisMonth: 0,
    };
  },

  getStats: async () => {
    const stats = await api.cases.getStats();
    return {
      activeCases: stats.totalActive,
      pendingMotions: 0,
      billableHours: 0,
      highRisks: stats.atRisk
    };
  },

  getChartData: async () => {
    return [
      { name: 'Jan', value: 400 },
      { name: 'Feb', value: 300 },
      { name: 'Mar', value: 600 },
      { name: 'Apr', value: 800 },
      { name: 'May', value: 500 }
    ];
  },

  getRecentAlerts: async () => {
    // Generate ISO timestamps for 2 and 4 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    
    return [
      { id: 1, message: 'New Case Assigned', detail: 'Smith v. Jones', time: twoHoursAgo, caseId: '550e8400-e29b-41d4-a716-446655440000' },
      { id: 2, message: 'Deadline Approaching', detail: 'Motion to Dismiss', time: fourHoursAgo, caseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' }
    ];
  }
};
