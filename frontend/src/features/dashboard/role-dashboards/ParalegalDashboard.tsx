/**
 * @module features/dashboard/role-dashboards/ParalegalDashboard
 * @category Dashboard
 * @description Paralegal-specific dashboard focused on task queue, document review, and support metrics
 */

import { dashboardMetricsService } from '@/api/intelligence/legacy-dashboard-metrics.service';
import { useTheme } from '@/features/theme';
import { ActivityFeed, KPICard, StatWidget } from '@/features/dashboard/widgets';
import { useQuery } from '@/hooks/useQueryHooks';
import { cn } from '@/shared/lib/cn';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react';
export const ParalegalDashboard: React.FC = () => {
  const { theme } = useTheme();

  const { isLoading } = useQuery(
    ['dashboard', 'paralegal'],
    () => dashboardMetricsService.getRoleDashboard('paralegal')
  );

  const { data: activities, isLoading: activitiesLoading } = useQuery(
    ['dashboard', 'paralegal-activity'],
    () => dashboardMetricsService.getRecentActivity(10)
  );

  if (isLoading) {
    return <LazyLoader message="Loading paralegal dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Paralegal KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Tasks Completed"
          value={28}
          previousValue={24}
          icon={CheckCircle2}
          format="number"
          color="green"
        />
        <KPICard
          label="Pending Tasks"
          value={15}
          subtitle="In your queue"
          icon={Clock}
          format="number"
          color="orange"
        />
        <KPICard
          label="Documents Reviewed"
          value={142}
          previousValue={128}
          icon={FileText}
          format="number"
          color="blue"
        />
        <KPICard
          label="High Priority"
          value={5}
          subtitle="Require attention"
          icon={AlertTriangle}
          format="number"
          color="red"
        />
      </div>

      {/* Task Queue & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
          <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
            Task Queue by Type
          </h3>
          <div className="space-y-3">
            <StatWidget label="Document Review" value={8} change="+3 today" changePositive={false} variant="info" />
            <StatWidget label="Court Filings" value={4} change="+1 today" changePositive={false} variant="warning" />
            <StatWidget label="Client Communication" value={3} change="No change" variant="default" />
          </div>
        </div>

        <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
          <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
            Recent Activity
          </h3>
          <ActivityFeed
            activities={activities || []}
            isLoading={activitiesLoading}
            maxItems={6}
          />
        </div>
      </div>
    </div>
  );
};
