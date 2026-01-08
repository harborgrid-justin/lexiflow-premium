/**
 * Billing Analytics Loading State
 *
 * Skeleton loading UI for the analytics dashboard.
 *
 * @module billing/analytics/loading
 */

import { BarChart3 } from 'lucide-react';

function LoadingCard() {
  return (
    <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
  );
}

function LoadingSection({ title, cardCount }: { title: string; cardCount: number }) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${Math.min(cardCount, 4)}`}>
        {[...Array(cardCount)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export default function BillingAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Profitability Section */}
        <LoadingSection title="Profitability Metrics" cardCount={4} />

        {/* Additional EBITDA Card */}
        <div className="mb-8 h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

        {/* Realization Section */}
        <LoadingSection title="Realization Metrics" cardCount={3} />

        {/* Realization Breakdown */}
        <div className="mb-8 h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

        {/* WIP Section */}
        <LoadingSection title="Work in Progress" cardCount={4} />

        {/* WIP Details */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Revenue Forecast Section */}
        <LoadingSection title="Revenue Forecasting" cardCount={3} />
        <div className="mb-8 h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

        {/* Timekeeper Performance Section */}
        <LoadingTable />

        {/* Matter Profitability Section */}
        <LoadingTable />
      </div>
    </div>
  );
}
