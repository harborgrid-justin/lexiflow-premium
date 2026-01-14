import {
  ChartCard,
  DateRangeSelector,
  FilterPanel,
  MetricCard,
} from '@/components/enterprise/analytics';
import { format, subDays, subMonths } from 'date-fns';
import { ArrowLeft, Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { PieLabelRenderProps } from 'recharts';
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
import type { CaseAnalyticsLoaderData } from './types';

export function CaseAnalytics({ metrics }: CaseAnalyticsLoaderData) {
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
        {
          value: 'litigation',
          label: 'Litigation',
          count: Math.floor(metrics.totalCases * 0.33),
        },
        {
          value: 'contract',
          label: 'Contract Dispute',
          count: Math.floor(metrics.totalCases * 0.23),
        },
        {
          value: 'ip',
          label: 'IP/Patent',
          count: Math.floor(metrics.totalCases * 0.2),
        },
        {
          value: 'employment',
          label: 'Employment',
          count: Math.floor(metrics.totalCases * 0.16),
        },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect' as const,
      options: [
        { value: 'active', label: 'Active', count: metrics.activeCases },
        { value: 'won', label: 'Won', count: metrics.wonCases },
        {
          value: 'settled',
          label: 'Settled',
          count: Math.floor(metrics.totalCases * 0.16),
        },
        {
          value: 'lost',
          label: 'Lost',
          count: Math.floor(metrics.totalCases * 0.04),
        },
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

  // Cases by outcome derived from metrics
  const casesByOutcome = useMemo(() => {
    const settled = Math.floor(metrics.totalCases * 0.16);
    const lost = Math.floor(metrics.totalCases * 0.04);
    return [
      { name: 'Won', value: metrics.wonCases, color: '#10B981' },
      { name: 'Settled', value: settled, color: '#F59E0B' },
      { name: 'Lost', value: lost, color: '#EF4444' },
      { name: 'Active', value: metrics.activeCases, color: '#3B82F6' },
    ];
  }, [metrics.wonCases, metrics.activeCases, metrics.totalCases]);

  // Cases by type derived from total cases
  const casesByType = useMemo(() => {
    const types = [
      { type: 'Litigation', ratio: 0.33, avgDuration: 178 },
      { type: 'Contract Dispute', ratio: 0.23, avgDuration: 95 },
      { type: 'IP/Patent', ratio: 0.2, avgDuration: 245 },
      { type: 'Employment', ratio: 0.16, avgDuration: 125 },
      { type: 'Real Estate', ratio: 0.13, avgDuration: 156 },
    ];
    const winRatio = metrics.winRate / 100;
    return types.map((t) => {
      const count = Math.floor(metrics.totalCases * t.ratio);
      const won = Math.floor(count * winRatio);
      const lost = Math.floor(count * 0.08);
      const settled = count - won - lost - Math.floor(count * 0.3);
      return {
        type: t.type,
        count,
        won,
        lost: Math.max(0, lost),
        settled: Math.max(0, settled),
        avgDuration: t.avgDuration,
      };
    });
  }, [metrics.totalCases, metrics.winRate]);

  // Case trend over 6 months
  const caseTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = format(subMonths(new Date(), 5 - i), 'MMM');
      const baseOpened = Math.floor(metrics.totalCases / 6);
      const variance = 1 + (Math.random() - 0.5) * 0.3;
      const opened = Math.floor(baseOpened * variance);
      const closed = Math.floor(opened * 0.9 * variance);
      return {
        month,
        opened,
        closed,
        active: metrics.activeCases + Math.floor((Math.random() - 0.5) * 10),
      };
    });
  }, [metrics.totalCases, metrics.activeCases]);

  // Win rate by attorney
  const winRateByAttorney = useMemo(() => {
    const attorneys = [
      'Sarah Chen',
      'Michael Torres',
      'Jessica Park',
      'David Kim',
      'Emily Davis',
    ];
    const baseWinRate = metrics.winRate;
    return attorneys.map((name, i) => {
      const cases = Math.floor((metrics.totalCases / 5) * (1 - i * 0.05));
      const winRate = baseWinRate + (2 - i) * 2; // Slightly varied win rates
      const won = Math.floor(cases * (winRate / 100));
      return {
        name,
        cases,
        won,
        winRate: parseFloat(winRate.toFixed(1)),
      };
    });
  }, [metrics.totalCases, metrics.winRate]);

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
      trend: {
        direction: 'down' as const,
        value: -8.5,
        period: 'vs last year',
      },
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
            onChange={(id, value) =>
              setFilterValues({ ...filterValues, [id]: value })
            }
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
            <ChartCard
              title="Case Outcomes"
              subtitle="Distribution of case results"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={casesByOutcome}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({
                      name,
                      percent,
                    }: Pick<PieLabelRenderProps, 'name' | 'percent'>) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
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
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#F59E0B"
                    name="Active"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Cases by Type */}
            <ChartCard
              title="Cases by Type"
              subtitle="Distribution and win rates"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis
                    dataKey="type"
                    type="category"
                    stroke="#6b7280"
                    width={120}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="won" stackId="a" fill="#10B981" name="Won" />
                  <Bar
                    dataKey="settled"
                    stackId="a"
                    fill="#F59E0B"
                    name="Settled"
                  />
                  <Bar dataKey="lost" stackId="a" fill="#EF4444" name="Lost" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Win Rate by Attorney */}
            <ChartCard title="Win Rate by Attorney" subtitle="Top performers">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winRateByAttorney}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
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
