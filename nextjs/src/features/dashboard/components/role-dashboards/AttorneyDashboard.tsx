/**
 * @module features/dashboard/role-dashboards/AttorneyDashboard
 * @category Dashboard
 * @description Attorney-specific dashboard focused on billable hours, case deadlines, and workload
 */

import React from 'react';
import { Clock, Briefcase, Target, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import { useQuery } from '@/hooks/useQueryHooks';
import { dashboardMetricsService } from '@/services/api/dashboard-metrics.service';
import { KPICard, StatWidget, ChartCard, DeadlinesList } from '@/components/dashboard/widgets';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AttorneyDashboard: React.FC = () => {
  const { theme } = useTheme();

  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard', 'attorney'],
    () => dashboardMetricsService.getRoleDashboard('attorney')
  );

  const { data: deadlines, isLoading: deadlinesLoading } = useQuery(
    ['dashboard', 'attorney-deadlines'],
    () => dashboardMetricsService.getUpcomingDeadlines({ days: 14, priority: ['high', 'critical'] })
  );

  if (isLoading) {
    return <LazyLoader message="Loading attorney dashboard..." />;
  }

  const mockHoursData = [
    { day: 'Mon', hours: 8.5 },
    { day: 'Tue', hours: 7.2 },
    { day: 'Wed', hours: 9.1 },
    { day: 'Thu', hours: 6.8 },
    { day: 'Fri', hours: 8.3 },
  ];

  return (
    <div className="space-y-6">
      {/* Attorney KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Billable Hours (Week)"
          value={39.9}
          previousValue={35.2}
          target={40}
          icon={Clock}
          format="duration"
          color="blue"
        />
        <KPICard
          label="Active Cases"
          value={12}
          previousValue={11}
          icon={Briefcase}
          format="number"
          color="purple"
        />
        <KPICard
          label="Utilization Rate"
          value={87.5}
          previousValue={82.1}
          icon={Target}
          format="percentage"
          color="green"
        />
        <KPICard
          label="Upcoming Deadlines"
          value={8}
          subtitle="Next 2 weeks"
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
          <BarChart data={mockHoursData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="day" stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={theme.theme === 'dark' ? '#9ca3af' : '#6b7280'} />
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
