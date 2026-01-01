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

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({}: Route.MetaArgs) {
  return createMeta({
    title: 'Analytics',
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

  // TODO: Implement analytics data fetching
  // const [metrics, trends, reports] = await Promise.all([
  //   api.analytics.getMetrics(period),
  //   api.analytics.getTrends(period),
  //   api.analytics.getRecentReports(),
  // ]);

  return {
    period,
    metrics: {
      casesOpened: 0,
      casesClosed: 0,
      revenue: 0,
      avgCycleTime: 0,
    },
    trends: [],
    recentReports: [],
  };
}

// ============================================================================
// Component
// ============================================================================

export default function AnalyticsIndexRoute({ loaderData }: Route.ComponentProps) {
  const { period, metrics } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Business intelligence and performance insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <Link
              to="?period=7d"
              className={`px-3 py-2 text-sm font-medium ${
                period === '7d'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              7 Days
            </Link>
            <Link
              to="?period=30d"
              className={`border-l border-r border-gray-200 px-3 py-2 text-sm font-medium dark:border-gray-700 ${
                period === '30d'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              30 Days
            </Link>
            <Link
              to="?period=90d"
              className={`px-3 py-2 text-sm font-medium ${
                period === '90d'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              90 Days
            </Link>
          </div>

          <Link
            to="/analytics/reports/create"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Report
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cases Opened</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {metrics.casesOpened}
          </p>
          <p className="mt-1 text-xs text-gray-400">Last {period}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cases Closed</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            {metrics.casesClosed}
          </p>
          <p className="mt-1 text-xs text-gray-400">Last {period}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            ${metrics.revenue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">Last {period}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Cycle Time</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {metrics.avgCycleTime} days
          </p>
          <p className="mt-1 text-xs text-gray-400">Per case</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Analytics Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Charts and visualizations coming soon.
        </p>
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
