import { useQuery } from '@/hooks/useQueryHooks';
import { type AdminDashboardData, dashboardMetricsService } from '@/api/intelligence/legacy-dashboard-metrics.service';
import { DEFAULT_ADMIN_DASHBOARD_DATA } from '../constants/dashboardConstants';

export function useAdminDashboardData() {
  const { data, isLoading, error } = useQuery<AdminDashboardData>(
    ['dashboard', 'admin'],
    () => dashboardMetricsService.getRoleDashboard('admin') as Promise<AdminDashboardData>
  );

  const kpis = data?.kpis || DEFAULT_ADMIN_DASHBOARD_DATA.kpis;
  const userActivity = data?.userActivity || DEFAULT_ADMIN_DASHBOARD_DATA.userActivity;
  const systemStats = data?.systemStats || DEFAULT_ADMIN_DASHBOARD_DATA.systemStats;

  return {
    kpis,
    userActivity,
    systemStats,
    isLoading,
    error
  };
}
