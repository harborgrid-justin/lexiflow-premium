/**
 * @module features/dashboard/EnhancedDashboardOverview
 * @category Dashboard
 * @description Enhanced executive dashboard with comprehensive KPIs, charts, and widgets
 * Displays real-time metrics, activity feeds, deadlines, and analytics
 */

import {
  AlertCircle,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { LazyLoader } from '@/components/molecules/LazyLoader/LazyLoader';
import { CHART_COLORS } from '@/config/dashboard.config';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import { useDashboardOverview } from '../hooks/useDashboardOverview';

// Components

import { ActivityFeed, ChartCard, DeadlinesList, KPICard } from '../widgets';

// ============================================================================
// TYPES
// ============================================================================

interface EnhancedDashboardOverviewProps {
  /** Callback when a case is selected */
  onSelectCase?: (caseId: string) => void;
  /** User role for customization */
  userRole?: 'attorney' | 'paralegal' | 'admin' | 'partner';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EnhancedDashboardOverview({
  onSelectCase,
}: EnhancedDashboardOverviewProps) {
  const { theme, mode: _mode } = useTheme();

  const {
    kpis,
    caseBreakdown,
    billingData,
    activities,
    deadlines,
    isLoading,
    loadingState
  } = useDashboardOverview();

  if (isLoading) {
    return <LazyLoader message="Loading dashboard data..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Summary KPIs */}
      <div>
        <h2 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
          Executive Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            label="Active Cases"
            value={kpis?.activeCases.value || 0}
            previousValue={kpis?.activeCases.previousValue}
            icon={Briefcase}
            format="number"
            color="blue"
            trend={kpis?.activeCases.trend}
          />
          <KPICard
            label="Billable Hours"
            value={kpis?.billableHours.value || 0}
            previousValue={kpis?.billableHours.previousValue}
            target={kpis?.billableHours.target}
            icon={Clock}
            format="duration"
            color="purple"
            trend={kpis?.billableHours.trend}
          />
          <KPICard
            label="Revenue (MTD)"
            value={kpis?.revenue.value || 0}
            previousValue={kpis?.revenue.previousValue}
            target={kpis?.revenue.target}
            icon={DollarSign}
            format="currency"
            color="green"
            trend={kpis?.revenue.trend}
          />
          <KPICard
            label="Upcoming Deadlines"
            value={kpis?.upcomingDeadlines.value || 0}
            subtitle={`${kpis?.upcomingDeadlines.critical || 0} critical`}
            icon={Calendar}
            format="number"
            color="orange"
          />
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          label="Collection Rate"
          value={kpis?.collectionRate.value || 0}
          previousValue={kpis?.collectionRate.previousValue}
          icon={TrendingUp}
          format="percentage"
          color="green"
        />
        <KPICard
          label="Client Satisfaction"
          value={kpis?.clientSatisfaction.value || 0}
          previousValue={kpis?.clientSatisfaction.previousValue}
          icon={Target}
          format="percentage"
          color="blue"
        />
        <KPICard
          label="High Priority Items"
          value={kpis?.upcomingDeadlines.critical || 0}
          subtitle="Require immediate attention"
          icon={AlertCircle}
          format="number"
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Status Breakdown */}
        <ChartCard
          title="Case Status Distribution"
          subtitle="Current caseload by status"
          icon={Briefcase}
          isLoading={loadingState.cases}
          height={350}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={(caseBreakdown || []).map(item => ({ name: item.status, value: item.count }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(caseBreakdown || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Billing Overview */}
        <ChartCard
          title="Billing Overview"
          subtitle="Monthly billing trends"
          icon={DollarSign}
          isLoading={loadingState.billing}
          height={350}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={billingData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis
                dataKey="period"
                stroke={theme.colors.textMuted}
                style={{ fontSize: theme.typography.sizes.xs }}
              />
              <YAxis
                stroke={theme.colors.textMuted}
                style={{ fontSize: theme.typography.sizes.xs }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.text,
                }}
              />
              <Legend />
              <Bar dataKey="billed" fill={theme.colors.info} name="Billed" />
              <Bar dataKey="collected" fill={theme.colors.success} name="Collected" />
              <Bar dataKey="outstanding" fill={theme.colors.warning} name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Activity and Deadlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
              Recent Activity
            </h3>
            <a
              href="/activity"
              className={cn('text-sm font-medium hover:underline', theme.text.link)}
            >
              View All
            </a>
          </div>
          <ActivityFeed
            activities={activities || []}
            isLoading={loadingState.activities}
            maxItems={8}
            onActivityClick={(activity) => {
              if (activity.link) {
                window.location.href = activity.link;
              }
            }}
          />
        </div>

        {/* Upcoming Deadlines */}
        <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
              Upcoming Deadlines
            </h3>
            <a
              href="/deadlines"
              className={cn('text-sm font-medium hover:underline', theme.text.link)}
            >
              View All
            </a>
          </div>
          <DeadlinesList
            deadlines={deadlines || []}
            isLoading={loadingState.deadlines}
            maxItems={8}
            onDeadlineClick={(deadline) => {
              if (deadline.caseId && onSelectCase) {
                onSelectCase(deadline.caseId);
              }
            }}
          />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className={cn('rounded-xl border p-6', theme.surface.default, theme.border.default)}>
        <h3 className={cn('text-lg font-semibold mb-4', theme.text.primary)}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md',
              theme.border.default
            )}
            onClick={() => (window.location.href = '/cases/new')}
          >
            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className={cn('text-sm font-medium', theme.text.primary)}>New Case</span>
          </button>
          <button
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md',
              theme.border.default
            )}
            onClick={() => (window.location.href = '/time-entries/new')}
          >
            <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className={cn('text-sm font-medium', theme.text.primary)}>Log Time</span>
          </button>
          <button
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md',
              theme.border.default
            )}
            onClick={() => (window.location.href = '/clients')}
          >
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            <span className={cn('text-sm font-medium', theme.text.primary)}>Clients</span>
          </button>
          <button
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md',
              theme.border.default
            )}
            onClick={() => (window.location.href = '/reports')}
          >
            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <span className={cn('text-sm font-medium', theme.text.primary)}>Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

EnhancedDashboardOverview.displayName = 'EnhancedDashboardOverview';
