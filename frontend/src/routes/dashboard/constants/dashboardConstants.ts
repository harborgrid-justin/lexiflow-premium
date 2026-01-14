export const DEFAULT_ADMIN_DASHBOARD_DATA = {
    kpis: {
      totalUsers: { value: 0, previousValue: 0 },
      activeUsers: { value: 0, subtitle: '0% of users' },
      systemHealth: { value: 100, previousValue: 100 },
      openIssues: { value: 0, subtitle: '0 critical' },
    },
    userActivity: [],
    systemStats: {
      storageUsage: { value: 0, total: 100, unit: 'TB' },
      apiLatency: { value: 0, unit: 'ms' },
      errorRate: { value: 0, unit: '%' },
    }
  };
