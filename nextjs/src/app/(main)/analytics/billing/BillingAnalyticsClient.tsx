'use client';

/**
 * Billing Analytics Client Component
 * Interactive billing analytics with charts and metrics
 *
 * @component
 */

import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { ChartCard } from '@/components/analytics/ChartCard';
import { MetricCard } from '@/components/analytics/MetricCard';
import type { BillingMetricsSummary, DateRange, MetricCardData } from '@/types/analytics-module';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface BillingAnalyticsData {
  metrics: BillingMetricsSummary;
  revenueTrend: Array<{
    month: string;
    revenue: number;
    collected: number;
    billed: number;
    outstanding: number;
  }>;
  revenueByPracticeArea: Array<{
    area: string;
    revenue: number;
    hours: number;
    avgRate: number;
  }>;
  arAging: Array<{
    range: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  topBillingAttorneys: Array<{
    name: string;
    revenue: number;
    hours: number;
    rate: number;
    realization: number;
  }>;
  wipByAttorney: Array<{
    name: string;
    amount: number;
    hours: number;
  }>;
  collectionRateByClient: Array<{
    client: string;
    billed: number;
    collected: number;
    rate: number;
  }>;
}

interface BillingAnalyticsClientProps {
  data: BillingAnalyticsData;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// ============================================================================
// Component
// ============================================================================

export function BillingAnalyticsClient({ data }: BillingAnalyticsClientProps): React.JSX.Element {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 90 Days',
  });

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, [router]);

  const handleExport = React.useCallback(() => {
    console.log('Exporting billing analytics...', { dateRange });
  }, [dateRange]);

  // Transform metrics to card data
  const metricsData: MetricCardData[] = [
    {
      label: 'Total Revenue',
      value: data.metrics.totalRevenue,
      format: 'currency',
      trend: { direction: 'up', value: 12.5, period: 'last quarter' },
      color: 'green',
    },
    {
      label: 'Collected Revenue',
      value: data.metrics.collectedRevenue,
      format: 'currency',
      trend: { direction: 'up', value: 9.8, period: 'last quarter' },
      color: 'blue',
    },
    {
      label: 'Outstanding A/R',
      value: data.metrics.outstandingAR,
      format: 'currency',
      trend: { direction: 'down', value: -5.2, period: 'last month' },
      color: 'yellow',
    },
    {
      label: 'Realization Rate',
      value: data.metrics.realizationRate,
      format: 'percentage',
      trend: { direction: 'up', value: 1.8, period: 'last quarter' },
      color: 'purple',
    },
    {
      label: 'Collection Rate',
      value: data.metrics.collectionRate,
      format: 'percentage',
      trend: { direction: 'down', value: -0.9, period: 'last month' },
      color: 'blue',
    },
    {
      label: 'WIP Total',
      value: data.metrics.wipTotal,
      format: 'currency',
      trend: { direction: 'up', value: 4.2, period: 'last month' },
      color: 'gray',
    },
    {
      label: 'Avg Days to Collect',
      value: data.metrics.avgDaysToCollect,
      format: 'duration',
      unit: 'days',
      trend: { direction: 'down', value: -6.5, period: 'last quarter' },
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        title="Billing Analytics"
        subtitle="Revenue, realization, and collection performance"
        backHref="/analytics"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend" subtitle="Billed, collected, and outstanding">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueTrend}>
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="billed"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorBilled)"
                name="Billed"
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorCollected)"
                name="Collected"
              />
              <Line type="monotone" dataKey="outstanding" stroke="#F59E0B" strokeWidth={2} name="Outstanding" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* A/R Aging Report */}
        <ChartCard title="A/R Aging Report" subtitle="Outstanding receivables by age">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.arAging}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="range" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="amount" fill="#EF4444" name="Amount" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue by Practice Area */}
        <ChartCard title="Revenue by Practice Area" subtitle="Performance by practice area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueByPracticeArea} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis type="number" className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis dataKey="area" type="category" width={100} className="text-xs" />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Billing Attorneys */}
        <ChartCard title="Top Billing Attorneys" subtitle="Revenue leaders">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topBillingAttorneys}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="name"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Work in Progress (WIP) */}
        <ChartCard title="Work in Progress (WIP)" subtitle="Unbilled work by attorney">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.wipByAttorney}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="name"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'WIP Amount']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="amount" fill="#F59E0B" name="WIP Amount" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Collection Rate by Client */}
        <ChartCard title="Collection Rate by Client" subtitle="Top clients performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.collectionRateByClient}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="client"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis className="text-xs" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Collection Rate']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="rate" fill="#3B82F6" name="Collection Rate %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

BillingAnalyticsClient.displayName = 'BillingAnalyticsClient';
