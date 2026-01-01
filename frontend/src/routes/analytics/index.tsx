/**
 * Analytics Route
 *
 * Business intelligence and analytics dashboard with:
 * - Server-side data loading via loader
 * - Performance metrics
 * - Trend analysis
 * - Custom report generation
 *
 * @module routes/analytics/index
 */

import {
  ChartCard,
  DateRangeSelector,
  MetricCard
} from '@/components/enterprise/analytics';
import type { MetricCardData } from '@/types/analytics-enterprise';
import { subDays } from 'date-fns';
import { Activity, DollarSign, FileText, Users } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ }: Route.MetaArgs) {
  return createMeta({
    title: 'Analytics Dashboard',
    description: 'Business intelligence, performance metrics, and trend analysis',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // Parse date range from URL
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "30d";

  // TODO: Replace with real API calls
  // For now, return mock data to demonstrate the dashboard
  return {
    period,
    metrics: {
      totalRevenue: 2847500,
      activeCases: 127,
      winRate: 87.5,
      avgCaseValue: 45200,
      billableHours: 3842,
      realizationRate: 92.3,
      collectionRate: 88.7,
      utilizationRate: 76.4,
    },
    trends: [],
    recentReports: [],
  };
}

// ============================================================================
// Component
// ============================================================================

export default function AnalyticsIndexRoute({ loaderData }: Route.ComponentProps) {
  const { metrics } = loaderData;

  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 Days',
  });
  const deferredDateRange = useDeferredValue(dateRange);

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 245000, target: 250000 },
    { month: 'Feb', revenue: 268000, target: 260000 },
    { month: 'Mar', revenue: 312000, target: 280000 },
    { month: 'Apr', revenue: 289000, target: 290000 },
    { month: 'May', revenue: 324000, target: 300000 },
    { month: 'Jun', revenue: 356000, target: 320000 },
  ];

  const caseStatusData = [
    { name: 'Active', value: 127, color: '#3B82F6' },
    { name: 'Won', value: 89, color: '#10B981' },
    { name: 'Settled', value: 45, color: '#F59E0B' },
    { name: 'Lost', value: 12, color: '#EF4444' },
  ];

  const productivityData = [
    { name: 'Sarah Chen', hours: 186, billable: 172, rate: 92.5 },
    { name: 'Michael Torres', hours: 178, billable: 165, rate: 92.7 },
    { name: 'Jessica Park', hours: 172, billable: 154, rate: 89.5 },
    { name: 'David Kim', hours: 165, billable: 148, rate: 89.7 },
    { name: 'Emily Davis', hours: 158, billable: 142, rate: 89.9 },
  ];

  const clientRevenueData = [
    { name: 'TechCorp Inc', revenue: 458000, cases: 12 },
    { name: 'Global Industries', revenue: 392000, cases: 8 },
    { name: 'Innovate LLC', revenue: 286000, cases: 15 },
    { name: 'Digital Ventures', revenue: 245000, cases: 9 },
    { name: 'Enterprise Solutions', revenue: 198000, cases: 6 },
  ];

  const metricsData: MetricCardData[] = [
    {
      label: 'Total Revenue',
      value: metrics.totalRevenue,
      format: 'currency',
      trend: { direction: 'up', value: 12.5, period: 'last month' },
      icon: '💰',
      color: 'green',
    },
    {
      label: 'Active Cases',
      value: metrics.activeCases,
      format: 'number',
      trend: { direction: 'up', value: 8.2, period: 'last month' },
      icon: '⚖️',
      color: 'blue',
    },
    {
      label: 'Win Rate',
      value: metrics.winRate,
      format: 'percentage',
      trend: { direction: 'up', value: 3.1, period: 'last quarter' },
      icon: '🏆',
      color: 'purple',
    },
    {
      label: 'Avg Case Value',
      value: metrics.avgCaseValue,
      format: 'currency',
      trend: { direction: 'down', value: -2.4, period: 'last month' },
      icon: '📊',
      color: 'yellow',
    },
    {
      label: 'Billable Hours',
      value: metrics.billableHours,
      format: 'number',
      trend: { direction: 'up', value: 5.8, period: 'last month' },
      icon: '⏱️',
      color: 'blue',
    },
    {
      label: 'Realization Rate',
      value: metrics.realizationRate,
      format: 'percentage',
      trend: { direction: 'up', value: 1.2, period: 'last quarter' },
      icon: '📈',
      color: 'green',
    },
    {
      label: 'Collection Rate',
      value: metrics.collectionRate,
      format: 'percentage',
      trend: { direction: 'down', value: -0.8, period: 'last month' },
      icon: '💳',
      color: 'red',
    },
    {
      label: 'Utilization Rate',
      value: metrics.utilizationRate,
      format: 'percentage',
      trend: { direction: 'up', value: 2.3, period: 'last month' },
      icon: '🎯',
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Comprehensive business intelligence and performance insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
          />

          <Link
            to="/reports"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" />
            Reports
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/analytics/cases"
          className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Case Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Outcomes & trends</p>
            </div>
          </div>
        </Link>

        <Link
          to="/analytics/billing"
          className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Billing Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue & AR</p>
            </div>
          </div>
        </Link>

        <Link
          to="/analytics/productivity"
          className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Productivity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team metrics</p>
            </div>
          </div>
        </Link>

        <Link
          to="/analytics/clients"
          className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Client Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profitability</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue vs target">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeDasharray="5 5"
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Case Status Distribution */}
        <ChartCard title="Case Status Distribution" subtitle="Current caseload breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={caseStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {caseStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attorney Productivity */}
        <ChartCard title="Attorney Productivity" subtitle="Top performers by billable hours">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productivityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="billable" fill="#3B82F6" name="Billable Hours" />
              <Bar dataKey="hours" fill="#E5E7EB" name="Total Hours" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Revenue */}
        <ChartCard title="Top Clients by Revenue" subtitle="YTD revenue performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Analytics"
      message="We couldn't load the analytics data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
