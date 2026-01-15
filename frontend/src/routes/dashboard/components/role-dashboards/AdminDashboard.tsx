/**
 * @module features/dashboard/role-dashboards/AdminDashboard
 * @category Dashboard
 * @description Admin-specific dashboard focused on firm-wide metrics, user activity, and system health
 */

import { type AdminDashboardData, dashboardMetricsService } from '@/lib/frontend-api';
import { useTheme } from "@/hooks/useTheme";
import { ChartCard, KPICard, StatWidget } from '../../widgets';
import { useQuery } from '@/hooks/useQueryHooks';
import { cn } from '@/lib/cn';
import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';
import { Activity, AlertCircle, Server, Users } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { theme, mode } = useTheme();

  const { data, isLoading } = useQuery<AdminDashboardData>(
    ['dashboard', 'admin'],
    () => dashboardMetricsService.getRoleDashboard('admin') as Promise<AdminDashboardData>
  );

  if (isLoading) {
    return <LazyLoader message="Loading admin dashboard..." />;
  }

  // Fallback data
  const kpis = data?.kpis || {
    totalUsers: { value: 0, previousValue: 0 },
    activeUsers: { value: 0, subtitle: '0% of users' },
    systemHealth: { value: 100, previousValue: 100 },
    openIssues: { value: 0, subtitle: '0 critical' },
  };

  const userActivity = data?.userActivity || [];
  const systemStats = data?.systemStats || {
    storageUsage: { value: 0, total: 100, unit: 'TB' },
    apiLatency: { value: 0, unit: 'ms' },
    errorRate: { value: 0, unit: '%' },
  };

  return (
    <div className="space-y-6">
      {/* Admin KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Total Users"
          value={kpis.totalUsers.value}
          previousValue={kpis.totalUsers.previousValue}
          icon={Users}
          format="number"
          color="blue"
        />
        <KPICard
          label="Active Today"
          value={kpis.activeUsers.value}
          subtitle={kpis.activeUsers.subtitle}
          icon={Activity}
          format="number"
          color="green"
        />
        <KPICard
          label="System Health"
          value={kpis.systemHealth.value}
          previousValue={kpis.systemHealth.previousValue}
          icon={Server}
          format="percentage"
          color="green"
        />
        <KPICard
          label="Open Issues"
          value={kpis.openIssues.value}
          subtitle={kpis.openIssues.subtitle}
          icon={AlertCircle}
          format="number"
          color="orange"
        />
      </div>

      {/* User Activity Chart */}
      <ChartCard
        title="User Activity Trends"
        subtitle="Daily active users and actions"
        icon={Activity}
        height={300}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={userActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="date" stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Active Users" strokeWidth={2} />
            <Line type="monotone" dataKey="actions" stroke="#10b981" name="Total Actions" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* System Stats */}
      <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
        <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
          System Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatWidget
            label="Storage Usage"
            value={`${systemStats.storageUsage.value} ${systemStats.storageUsage.unit}`}
            variant="info"
          />
          <StatWidget
            label="API Latency"
            value={`${systemStats.apiLatency.value} ${systemStats.apiLatency.unit}`}
            variant={systemStats.apiLatency.value < 200 ? "success" : "warning"}
          />
          <StatWidget
            label="Error Rate"
            value={`${systemStats.errorRate.value}${systemStats.errorRate.unit}`}
            variant={systemStats.errorRate.value < 1 ? "success" : "danger"}
          />
        </div>
      </div>
    </div>
  );
};
