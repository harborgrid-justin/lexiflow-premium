/**
 * DashboardDomain - Placeholder implementation
 * TODO: Implement full domain service
 */

// Placeholder service - returns empty arrays/objects for compatibility
export const DashboardService = {
  getAll: async () => [],
  getById: async (id: string) => null,
  add: async (item: any) => item,
  update: async (id: string, updates: any) => updates,
  delete: async (id: string) => true,
  
  // Dashboard specific methods
  getWidgets: async (dashboardId: string) => [],
  addWidget: async (dashboardId: string, widget: any) => widget,
  removeWidget: async (widgetId: string) => true,
  updateLayout: async (dashboardId: string, layout: any) => layout,
  getMetrics: async () => ({}),
};
