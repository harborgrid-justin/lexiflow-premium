/**
 * @module features/dashboard/role-dashboards/AttorneyDashboard
 * @category Dashboard
 * @description Attorney-specific dashboard focused on billable hours, case deadlines, and workload
 */

import { type AttorneyDashboardData, dashboardMetricsService } from '@/api/intelligence/legacy-dashboard-metrics.service';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { ChartCard, DeadlinesList, KPICard, StatWidget } from '@/features/dashboard/widgets';
import { useQuery } from '@/hooks/useQueryHooks';
import { cn } from '@/shared/lib/cn';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { Briefcase, Calendar, Clock, FileText, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const AttorneyDashboard: React.FC = () => {
  const { theme, mode } = useTheme();

  const { data, isLoading } = useQuery<AttorneyDashboardData>(
    ['dashboard', 'attorney'],
    () => dashboardMetricsService.getRoleDashboard('attorney') as Promise<AttorneyDashboardData>
  );

  const { data: deadlines, isLoading: deadlinesLoading } = useQuery(
    ['dashboard', 'attorney-deadlines'],
    () => dashboardMetricsService.getUpcomingDeadlines({ days: 14, priority: ['high', 'critical'] })
  );

  if (isLoading) {
    return <LazyLoader message="Loading attorney dashboard..." />;
  }

  // Fallback if data is missing (e.g. API error or empty)
  const kpis = data?.kpis || {
    billableHours: { value: 0, previousValue: 0, target: 0 },
    activeCases: { value: 0, previousValue: 0 },
    utilizationRate: { value: 0, previousValue: 0 },
    upcomingDeadlines: { value: 0, subtitle: 'Next 2 weeks' },
  };

  const dailyBillableHours = data?.dailyBillableHours || [];

  return (
    <div className="space-y-6">
      {/* Attorney KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Billable Hours (Week)"
          value={kpis.billableHours.value}
          previousValue={kpis.billableHours.previousValue}
          target={kpis.billableHours.target}
          icon={Clock}
          format="duration"
          color="blue"
        />
        <KPICard
          label="Active Cases"
          value={kpis.activeCases.value}
          previousValue={kpis.activeCases.previousValue}
          icon={Briefcase}
          format="number"
          color="purple"
        />
        <KPICard
          label="Utilization Rate"
          value={kpis.utilizationRate.value}
          previousValue={kpis.utilizationRate.previousValue}
          icon={Target}
          format="percentage"
          color="green"
        />
        <KPICard
          label="Upcoming Deadlines"
          value={kpis.upcomingDeadlines.value}
          subtitle={kpis.upcomingDeadlines.subtitle}
          icon={Calendar}
          format="number"
          color="orange"
        />
      </div>

      {/* Billable Hours Chart */}
      <ChartCard
        title="Daily Billable Hours"
        subtitle="Current week performance"
        icon={Clock}
        height={300}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyBillableHours}>
            <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="day" stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={mode === 'dark' ? '#9ca3af' : '#6b7280'} />
            <Tooltip />
            <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Case Workload & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
          <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
            Case Workload
          </h3>
          <div className="space-y-3">
            <StatWidget label="Discovery Phase" value={5} icon={FileText} variant="info" />
            <StatWidget label="Trial Preparation" value={3} icon={Briefcase} variant="warning" />
            <StatWidget label="Settlement Negotiation" value={4} icon={TrendingUp} variant="success" />
          </div>
        </div>

        <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
          <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
            Priority Deadlines
          </h3>
          <DeadlinesList
            deadlines={deadlines || []}
            isLoading={deadlinesLoading}
            maxItems={5}
          />
        </div>
      </div>
    </div>
  );
};
