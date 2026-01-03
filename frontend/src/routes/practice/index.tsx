/**
 * Firm Operations Route
 *
 * Practice and firm management with:
 * - Server-side data loading via loader
 * - Staff management
 * - Resource allocation
 * - Operational metrics
 *
 * @module routes/practice/index
 */

import { Link } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Firm Operations',
    description: 'Manage practice operations, staff, and resources',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement practice data fetching
  // const [staff, resources, metrics] = await Promise.all([
  //   api.practice.getStaff(),
  //   api.practice.getResources(),
  //   api.practice.getMetrics(),
  // ]);

  return {
    staffCount: 0,
    activeMatters: 0,
    utilizationRate: 0,
    pendingTasks: 0,
  };
}

// ============================================================================
// Component
// ============================================================================

export default function PracticeIndexRoute({ loaderData }: Route.ComponentProps) {
  const { staffCount, activeMatters, utilizationRate, pendingTasks } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Firm Operations
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage practice operations, staff, and resources
          </p>
        </div>

        <Link
          to="/practice/reports"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Reports
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Staff Members</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {staffCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Matters</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {activeMatters}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilization Rate</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            {utilizationRate}%
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {pendingTasks}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/practice/staff"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        >
          <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Staff Directory</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage team members</p>
          </div>
        </Link>
        <Link
          to="/practice/resources"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        >
          <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Resources</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Allocate and track resources</p>
          </div>
        </Link>
        <Link
          to="/practice/timekeeping"
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        >
          <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Timekeeping</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track billable hours</p>
          </div>
        </Link>
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Practice Management Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Firm operations features coming soon.
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
      title="Failed to Load Firm Operations"
      message="We couldn't load the operations data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
