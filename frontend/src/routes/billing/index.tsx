/**
 * Billing & Finance Route
 *
 * Displays billing, invoices, and financial management with:
 * - Server-side data loading via loader
 * - Invoice generation and payment tracking
 * - Financial reports and analytics
 *
 * @module routes/billing/index
 */

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Invoices',
    count: data?.invoices?.length,
    description: 'Manage billing, invoices, and firm finances',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Implement billing data fetching
  // const [invoices, payments, summary] = await Promise.all([
  //   api.billing.getInvoices(),
  //   api.billing.getPayments(),
  //   api.billing.getSummary(),
  // ]);

  return {
    invoices: [],
    payments: [],
    summary: {
      totalOutstanding: 0,
      totalReceived: 0,
      overdueCount: 0,
    },
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-invoice":
      // TODO: Handle invoice creation
      return { success: true, message: "Invoice created" };

    case "mark-paid":
      // TODO: Handle payment recording
      return { success: true, message: "Payment recorded" };

    case "send-reminder":
      // TODO: Handle reminder sending
      return { success: true, message: "Reminder sent" };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function BillingIndexRoute({ loaderData }: Route.ComponentProps) {
  const { invoices, summary } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Billing & Finance
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage invoices, payments, and financial reports
          </p>
        </div>

        <Link
          to="/billing/create"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            ${summary.totalOutstanding.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Received (YTD)</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            ${summary.totalReceived.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
            {summary.overdueCount} invoices
          </p>
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Billing Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Billing and finance features coming soon.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {invoices.length} invoices in system
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
      title="Failed to Load Billing"
      message="We couldn't load the billing information. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
