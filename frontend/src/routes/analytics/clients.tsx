/**
 * Client Analytics Route
 * Client profitability, engagement, and retention metrics
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
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

export function meta() {
  return createMeta({
    title: 'Client Analytics',
    description: 'Client profitability and engagement metrics',
  });
}

export async function loader() {
  return {
    metrics: {
      totalClients: 148,
      activeClients: 92,
      newClients: 12,
      avgClientValue: 87500,
      retentionRate: 94.2,
      avgLifetime: 3.7,
    },
  };
}

export default function ClientAnalyticsRoute() {
  const { metrics } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 365),
    end: new Date(),
    label: 'Last Year',
  });

  const topClientsByRevenue = [
    { client: 'TechCorp Inc', revenue: 845000, profit: 338000, margin: 40.0, cases: 24 },
    { client: 'Global Industries', revenue: 682000, profit: 258000, margin: 37.8, cases: 18 },
    { client: 'Innovate LLC', revenue: 534000, profit: 187000, margin: 35.0, cases: 22 },
    { client: 'Digital Ventures', revenue: 458000, profit: 164000, margin: 35.8, cases: 15 },
    { client: 'Enterprise Solutions', revenue: 392000, profit: 141000, margin: 36.0, cases: 12 },
  ];

  const clientByIndustry = [
    { industry: 'Technology', count: 42, revenue: 2845000, color: '#3B82F6' },
    { industry: 'Financial Services', count: 28, revenue: 1982000, color: '#10B981' },
    { industry: 'Healthcare', count: 24, revenue: 1645000, color: '#F59E0B' },
    { industry: 'Manufacturing', count: 18, revenue: 1234000, color: '#8B5CF6' },
    { industry: 'Real Estate', count: 15, revenue: 985000, color: '#EF4444' },
    { industry: 'Other', count: 21, revenue: 1456000, color: '#6B7280' },
  ];

  const clientBySize = [
    { size: 'Enterprise', count: 18, revenue: 3245000, avgValue: 180277 },
    { size: 'Large', count: 32, revenue: 2568000, avgValue: 80250 },
    { size: 'Medium', count: 48, revenue: 1845000, avgValue: 38437 },
    { size: 'Small', count: 50, revenue: 1124000, avgValue: 22480 },
  ];

  const clientEngagement = [
    { client: 'TechCorp Inc', satisfaction: 9.2, activeMatters: 8, totalMatters: 24 },
    { client: 'Global Industries', satisfaction: 8.8, activeMatters: 6, totalMatters: 18 },
    { client: 'Innovate LLC', satisfaction: 9.0, activeMatters: 7, totalMatters: 22 },
    { client: 'Digital Ventures', satisfaction: 8.5, activeMatters: 5, totalMatters: 15 },
    { client: 'Enterprise Solutions', satisfaction: 8.9, activeMatters: 4, totalMatters: 12 },
  ];

  const retentionTrend = [
    { cohort: '2020', retained: 35, lost: 3, rate: 92.1 },
    { cohort: '2021', retained: 42, lost: 4, rate: 91.3 },
    { cohort: '2022', retained: 48, lost: 2, rate: 96.0 },
    { cohort: '2023', retained: 52, lost: 3, rate: 94.5 },
    { cohort: '2024', retained: 58, lost: 2, rate: 96.7 },
  ];

  const clientProfitability = topClientsByRevenue.map(c => ({
    client: c.client,
    revenue: c.revenue,
    profit: c.profit,
    margin: c.margin,
  }));

  const metricsData = [
    {
      label: 'Total Clients',
      value: metrics.totalClients,
      format: 'number' as const,
      trend: { direction: 'up' as const, value: 8.2, period: 'last year' },
      icon: '👥',
      color: 'blue' as const,
    },
    {
      label: 'Active Clients',
      value: metrics.activeClients,
      format: 'number' as const,
      trend: { direction: 'up' as const, value: 5.7, period: 'last quarter' },
      icon: '✅',
      color: 'green' as const,
    },
    {
      label: 'New Clients',
      value: metrics.newClients,
      format: 'number' as const,
      trend: { direction: 'up' as const, value: 12.5, period: 'last quarter' },
      icon: '🆕',
      color: 'purple' as const,
    },
    {
      label: 'Avg Client Value',
      value: metrics.avgClientValue,
      format: 'currency' as const,
      trend: { direction: 'up' as const, value: 6.3, period: 'last year' },
      icon: '💰',
      color: 'yellow' as const,
    },
    {
      label: 'Retention Rate',
      value: metrics.retentionRate,
      format: 'percentage' as const,
      trend: { direction: 'up' as const, value: 1.2, period: 'last year' },
      icon: '🎯',
      color: 'green' as const,
    },
    {
      label: 'Avg Lifetime',
      value: metrics.avgLifetime,
      format: 'number' as const,
      unit: 'years',
      trend: { direction: 'up' as const, value: 0.3, period: 'last year' },
      icon: '⏳',
      color: 'blue' as const,
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
              Client Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Client profitability, engagement, and retention
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
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Clients by Revenue */}
        <ChartCard title="Top Clients by Revenue" subtitle="Highest revenue clients">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topClientsByRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="client" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Clients by Industry */}
        <ChartCard title="Clients by Industry" subtitle="Client distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={clientByIndustry}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ industry, count }: any) => `${industry} (${count})`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {clientByIndustry.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Profitability */}
        <ChartCard title="Client Profitability" subtitle="Revenue vs profit margin">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientProfitability}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="client" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" domain={[0, 50]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="profit" fill="#3B82F6" name="Profit ($)" />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#10B981" name="Margin %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Retention Trend */}
        <ChartCard title="Client Retention Trend" subtitle="Retention by cohort year">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={retentionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="cohort" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[85, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#8B5CF6" strokeWidth={2} name="Retention Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client by Size */}
        <ChartCard title="Clients by Size" subtitle="Distribution by company size">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientBySize}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="size" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#F59E0B" name="Count" />
              <Bar dataKey="avgValue" fill="#3B82F6" name="Avg Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Engagement */}
        <ChartCard title="Client Engagement" subtitle="Satisfaction and active matters">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="client" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="activeMatters" fill="#10B981" name="Active Matters" />
              <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#EF4444" name="Satisfaction" />
            </BarChart>
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
      title="Failed to Load Client Analytics"
      message="We couldn't load the client analytics data. Please try again."
      backTo="/analytics"
      backLabel="Back to Analytics"
    />
  );
}
