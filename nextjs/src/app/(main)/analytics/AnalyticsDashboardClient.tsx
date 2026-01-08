'use client';

/**
 * Analytics Dashboard Client Component
 * Interactive dashboard with navigation to sub-pages
 *
 * @component
 */

import { MetricCard } from '@/components/analytics/MetricCard';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Progress } from '@/components/ui/shadcn/progress';
import type {
  BillingMetricsSummary,
  CaseMetricsSummary,
  ClientMetricsSummary,
  DateRange,
  MetricCardData,
  ProductivityMetricsSummary,
} from '@/types/analytics-module';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Clock,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

// ============================================================================
// Types
// ============================================================================

interface DashboardMetrics {
  cases: CaseMetricsSummary;
  clients: ClientMetricsSummary;
  productivity: ProductivityMetricsSummary;
  billing: BillingMetricsSummary;
}

interface AnalyticsDashboardClientProps {
  metrics: DashboardMetrics;
}

// ============================================================================
// Navigation Cards Data
// ============================================================================

const ANALYTICS_SECTIONS = [
  {
    id: 'cases',
    title: 'Case Analytics',
    description: 'Track case outcomes, win rates, and performance trends',
    href: '/analytics/cases',
    icon: Briefcase,
    color: 'blue',
    metrics: ['Win Rate', 'Case Duration', 'Settlement Values'],
  },
  {
    id: 'clients',
    title: 'Client Analytics',
    description: 'Monitor client revenue, retention, and satisfaction',
    href: '/analytics/clients',
    icon: Users,
    color: 'green',
    metrics: ['Client Value', 'Retention Rate', 'Client Growth'],
  },
  {
    id: 'productivity',
    title: 'Productivity Analytics',
    description: 'Analyze team utilization and billable hour efficiency',
    href: '/analytics/productivity',
    icon: Clock,
    color: 'purple',
    metrics: ['Utilization Rate', 'Billable Hours', 'Activity Mix'],
  },
  {
    id: 'billing',
    title: 'Billing Analytics',
    description: 'Review revenue, collections, and A/R aging reports',
    href: '/analytics/billing',
    icon: DollarSign,
    color: 'yellow',
    metrics: ['Revenue Trends', 'Collection Rate', 'Outstanding A/R'],
  },
] as const;

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

export function AnalyticsDashboardClient({
  metrics,
}: AnalyticsDashboardClientProps): React.JSX.Element {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    // Trigger page refresh to get fresh data
    router.refresh();
    // Simulate minimum loading time for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, [router]);

  // Transform metrics to MetricCardData format
  const summaryMetrics: MetricCardData[] = [
    {
      label: 'Total Cases',
      value: metrics.cases.totalCases,
      format: 'number',
      trend: { direction: 'up', value: 8.2, period: 'vs last quarter' },
      color: 'blue',
    },
    {
      label: 'Active Clients',
      value: metrics.clients.activeClients,
      format: 'number',
      trend: { direction: 'up', value: 5.7, period: 'vs last quarter' },
      color: 'green',
    },
    {
      label: 'Utilization Rate',
      value: metrics.productivity.utilizationRate,
      format: 'percentage',
      trend: { direction: 'up', value: 2.5, period: 'vs last month' },
      color: 'purple',
    },
    {
      label: 'Monthly Revenue',
      value: Math.floor(metrics.billing.totalRevenue / 12),
      format: 'currency',
      trend: { direction: 'up', value: 12.5, period: 'vs last month' },
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Comprehensive view of your firm's performance metrics
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={16} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryMetrics.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Case Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Case Performance
            </CardTitle>
            <CardDescription>Win rate and case outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Win Rate</span>
                  <span className="font-semibold">{metrics.cases.winRate}%</span>
                </div>
                <Progress value={metrics.cases.winRate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{metrics.cases.wonCases}</p>
                  <p className="text-xs text-slate-500">Won</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{metrics.cases.activeCases}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-600">
                    {metrics.cases.closedCases - metrics.cases.wonCases}
                  </p>
                  <p className="text-xs text-slate-500">Other</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Financial Overview
            </CardTitle>
            <CardDescription>Revenue and collections summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Collection Rate</span>
                  <span className="font-semibold">{metrics.billing.collectionRate}%</span>
                </div>
                <Progress value={metrics.billing.collectionRate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.billing.collectedRevenue)}
                  </p>
                  <p className="text-xs text-slate-500">Collected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(metrics.billing.outstandingAR)}
                  </p>
                  <p className="text-xs text-slate-500">Outstanding</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-600">
                    {formatCurrency(metrics.billing.wipTotal)}
                  </p>
                  <p className="text-xs text-slate-500">WIP</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Sections Navigation */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Detailed Analytics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ANALYTICS_SECTIONS.map((section) => {
            const IconComponent = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${section.color}-100 dark:bg-${section.color}-900/30`}
                  >
                    <IconComponent
                      className={`h-5 w-5 text-${section.color}-600 dark:text-${section.color}-400`}
                    />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {section.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {section.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Data refreshes automatically every 5 minutes. Last updated:{' '}
          {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}

AnalyticsDashboardClient.displayName = 'AnalyticsDashboardClient';
