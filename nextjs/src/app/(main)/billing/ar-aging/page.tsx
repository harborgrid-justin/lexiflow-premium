/**
 * AR Aging Dashboard Page - Server Component
 *
 * Displays accounts receivable aging analysis with aging buckets,
 * client breakdowns, and visual analytics for outstanding invoices.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/ar-aging/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  AlertTriangle,
  Users,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { getARAgingBuckets, getARAgingSummary } from '../ar-actions';
import type { ARAgingBucket, ARAgingClient, ARAgingSummary } from '../types';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'AR Aging Analysis | Billing | LexiFlow',
  description:
    'Analyze accounts receivable aging, track outstanding invoices, and identify collection priorities',
  keywords: ['ar aging', 'accounts receivable', 'aging analysis', 'collections', 'legal billing'],
};

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getBucketColor(range: string): {
  bg: string;
  text: string;
  border: string;
  bar: string;
} {
  const rangeColors: Record<string, { bg: string; text: string; border: string; bar: string }> = {
    '0-30': {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      bar: 'bg-emerald-500',
    },
    '31-60': {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      bar: 'bg-amber-500',
    },
    '61-90': {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      bar: 'bg-orange-500',
    },
    '90+': {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      bar: 'bg-red-500',
    },
  };

  // Match the range to known patterns
  if (range.includes('0-30') || range.toLowerCase().includes('current')) {
    return rangeColors['0-30'];
  }
  if (range.includes('31-60') || range.includes('30-60')) {
    return rangeColors['31-60'];
  }
  if (range.includes('61-90') || range.includes('60-90')) {
    return rangeColors['61-90'];
  }
  return rangeColors['90+'];
}

// =============================================================================
// Components
// =============================================================================

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    yellow: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'down'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trend === 'up'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500'
            }`}
          >
            {trend === 'down' ? (
              <TrendingDown className="h-4 w-4" />
            ) : trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : null}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function AgingBucketCard({ bucket }: { bucket: ARAgingBucket }) {
  const colors = getBucketColor(bucket.range);

  return (
    <div
      className={`rounded-xl border ${colors.border} ${colors.bg} p-6 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors.text}`}>{bucket.range} Days</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(bucket.amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {formatPercentage(bucket.percentage)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {bucket.count} invoice{bucket.count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full ${colors.bar} transition-all`}
            style={{ width: `${Math.min(bucket.percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function AgingBarChart({ buckets }: { buckets: ARAgingBucket[] }) {
  const maxAmount = Math.max(...buckets.map((b) => b.amount));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Aging Distribution
      </h3>
      <div className="space-y-4">
        {buckets.map((bucket) => {
          const colors = getBucketColor(bucket.range);
          const widthPercent = maxAmount > 0 ? (bucket.amount / maxAmount) * 100 : 0;

          return (
            <div key={bucket.range}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={`font-medium ${colors.text}`}>{bucket.range} Days</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(bucket.amount)}
                </span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                <div
                  className={`h-full ${colors.bar} flex items-center justify-end px-2 transition-all`}
                  style={{ width: `${Math.max(widthPercent, 5)}%` }}
                >
                  <span className="text-xs font-medium text-white">
                    {formatPercentage(bucket.percentage)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientAgingTable({ clients }: { clients: ARAgingClient[] }) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-700">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">No clients in this aging bucket</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
              Client
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
              Amount
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
              Invoices
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
              Oldest Invoice
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {clients.map((client) => (
            <tr
              key={client.clientId}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/clients/${client.clientId}`}
                  className="font-medium text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                >
                  {client.clientName}
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                {formatCurrency(client.amount)}
              </td>
              <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                {client.invoiceCount}
              </td>
              <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                {formatDate(client.oldestInvoiceDate)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/billing/collections?clientId=${client.clientId}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BucketDetails({ buckets }: { buckets: ARAgingBucket[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Client Breakdown by Aging Bucket
        </h3>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {buckets.map((bucket) => {
          const colors = getBucketColor(bucket.range);

          return (
            <details key={bucket.range} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-3 w-3 rounded-full ${colors.bar}`}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {bucket.range} Days
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                    {bucket.clients?.length || 0} clients
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(bucket.amount)}
                  </span>
                  <ChevronDown className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180" />
                </div>
              </summary>
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                <ClientAgingTable clients={bucket.clients || []} />
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filters:</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-400" />
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
          <option value="">All Time</option>
          <option value="30">Last 30 Days</option>
          <option value="60">Last 60 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>
      <div className="flex-1" />
      <Link
        href="/billing/collections"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
      >
        <Users className="h-4 w-4" />
        Collections
      </Link>
      <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
}

async function ARAgingContent() {
  const [bucketsResult, summaryResult] = await Promise.all([
    getARAgingBuckets(),
    getARAgingSummary(),
  ]);

  // Default buckets if API returns empty
  const buckets: ARAgingBucket[] = bucketsResult.data || [
    { range: '0-30', amount: 0, count: 0, percentage: 0, clients: [] },
    { range: '31-60', amount: 0, count: 0, percentage: 0, clients: [] },
    { range: '61-90', amount: 0, count: 0, percentage: 0, clients: [] },
    { range: '90+', amount: 0, count: 0, percentage: 0, clients: [] },
  ];

  const summary: ARAgingSummary = summaryResult.data || {
    totalOutstanding: buckets.reduce((sum, b) => sum + b.amount, 0),
    totalInvoiceCount: buckets.reduce((sum, b) => sum + b.count, 0),
    averageDaysOutstanding: 0,
    buckets,
  };

  // Calculate overdue amount (61+ days)
  const overdueAmount = buckets
    .filter((b) => b.range.includes('61') || b.range.includes('90'))
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <>
      {/* Summary Cards */}
      <section className="mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Outstanding"
            value={formatCurrency(summary.totalOutstanding)}
            subtitle={`${formatNumber(summary.totalInvoiceCount)} invoices`}
            icon={<DollarSign className="h-6 w-6" />}
            color="blue"
          />
          <SummaryCard
            title="Current (0-30 Days)"
            value={formatCurrency(buckets.find((b) => b.range.includes('0-30'))?.amount || 0)}
            subtitle={`${buckets.find((b) => b.range.includes('0-30'))?.count || 0} invoices`}
            icon={<FileText className="h-6 w-6" />}
            color="green"
          />
          <SummaryCard
            title="Avg Days Outstanding"
            value={`${Math.round(summary.averageDaysOutstanding)} days`}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
          />
          <SummaryCard
            title="Overdue (61+ Days)"
            value={formatCurrency(overdueAmount)}
            subtitle="Needs attention"
            icon={<AlertTriangle className="h-6 w-6" />}
            color="red"
            trend={overdueAmount > 0 ? 'up' : 'neutral'}
            trendValue={overdueAmount > 0 ? 'Action needed' : undefined}
          />
        </div>
      </section>

      {/* Aging Buckets */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Aging Buckets
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {buckets.map((bucket) => (
            <AgingBucketCard key={bucket.range} bucket={bucket} />
          ))}
        </div>
      </section>

      {/* Chart and Details */}
      <section className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AgingBarChart buckets={buckets} />
        </div>
        <div className="lg:col-span-2">
          <BucketDetails buckets={buckets} />
        </div>
      </section>
    </>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function ARAgingPage({ searchParams }: PageProps) {
  // Next.js 16: Await searchParams
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/billing"
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Billing
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    AR Aging Analysis
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track outstanding receivables by aging period
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/billing/collections"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Users className="h-4 w-4" />
              Manage Collections
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <section className="mb-6">
          <FilterBar />
        </section>

        {/* Main Content */}
        <Suspense
          fallback={
            <div className="space-y-8">
              {/* Summary skeleton */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
              {/* Buckets skeleton */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
              {/* Chart skeleton */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="h-64 animate-pulse rounded-xl bg-slate-200 lg:col-span-2 dark:bg-slate-700" />
              </div>
            </div>
          }
        >
          <ARAgingContent />
        </Suspense>
      </div>
    </div>
  );
}
