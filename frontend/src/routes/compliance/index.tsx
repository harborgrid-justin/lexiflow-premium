/**
 * Compliance Route
 *
 * Regulatory compliance and ethics management with:
 * - Server-side data loading via loader
 * - Compliance tracking and reporting
 * - Conflict checking
 * - Ethics guidelines
 *
 * @module routes/compliance/index
 */

import { api } from '@/api';
import { Link } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return createMeta({
    title: 'Compliance',
    description: 'Manage regulatory compliance, ethics, and conflict checking',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request: _ }: Route.LoaderArgs) {
  try {
    const [alerts, reports, conflicts] = await Promise.all([
      api.compliance.getChecks({ status: 'requires_review' }).catch(() => []),
      api.reports.getAll({ status: 'pending' }).catch(() => []),
      api.conflictChecks.getAll({ status: 'pending' }).catch(() => []),
    ]);

    return {
      alerts,
      pendingReports: reports.length,
      conflictChecks: conflicts.length,
      lastAuditDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to load compliance data:", error);
    return {
      alerts: [],
      pendingReports: 0,
      conflictChecks: 0,
      lastAuditDate: null,
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "run-conflict-check":
        // In a real app, we would parse form data and call api.compliance.compliance.runCheck(...)
        return { success: true, message: "Conflict check initiated" };

      case "acknowledge-alert":
        // api.compliance.compliance.updateCheck(...)
        return { success: true };

      case "generate-report":
        // api.compliance.reports.generate(...)
        return { success: true, message: "Report generated" };

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ComplianceIndexRoute() {
  const { alerts, pendingReports, conflictChecks } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Compliance
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage regulatory compliance, ethics, and conflict checking
          </p>
        </div>

        <Link
          to="/compliance/conflict-check"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Run Conflict Check
        </Link>
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Alerts</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{alerts.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Reports</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{pendingReports}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conflict Checks</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{conflictChecks}</p>
            </div>
          </div>
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Compliance Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Compliance features coming soon.
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
      title="Failed to Load Compliance"
      message="We couldn't load the compliance data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
