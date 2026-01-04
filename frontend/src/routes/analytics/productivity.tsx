/**
 * Productivity Analytics Route
 * Attorney utilization, billable hours, and efficiency metrics
 */

import { ChartCard, DateRangeSelector, MetricCard } from '@/components/enterprise/analytics';
import { subDays } from 'date-fns';
import { ArrowLeft, Download } from 'lucide-react';
import { useState } from 'react';
import { Link, useLoaderData } from 'react-router';
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
  XAxis, YAxis
} from 'recharts';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

export function meta() {
  return createMeta({
    title: 'Productivity Analytics',
    description: 'Team utilization and performance metrics',
  });
}

export async function loader() {
  return {
    metrics: {
      totalHours: 3842,
      billableHours: 3285,
      utilizationRate: 85.5,
      avgHoursPerDay: 7.8,
      targetUtilization: 80,
    },
  };
}

export default function ProductivityAnalyticsRoute() {
  const { metrics } = useLoaderData<typeof loader>();

  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 Days',
  });

  const utilizationTrend = [
    { week: 'Week 1', billable: 172, nonBillable: 28, utilization: 86.0 },
    { week: 'Week 2', billable: 168, nonBillable: 32, utilization: 84.0 },
    { week: 'Week 3', billable: 175, nonBillable: 25, utilization: 87.5 },
    { week: 'Week 4', billable: 178, nonBillable: 22, utilization: 89.0 },
  ];

  const attorneyPerformance = [
    { name: 'Sarah Chen', billable: 186, nonBillable: 14, utilization: 93.0, cases: 12, docs: 45 },
    { name: 'Michael Torres', billable: 178, nonBillable: 22, utilization: 89.0, cases: 10, docs: 38 },
    { name: 'Jessica Park', billable: 172, nonBillable: 28, utilization: 86.0, cases: 11, docs: 42 },
    { name: 'David Kim', billable: 165, nonBillable: 35, utilization: 82.5, cases: 9, docs: 35 },
    { name: 'Emily Davis', billable: 158, nonBillable: 42, utilization: 79.0, cases: 8, docs: 32 },
  ];

  const activityBreakdown = [
    { activity: 'Client Meetings', hours: 485, billable: true, percentage: 12.6 },
    { activity: 'Research', hours: 892, billable: true, percentage: 23.2 },
    { activity: 'Document Drafting', hours: 1245, billable: true, percentage: 32.4 },
    { activity: 'Court Appearances', hours: 325, billable: true, percentage: 8.5 },
    { activity: 'Internal Meetings', hours: 285, billable: false, percentage: 7.4 },
    { activity: 'Administrative', hours: 195, billable: false, percentage: 5.1 },
    { activity: 'Business Development', hours: 168, billable: false, percentage: 4.4 },
    { activity: 'Training', hours: 247, billable: false, percentage: 6.4 },
  ];

  const hourlyComparison = [
    { month: 'Jan', current: 3650, target: 3500, lastYear: 3420 },
    { month: 'Feb', current: 3720, target: 3600, lastYear: 3485 },
    { month: 'Mar', current: 3890, target: 3700, lastYear: 3620 },
    { month: 'Apr', current: 3845, target: 3650, lastYear: 3580 },
    { month: 'May', current: 3920, target: 3750, lastYear: 3680 },
    { month: 'Jun', current: 4050, target: 3800, lastYear: 3750 },
  ];

  const metricsData = [
    {
      label: 'Total Hours',
      value: metrics.totalHours,
      format: 'number' as const,
      trend: { direction: 'up' as const, value: 5.2, period: 'last month' },
      icon: '⏱️',
      color: 'blue' as const,
    },
    {
      label: 'Billable Hours',
      value: metrics.billableHours,
      format: 'number' as const,
      trend: { direction: 'up' as const, value: 6.8, period: 'last month' },
      icon: '💼',
      color: 'green' as const,
    },
    {
      label: 'Utilization Rate',
      value: metrics.utilizationRate,
      format: 'percentage' as const,
      trend: { direction: 'up' as const, value: 2.5, period: 'last month' },
      icon: '📊',
      color: 'purple' as const,
    },
    {
      label: 'Avg Hours/Day',
      value: metrics.avgHoursPerDay,
      format: 'number' as const,
      trend: { direction: 'neutral' as const, value: 0.2, period: 'last month' },
      icon: '📅',
      color: 'yellow' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/analytics" className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Productivity Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Team utilization and performance metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Utilization Trend */}
        <ChartCard title="Utilization Trend" subtitle="Weekly billable vs non-billable hours">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={utilizationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="billable" stackId="a" fill="#3B82F6" name="Billable" />
              <Bar yAxisId="left" dataKey="nonBillable" stackId="a" fill="#E5E7EB" name="Non-Billable" />
              <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="#10B981" name="Utilization %" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attorney Performance */}
        <ChartCard title="Attorney Performance" subtitle="Hours and utilization by attorney">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attorneyPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="billable" fill="#8B5CF6" name="Billable Hours" />
              <Bar dataKey="nonBillable" fill="#D1D5DB" name="Non-Billable" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity Breakdown */}
        <ChartCard title="Activity Breakdown" subtitle="Time allocation by activity type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="activity" type="category" stroke="#6b7280" width={140} />
              <Tooltip />
              <Bar
                dataKey="hours"
                name="Hours"
              >
                {activityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.billable ? '#10B981' : '#9CA3AF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hourly Comparison */}
        <ChartCard title="Year-over-Year Comparison" subtitle="Current vs target vs last year">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#3B82F6" strokeWidth={2} name="Current Year" />
              <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeDasharray="5 5" name="Target" />
              <Line type="monotone" dataKey="lastYear" stroke="#9CA3AF" strokeWidth={1} name="Last Year" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Productivity Analytics"
      message="We couldn't load the productivity analytics data. Please try again."
      backTo="/analytics"
      backLabel="Back to Analytics"
    />
  );
}
