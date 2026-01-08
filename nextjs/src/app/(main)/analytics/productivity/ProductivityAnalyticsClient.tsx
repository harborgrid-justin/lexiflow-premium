'use client';

/**
 * Productivity Analytics Client Component
 * Interactive productivity analytics with charts and metrics
 *
 * @component
 */

import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { ChartCard } from '@/components/analytics/ChartCard';
import { MetricCard } from '@/components/analytics/MetricCard';
import type { DateRange, MetricCardData, ProductivityMetricsSummary } from '@/types/analytics-module';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface ProductivityAnalyticsData {
  metrics: ProductivityMetricsSummary;
  utilizationTrend: Array<{
    week: string;
    billable: number;
    nonBillable: number;
    utilization: number;
  }>;
  attorneyPerformance: Array<{
    name: string;
    billable: number;
    nonBillable: number;
    utilization: number;
    cases: number;
    docs: number;
  }>;
  activityBreakdown: Array<{
    activity: string;
    hours: number;
    billable: boolean;
    percentage: number;
  }>;
  hourlyComparison: Array<{
    month: string;
    current: number;
    target: number;
    lastYear: number;
  }>;
}

interface ProductivityAnalyticsClientProps {
  data: ProductivityAnalyticsData;
}

// ============================================================================
// Component
// ============================================================================

export function ProductivityAnalyticsClient({
  data,
}: ProductivityAnalyticsClientProps): React.JSX.Element {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 Days',
  });

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, [router]);

  const handleExport = React.useCallback(() => {
    console.log('Exporting productivity analytics...', { dateRange });
  }, [dateRange]);

  // Transform metrics to card data
  const metricsData: MetricCardData[] = [
    {
      label: 'Total Hours',
      value: data.metrics.totalHours,
      format: 'number',
      trend: { direction: 'up', value: 5.2, period: 'last month' },
      color: 'blue',
    },
    {
      label: 'Billable Hours',
      value: data.metrics.billableHours,
      format: 'number',
      trend: { direction: 'up', value: 6.8, period: 'last month' },
      color: 'green',
    },
    {
      label: 'Utilization Rate',
      value: data.metrics.utilizationRate,
      format: 'percentage',
      trend: { direction: 'up', value: 2.5, period: 'last month' },
      color: 'purple',
    },
    {
      label: 'Avg Hours/Day',
      value: data.metrics.avgHoursPerDay,
      format: 'number',
      trend: { direction: 'neutral', value: 0.2, period: 'last month' },
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        title="Productivity Analytics"
        subtitle="Team utilization and performance metrics"
        backHref="/analytics"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Utilization Trend */}
        <ChartCard title="Utilization Trend" subtitle="Weekly billable vs non-billable hours">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.utilizationTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="billable" stackId="a" fill="#3B82F6" name="Billable" radius={[0, 0, 0, 0]} />
              <Bar yAxisId="left" dataKey="nonBillable" stackId="a" fill="#E5E7EB" name="Non-Billable" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="utilization"
                stroke="#10B981"
                strokeWidth={2}
                name="Utilization %"
                dot={{ fill: '#10B981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attorney Performance */}
        <ChartCard title="Attorney Performance" subtitle="Hours and utilization by attorney">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.attorneyPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" width={110} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="billable" fill="#8B5CF6" name="Billable Hours" />
              <Bar dataKey="nonBillable" fill="#D1D5DB" name="Non-Billable" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity Breakdown */}
        <ChartCard title="Activity Breakdown" subtitle="Time allocation by activity type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.activityBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="activity" type="category" width={130} className="text-xs" />
              <Tooltip
                formatter={(value: number, _name, props) => [
                  `${value} hrs`,
                  props.payload.billable ? 'Billable' : 'Non-Billable',
                ]}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="hours" name="Hours">
                {data.activityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.billable ? '#10B981' : '#9CA3AF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Year-over-Year Comparison */}
        <ChartCard title="Year-over-Year Comparison" subtitle="Current vs target vs last year">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.hourlyComparison}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: number) => [`${value} hours`, '']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Current Year"
                dot={{ fill: '#3B82F6' }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#F59E0B"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Target"
              />
              <Line
                type="monotone"
                dataKey="lastYear"
                stroke="#9CA3AF"
                strokeWidth={1}
                name="Last Year"
                dot={{ fill: '#9CA3AF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

ProductivityAnalyticsClient.displayName = 'ProductivityAnalyticsClient';
