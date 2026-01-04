/**
 * Case Analytics Route
 * Detailed analytics for case outcomes, types, and trends
 */

import { ChartCard, DateRangeSelector, FilterPanel, MetricCard } from '@/components/enterprise/analytics';
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
    title: 'Case Analytics',
    description: 'Case outcomes, win rates, and performance metrics',
  });
}

export async function loader() {
  // TODO: Fetch real data from API
  return {
    metrics: {
      totalCases: 273,
      activeCases: 127,
      wonCases: 89,
      winRate: 87.5,
      avgDuration: 145,
      avgSettlement: 325000,
    },
  };
}

export default function CaseAnalyticsRoute() {
  const { metrics } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 90),
    end: new Date(),
    label: 'Last 90 Days',
  });

  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

  const filters = [
    {
      id: 'caseType',
      label: 'Case Type',
      type: 'multiselect' as const,
      options: [
        { value: 'litigation', label: 'Litigation', count: 45 },
        { value: 'contract', label: 'Contract Dispute', count: 32 },
        { value: 'ip', label: 'IP/Patent', count: 28 },
        { value: 'employment', label: 'Employment', count: 22 },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect' as const,
      options: [
        { value: 'active', label: 'Active', count: 127 },
        { value: 'won', label: 'Won', count: 89 },
        { value: 'settled', label: 'Settled', count: 45 },
        { value: 'lost', label: 'Lost', count: 12 },
      ],
    },
    {
      id: 'practiceArea',
      label: 'Practice Area',
      type: 'select' as const,
      options: [
        { value: 'corporate', label: 'Corporate Law' },
        { value: 'litigation', label: 'Litigation' },
        { value: 'ip', label: 'Intellectual Property' },
        { value: 'real-estate', label: 'Real Estate' },
      ],
    },
  ];
  console.log('filter state:', filters);

  const casesByOutcome = [
    { name: 'Won', value: 89, color: '#10B981' },
    { name: 'Settled', value: 45, color: '#F59E0B' },
    { name: 'Lost', value: 12, color: '#EF4444' },
    { name: 'Active', value: 127, color: '#3B82F6' },
  ];

  const casesByType = [
    { type: 'Litigation', count: 45, won: 38, lost: 4, settled: 3, avgDuration: 178 },
    { type: 'Contract Dispute', count: 32, won: 24, lost: 2, settled: 6, avgDuration: 95 },
    { type: 'IP/Patent', count: 28, won: 22, lost: 3, settled: 3, avgDuration: 245 },
    { type: 'Employment', count: 22, won: 18, lost: 2, settled: 2, avgDuration: 125 },
    { type: 'Real Estate', count: 18, won: 14, lost: 1, settled: 3, avgDuration: 156 },
  ];

  const caseTrend = [
    { month: 'Jan', opened: 42, closed: 35, active: 127 },
    { month: 'Feb', opened: 38, closed: 41, active: 124 },
    { month: 'Mar', opened: 45, closed: 39, active: 130 },
    { month: 'Apr', opened: 52, closed: 44, active: 138 },
    { month: 'May', opened: 48, closed: 51, active: 135 },
    { month: 'Jun', opened: 43, closed: 48, active: 130 },
  ];

  const winRateByAttorney = [
    { name: 'Sarah Chen', cases: 42, won: 38, winRate: 90.5 },
    { name: 'Michael Torres', cases: 38, won: 34, winRate: 89.5 },
    { name: 'Jessica Park', cases: 35, won: 30, winRate: 85.7 },
    { name: 'David Kim', cases: 32, won: 26, winRate: 81.3 },
    { name: 'Emily Davis', cases: 29, won: 24, winRate: 82.8 },
  ];

  const metricsData = [
    {
      label: 'Total Cases',
      value: metrics.totalCases,
      format: 'number' as const,
      trend: { direction: 'up' as const, value: 8.2, period: 'last quarter' },
      icon: '⚖️',
      color: 'blue' as const,
    },
    {
      label: 'Active Cases',
      value: metrics.activeCases,
      format: 'number' as const,
      trend: { direction: 'down' as const, value: -3.5, period: 'last month' },
      icon: '📁',
      color: 'yellow' as const,
    },
    {
      label: 'Win Rate',
      value: metrics.winRate,
      format: 'percentage' as const,
      trend: { direction: 'up' as const, value: 2.8, period: 'last quarter' },
      icon: '🏆',
      color: 'green' as const,
    },
    {
      label: 'Avg Case Duration',
      value: metrics.avgDuration,
      format: 'duration' as const,
      trend: { direction: 'down' as const, value: -8.5, period: 'vs last year' },
      icon: '⏱️',
      color: 'purple' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/analytics"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Case Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Detailed analysis of case outcomes and performance
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

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            values={filterValues}
            onChange={(id, value) => setFilterValues({ ...filterValues, [id]: value })}
            onReset={() => setFilterValues({})}
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

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Case Outcomes */}
            <ChartCard title="Case Outcomes" subtitle="Distribution of case results">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={casesByOutcome}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%` as any}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {casesByOutcome.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Case Trend */}
            <ChartCard title="Case Volume Trend" subtitle="Monthly case flow">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={caseTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opened" fill="#3B82F6" name="Opened" />
                  <Bar dataKey="closed" fill="#10B981" name="Closed" />
                  <Line type="monotone" dataKey="active" stroke="#F59E0B" name="Active" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Cases by Type */}
            <ChartCard title="Cases by Type" subtitle="Distribution and win rates">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="type" type="category" stroke="#6b7280" width={120} />
                  <Tooltip />
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
                <BarChart data={winRateByAttorney}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="winRate" fill="#8B5CF6" name="Win Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Case Analytics"
      message="We couldn't load the case analytics data. Please try again."
      backTo="/analytics"
      backLabel="Back to Analytics"
    />
  );
}
