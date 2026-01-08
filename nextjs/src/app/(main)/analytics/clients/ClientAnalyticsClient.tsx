'use client';

/**
 * Client Analytics Client Component
 * Interactive client analytics with charts and metrics
 *
 * @component
 */

import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { ChartCard } from '@/components/analytics/ChartCard';
import { MetricCard } from '@/components/analytics/MetricCard';
import type { ClientMetricsSummary, DateRange, MetricCardData } from '@/types/analytics-module';
import { useRouter } from 'next/navigation';
import * as React from 'react';
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
  XAxis,
  YAxis,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface ClientAnalyticsData {
  metrics: ClientMetricsSummary;
  topClientsByRevenue: Array<{
    client: string;
    revenue: number;
    profit: number;
    margin: number;
    cases: number;
  }>;
  clientByIndustry: Array<{
    industry: string;
    count: number;
    revenue: number;
    color: string;
  }>;
  clientBySize: Array<{
    size: string;
    count: number;
    revenue: number;
    avgValue: number;
  }>;
  clientEngagement: Array<{
    client: string;
    satisfaction: number;
    activeMatters: number;
    totalMatters: number;
  }>;
  retentionTrend: Array<{
    cohort: string;
    retained: number;
    lost: number;
    rate: number;
  }>;
}

interface ClientAnalyticsClientProps {
  data: ClientAnalyticsData;
}

// ============================================================================
// Component
// ============================================================================

export function ClientAnalyticsClient({ data }: ClientAnalyticsClientProps): React.JSX.Element {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last Year',
  });

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, [router]);

  const handleExport = React.useCallback(() => {
    console.log('Exporting client analytics...', { dateRange });
  }, [dateRange]);

  // Transform metrics to card data
  const metricsData: MetricCardData[] = [
    {
      label: 'Total Clients',
      value: data.metrics.totalClients,
      format: 'number',
      trend: { direction: 'up', value: 8.2, period: 'last year' },
      color: 'blue',
    },
    {
      label: 'Active Clients',
      value: data.metrics.activeClients,
      format: 'number',
      trend: { direction: 'up', value: 5.7, period: 'last quarter' },
      color: 'green',
    },
    {
      label: 'New Clients',
      value: data.metrics.newClients,
      format: 'number',
      trend: { direction: 'up', value: 12.5, period: 'last quarter' },
      color: 'purple',
    },
    {
      label: 'Avg Client Value',
      value: data.metrics.avgClientValue,
      format: 'currency',
      trend: { direction: 'up', value: 6.3, period: 'last year' },
      color: 'yellow',
    },
    {
      label: 'Retention Rate',
      value: data.metrics.retentionRate,
      format: 'percentage',
      trend: { direction: 'up', value: 1.2, period: 'last year' },
      color: 'green',
    },
    {
      label: 'Avg Lifetime',
      value: data.metrics.avgLifetime,
      format: 'number',
      unit: 'years',
      trend: { direction: 'up', value: 0.3, period: 'last year' },
      color: 'blue',
    },
  ];

  // Client profitability data
  const clientProfitability = data.topClientsByRevenue.map((c) => ({
    client: c.client,
    revenue: c.revenue,
    profit: c.profit,
    margin: c.margin,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        title="Client Analytics"
        subtitle="Client profitability, engagement, and retention"
        backHref="/analytics"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Clients by Revenue */}
        <ChartCard title="Top Clients by Revenue" subtitle="Highest revenue clients">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topClientsByRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="client"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Clients by Industry */}
        <ChartCard title="Clients by Industry" subtitle="Client distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.clientByIndustry}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ industry, count }) => `${industry} (${count})`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="industry"
              >
                {data.clientByIndustry.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, props) => [value, props.payload.industry]}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Profitability */}
        <ChartCard title="Client Profitability" subtitle="Revenue vs profit margin">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clientProfitability}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="client"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                className="text-xs"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs"
                domain={[0, 50]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="profit" fill="#3B82F6" name="Profit ($)" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="margin"
                stroke="#10B981"
                strokeWidth={2}
                name="Margin %"
                dot={{ fill: '#10B981' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Retention Trend */}
        <ChartCard title="Client Retention Trend" subtitle="Retention by cohort year">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.retentionTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="cohort" className="text-xs" />
              <YAxis className="text-xs" domain={[85, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention Rate']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="Retention Rate %"
                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client by Size */}
        <ChartCard title="Clients by Size" subtitle="Distribution by company size">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.clientBySize}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="size" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#F59E0B" name="Count" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="avgValue" fill="#3B82F6" name="Avg Value ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Client Engagement */}
        <ChartCard title="Client Engagement" subtitle="Satisfaction and active matters">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.clientEngagement}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="client"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="activeMatters" fill="#10B981" name="Active Matters" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="satisfaction"
                stroke="#EF4444"
                strokeWidth={2}
                name="Satisfaction"
                dot={{ fill: '#EF4444' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

ClientAnalyticsClient.displayName = 'ClientAnalyticsClient';
