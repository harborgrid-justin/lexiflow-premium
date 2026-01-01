/**
 * @module features/dashboard/role-dashboards/AdminDashboard
 * @category Dashboard
 * @description Admin-specific dashboard focused on firm-wide metrics, user activity, and system health
 */

import React from 'react';
import { Users, Activity, Server, AlertCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useQuery } from '@/hooks/useQueryHooks';
import { dashboardMetricsService } from '@/services/api/dashboard-metrics.service';
import { KPICard, StatWidget, ChartCard } from '@/components/dashboard/widgets';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();

  const { data: roleDashboard, isLoading } = useQuery(
    ['dashboard', 'admin'],
    () => dashboardMetricsService.getRoleDashboard('admin')
  );

  if (isLoading) {
    return <LazyLoader message="Loading admin dashboard..." />;
  }

  const mockUserActivity = [
    { date: 'Mon', users: 45, actions: 320 },
    { date: 'Tue', users: 48, actions: 355 },
    { date: 'Wed', users: 52, actions: 402 },
    { date: 'Thu', users: 49, actions: 378 },
    { date: 'Fri', users: 51, actions: 395 },
  ];

  return (
    <div className="space-y-6">
      {/* Admin KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Total Users"
          value={52}
          previousValue={50}
          icon={Users}
          format="number"
          color="blue"
        />
        <KPICard
          label="Active Today"
          value={45}
          subtitle="86.5% of users"
          icon={Activity}
          format="number"
          color="green"
        />
        <KPICard
          label="System Health"
          value={99.8}
          previousValue={99.5}
          icon={Server}
          format="percentage"
          color="green"
        />
        <KPICard
          label="Open Issues"
          value={3}
          subtitle="2 critical"
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
          <LineChart data={mockUserActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="date" stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
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
          <StatWidget label="Total Cases" value={284} variant="info" />
          <StatWidget label="Documents Stored" value="12.4 GB" variant="info" />
          <StatWidget label="API Requests (24h)" value="45.2K" change="+12.3%" changePositive variant="success" />
        </div>
      </div>
    </div>
  );
};
