'use client';

/**
 * Case Analytics Client Component
 * Interactive case analytics with charts and filters
 *
 * @component
 */

import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { ChartCard } from '@/components/analytics/ChartCard';
import { ComparisonSelector } from '@/components/analytics/ComparisonSelector';
import { MetricCard } from '@/components/analytics/MetricCard';
import type {
  CaseMetricsSummary,
  ComparisonPeriod,
  DateRange,
  FilterConfig,
  FilterValues,
  MetricCardData,
} from '@/types/analytics-module';
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

interface CaseAnalyticsData {
  metrics: CaseMetricsSummary;
  casesByOutcome: Array<{ name: string; value: number; color: string }>;
  casesByType: Array<{
    type: string;
    count: number;
    won: number;
    lost: number;
    settled: number;
    avgDuration: number;
  }>;
  caseTrend: Array<{ month: string; opened: number; closed: number; active: number }>;
  winRateByAttorney: Array<{ name: string; cases: number; won: number; winRate: number }>;
}

interface CaseAnalyticsClientProps {
  data: CaseAnalyticsData;
}

// ============================================================================
// Filter Configuration
// ============================================================================

const CASE_FILTERS: FilterConfig[] = [
  {
    id: 'caseType',
    label: 'Case Type',
    type: 'multiselect',
    options: [
      { value: 'litigation', label: 'Litigation', count: 82 },
      { value: 'contract', label: 'Contract Dispute', count: 57 },
      { value: 'ip', label: 'IP/Patent', count: 49 },
      { value: 'employment', label: 'Employment', count: 39 },
      { value: 'real-estate', label: 'Real Estate', count: 20 },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'multiselect',
    options: [
      { value: 'active', label: 'Active', count: 89 },
      { value: 'won', label: 'Won', count: 142 },
      { value: 'settled', label: 'Settled', count: 40 },
      { value: 'lost', label: 'Lost', count: 10 },
    ],
  },
  {
    id: 'practiceArea',
    label: 'Practice Area',
    type: 'select',
    options: [
      { value: 'corporate', label: 'Corporate Law' },
      { value: 'litigation', label: 'Litigation' },
      { value: 'ip', label: 'Intellectual Property' },
      { value: 'real-estate', label: 'Real Estate' },
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

export function CaseAnalyticsClient({ data }: CaseAnalyticsClientProps): React.JSX.Element {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 90 Days',
  });
  const [comparisonPeriod, setComparisonPeriod] = React.useState<ComparisonPeriod>('mom');
  const [filterValues, setFilterValues] = React.useState<FilterValues>({});

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, [router]);

  const handleExport = React.useCallback(() => {
    // Export implementation
    console.log('Exporting case analytics...', { dateRange, filterValues });
  }, [dateRange, filterValues]);

  const handleFilterChange = React.useCallback((id: string, value: string | string[]) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleFilterReset = React.useCallback(() => {
    setFilterValues({});
  }, []);

  // Transform metrics to card data
  const metricsData: MetricCardData[] = [
    {
      label: 'Total Cases',
      value: data.metrics.totalCases,
      format: 'number',
      trend: { direction: 'up', value: 8.2, period: 'last quarter' },
      color: 'blue',
    },
    {
      label: 'Active Cases',
      value: data.metrics.activeCases,
      format: 'number',
      trend: { direction: 'down', value: -3.5, period: 'last month' },
      color: 'yellow',
    },
    {
      label: 'Win Rate',
      value: data.metrics.winRate,
      format: 'percentage',
      trend: { direction: 'up', value: 2.8, period: 'last quarter' },
      color: 'green',
    },
    {
      label: 'Avg Case Duration',
      value: data.metrics.avgDuration,
      format: 'duration',
      unit: 'days',
      trend: { direction: 'down', value: -8.5, period: 'vs last year' },
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        title="Case Analytics"
        subtitle="Detailed analysis of case outcomes and performance"
        backHref="/analytics"
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      >
        <ComparisonSelector value={comparisonPeriod} onChange={setComparisonPeriod} />
      </AnalyticsHeader>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <AnalyticsFilters
            filters={CASE_FILTERS}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricsData.map((metric, index) => (
              <MetricCard key={index} data={metric} />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Case Outcomes Pie Chart */}
            <ChartCard title="Case Outcomes" subtitle="Distribution of case results">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.casesByOutcome}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.casesByOutcome.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Cases']}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Case Volume Trend */}
            <ChartCard title="Case Volume Trend" subtitle="Monthly case flow">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.caseTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="opened" fill="#3B82F6" name="Opened" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="closed" fill="#10B981" name="Closed" radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Active"
                    dot={{ fill: '#F59E0B' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Cases by Type */}
            <ChartCard title="Cases by Type" subtitle="Distribution and win rates">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.casesByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="type" type="category" width={110} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="won" stackId="a" fill="#10B981" name="Won" />
                  <Bar dataKey="settled" stackId="a" fill="#F59E0B" name="Settled" />
                  <Bar dataKey="lost" stackId="a" fill="#EF4444" name="Lost" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Win Rate by Attorney */}
            <ChartCard title="Win Rate by Attorney" subtitle="Top performers">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.winRateByAttorney}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                  />
                  <Bar dataKey="winRate" fill="#8B5CF6" name="Win Rate %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}

CaseAnalyticsClient.displayName = 'CaseAnalyticsClient';
