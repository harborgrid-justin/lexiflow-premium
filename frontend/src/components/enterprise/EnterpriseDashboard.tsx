/**
 * @module components/enterprise/EnterpriseDashboard
 * @category Enterprise Components
 * @description Comprehensive enterprise executive dashboard with KPIs, analytics, and real-time insights
 *
 * Features:
 * - Executive KPI cards (matters opened, revenue, billable hours, collection rate)
 * - Real-time activity feed
 * - Case pipeline visualization
 * - Team performance metrics
 * - Financial summary widgets
 * - Custom widget system
 */

import { ActivityFeed } from '@/components/dashboard/widgets/ActivityFeed';
import { ChartCard } from '@/components/dashboard/widgets/ChartCard';
import { KPICard } from '@/components/dashboard/widgets/KPICard';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import {
  Activity as ActivityIcon,
  AlertCircle,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  RefreshCw,
  Settings,
  Target,
  Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EnterpriseDashboardProps {
  /** User ID for personalized data */
  userId?: string;
  /** Date range for analytics */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Widget configuration handler */
  onConfigureWidgets?: () => void;
  /** Export handler */
  onExport?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface KPIMetric {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: typeof DollarSign;
  format: 'number' | 'currency' | 'percentage' | 'duration';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  target?: number;
}

interface CasePipelineStage {
  stage: string;
  count: number;
  value: number;
  color: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  billableHours: number;
  totalHours: number;
  utilizationRate: number;
  activeCases: number;
  revenue: number;
}

interface FinancialSummary {
  totalRevenue: number;
  collected: number;
  outstanding: number;
  writeOffs: number;
  realizationRate: number;
  collectionRate: number;
}

// ============================================================================
// DATA MAPPERS
// ============================================================================

const mapKPIs = (data?: DashboardKPIs): KPIMetric[] => {
  if (!data) return [];
  return [
    {
      id: 'matters-opened',
      label: 'Matters Opened',
      value: data.activeCases.value,
      previousValue: data.activeCases.previousValue,
      changePercentage: data.activeCases.change,
      trend: data.activeCases.trend,
      icon: Briefcase,
      format: 'number',
      color: 'blue',
      target: 50, // TODO: Fetch target from settings
    },
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: data.revenue.value,
      previousValue: data.revenue.previousValue,
      changePercentage: data.revenue.change,
      trend: data.revenue.trend,
      icon: DollarSign,
      format: 'currency',
      color: 'green',
      target: data.revenue.target,
    },
    {
      id: 'billable-hours',
      label: 'Billable Hours',
      value: data.billableHours.value,
      previousValue: data.billableHours.previousValue,
      changePercentage: data.billableHours.change,
      trend: data.billableHours.trend,
      icon: Clock,
      format: 'number',
      color: 'purple',
      target: data.billableHours.target,
    },
    {
      id: 'collection-rate',
      label: 'Collection Rate',
      value: data.collectionRate.value,
      previousValue: data.collectionRate.previousValue,
      changePercentage: data.collectionRate.change,
      icon: Target,
      format: 'percentage',
      color: 'orange',
      target: 90, // TODO: Fetch target from settings
    },
  ];
};

const mapCasePipeline = (data?: CaseStatusBreakdown[]): CasePipelineStage[] => {
  if (!data) return [];
  const colors = ['#94A3B8', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
  return data.map((item, index) => ({
    stage: item.status,
    count: item.count,
    value: 0, // Value not provided by breakdown endpoint, might need another call or update endpoint
    color: item.color || colors[index % colors.length],
  }));
};

const mapTeamPerformance = (data?: TeamMetrics[]): TeamMember[] => {
  if (!data) return [];
  return data.map((item) => ({
    id: item.userId,
    name: item.userName,
    role: 'Member', // Role not in TeamMetrics
    billableHours: item.billableHours,
    totalHours: 0, // Not in TeamMetrics
    utilizationRate: item.efficiency,
    activeCases: item.activeCases,
    revenue: 0, // Not in TeamMetrics
  }));
};

const mapRevenueData = (data?: BillingOverview[]) => {
  if (!data) return [];
  return data.map((item) => ({
    month: item.period,
    revenue: item.billed,
    target: 0, // Not in BillingOverview
    collected: item.collected,
  }));
};

const mapFinancialSummary = (data?: BillingOverview[]): FinancialSummary => {
  if (!data || data.length === 0) {
    return {
      totalRevenue: 0,
      collected: 0,
      outstanding: 0,
      writeOffs: 0,
      realizationRate: 0,
      collectionRate: 0,
    };
  }

  // Aggregate data
  const total = data.reduce(
    (acc, curr) => ({
      totalRevenue: acc.totalRevenue + curr.billed,
      collected: acc.collected + curr.collected,
      outstanding: acc.outstanding + curr.outstanding,
      writeOffs: acc.writeOffs + curr.writeOffs,
    }),
    { totalRevenue: 0, collected: 0, outstanding: 0, writeOffs: 0 }
  );

  return {
    ...total,
    realizationRate: total.totalRevenue ? ((total.totalRevenue - total.writeOffs) / total.totalRevenue) * 100 : 0,
    collectionRate: total.totalRevenue ? (total.collected / total.totalRevenue) * 100 : 0,
  };
};

const EmptyChart = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
    <span className="text-gray-400 text-sm">No data available</span>
  </div>
);

// ============================================================================
// COMPONENT
// ============================================================================

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  isLoading = false,
  error = null,
  onRefresh,
  onConfigureWidgets,
  onExport,
  className,
}) => {
  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Fetch data
  const { data: kpiData, isLoading: isKpiLoading } = useQuery(
    ['dashboard', 'kpis'],
    () => dashboardMetricsService.getKPIs()
  );

  const { data: activityData, isLoading: isActivityLoading } = useQuery(
    ['dashboard', 'activity'],
    () => dashboardMetricsService.getRecentActivity()
  );

  const { data: pipelineData, isLoading: isPipelineLoading } = useQuery(
    ['dashboard', 'pipeline'],
    () => dashboardMetricsService.getCaseStatusBreakdown()
  );

  const { data: teamData, isLoading: isTeamLoading } = useQuery(
    ['dashboard', 'team'],
    () => dashboardMetricsService.getTeamMetrics()
  );

  const { data: billingData, isLoading: isBillingLoading } = useQuery(
    ['dashboard', 'billing'],
    () => dashboardMetricsService.getBillingOverview()
  );

  // Map data
  const kpiMetrics = useMemo(() => mapKPIs(kpiData), [kpiData]);
  const activities = useMemo(() => activityData || [], [activityData]);
  const casePipeline = useMemo(() => mapCasePipeline(pipelineData), [pipelineData]);
  const teamPerformance = useMemo(() => mapTeamPerformance(teamData), [teamData]);
  const revenueData = useMemo(() => mapRevenueData(billingData), [billingData]);
  const financialSummary = useMemo(() => mapFinancialSummary(billingData), [billingData]);

  const isDataLoading = isLoading || isKpiLoading || isActivityLoading || isPipelineLoading || isTeamLoading || isBillingLoading;

  // Render error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
            Failed to Load Dashboard
          </h3>
          <p className={cn('text-sm mb-4', theme.text.secondary)}>{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={cn('text-3xl font-bold', theme.text.primary)}>
            Executive Dashboard
          </h1>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            Comprehensive business intelligence and performance insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {(['week', 'month', 'quarter', 'year'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                  selectedTimeframe === timeframe
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                {timeframe}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isLoading && 'animate-spin'
              )}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onConfigureWidgets && (
            <button
              onClick={onConfigureWidgets}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Configure widgets"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isDataLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))
        ) : kpiMetrics.length > 0 ? (
          kpiMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <KPICard
                label={metric.label}
                value={metric.value}
                previousValue={metric.previousValue}
                icon={metric.icon}
                format={metric.format}
                color={metric.color}
                isLoading={isLoading}
                target={metric.target}
              />
            </motion.div>
          ))
        ) : (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400"
              >
                No Data
              </div>
            ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Overview */}
          <ChartCard
            title="Revenue Overview"
            subtitle="Monthly revenue, target, and collections"
            icon={DollarSign}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              {revenueData.length > 0 ? (
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-700"
                  />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorCollected)"
                    name="Collected"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#F59E0B"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="Target"
                  />
                </AreaChart>
              ) : (
                <EmptyChart />
              )}
            </ResponsiveContainer>
          </ChartCard>

          {/* Case Pipeline */}
          <ChartCard
            title="Case Pipeline"
            subtitle="Cases by stage with total value"
            icon={BarChart3}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              {casePipeline.length > 0 ? (
                <BarChart data={casePipeline}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-700"
                  />
                  <XAxis dataKey="stage" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(
                      value: number | string | Array<number | string>,
                      name: string | number
                    ) => {
                      if (name === 'value' && typeof value === 'number') {
                        return [`$${(value / 1000).toFixed(0)}K`, 'Total Value'];
                      }
                      return [value, 'Cases'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Cases" radius={[8, 8, 0, 0]}>
                    {casePipeline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <EmptyChart />
              )}
            </ResponsiveContainer>
          </ChartCard>

          {/* Team Performance */}
          <ChartCard
            title="Team Performance"
            subtitle="Attorney utilization and billable hours"
            icon={Users}
            isLoading={isLoading}
            onRefresh={onRefresh}
            height={320}
          >
            <ResponsiveContainer width="100%" height="100%">
              {teamPerformance.length > 0 ? (
                <BarChart data={teamPerformance} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-700"
                  />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6b7280"
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="billableHours"
                    fill="#3B82F6"
                    name="Billable Hours"
                    radius={[0, 8, 8, 0]}
                  />
                  <Bar
                    dataKey="totalHours"
                    fill="#E5E7EB"
                    name="Total Hours"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              ) : (
                <EmptyChart />
              )}
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Right Column - Activity Feed & Widgets (1/3 width) */}
        <div className="space-y-6">
          {/* Financial Summary Widget */}
          <div className={cn('p-6 rounded-xl border', theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-lg font-semibold', theme.text.primary)}>Financial Summary</h3>
              <DollarSign className={cn('h-5 w-5', theme.text.secondary)} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm', theme.text.secondary)}>Total Revenue</span>
                  <span className={cn('text-lg font-bold text-emerald-600 dark:text-emerald-400')}>
                    ${(financialSummary.totalRevenue / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm', theme.text.secondary)}>Collected</span>
                  <span className={cn('text-sm font-medium', theme.text.primary)}>
                    ${(financialSummary.collected / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(financialSummary.collected / financialSummary.totalRevenue) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm', theme.text.secondary)}>Outstanding AR</span>
                  <span className={cn('text-sm font-medium text-orange-600 dark:text-orange-400')}>
                    ${(financialSummary.outstanding / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs', theme.text.secondary)}>Realization Rate</span>
                  <span className={cn('text-sm font-bold text-blue-600 dark:text-blue-400')}>
                    {financialSummary.realizationRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn('text-xs', theme.text.secondary)}>Collection Rate</span>
                  <span className={cn('text-sm font-bold text-purple-600 dark:text-purple-400')}>
                    {financialSummary.collectionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Activity Feed */}
          <div className={cn('p-6 rounded-xl border', theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-lg font-semibold', theme.text.primary)}>Recent Activity</h3>
              <ActivityIcon className={cn('h-5 w-5', theme.text.secondary)} />
            </div>
            <ActivityFeed
              activities={activities}
              isLoading={isLoading}
              maxItems={5}
              showAvatars={false}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className={cn('text-xs font-medium', theme.text.secondary)}>Win Rate</span>
              </div>
              <div className={cn('text-2xl font-bold text-emerald-600 dark:text-emerald-400')}>87.5%</div>
            </div>
            <div className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className={cn('text-xs font-medium', theme.text.secondary)}>Utilization</span>
              </div>
              <div className={cn('text-2xl font-bold text-blue-600 dark:text-blue-400')}>76.4%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EnterpriseDashboard.displayName = 'EnterpriseDashboard';
