/**
 * Invoices Route
 * Displays invoice management list with filtering
 */

import { Link } from 'react-router';
import type { Route } from "./+types/invoices";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import { InvoicesApiService } from '@/api/billing';
import { InvoiceList } from '@/components/billing/InvoiceList';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Invoices',
    count: data?.invoices?.length,
    description: 'Manage client invoices and payments',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get('caseId');
  const clientId = url.searchParams.get('clientId');
  const status = url.searchParams.get('status');

  const invoicesApi = new InvoicesApiService();

  try {
    const [invoices, stats] = await Promise.all([
      invoicesApi.getAll({
        caseId: caseId || undefined,
        clientId: clientId || undefined,
        status: status as any || undefined,
      }),
      invoicesApi.getStats(),
    ]);

    return {
      invoices,
      stats,
      filters: { caseId, clientId, status },
    };
  } catch (error) {
    console.error('Failed to load invoices:', error);
    return {
      invoices: [],
      stats: {
        total: 0,
        outstanding: 0,
        paid: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
      },
      filters: { caseId, clientId, status },
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const invoicesApi = new InvoicesApiService();

  switch (intent) {
    case "send":
      const sendId = formData.get("id") as string;
      const recipients = formData.get("recipients") as string;
      try {
        await invoicesApi.send(sendId, recipients ? JSON.parse(recipients) : undefined);
        return { success: true, message: "Invoice sent" };
      } catch (error) {
        return { success: false, error: "Failed to send invoice" };
      }

    case "record-payment":
      const invoiceId = formData.get("invoiceId") as string;
      const payment = {
        amount: parseFloat(formData.get("amount") as string),
        date: formData.get("date") as string,
        method: formData.get("method") as any,
        reference: formData.get("reference") as string || undefined,
        notes: formData.get("notes") as string || undefined,
      };
      try {
        await invoicesApi.recordPayment(invoiceId, payment);
        return { success: true, message: "Payment recorded" };
      } catch (error) {
        return { success: false, error: "Failed to record payment" };
      }

    case "delete":
      const deleteId = formData.get("id") as string;
      try {
        await invoicesApi.delete(deleteId);
        return { success: true, message: "Invoice deleted" };
      } catch (error) {
        return { success: false, error: "Failed to delete invoice" };
      }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function InvoicesRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { invoices, stats, filters } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage client invoices and payments
          </p>
        </div>

        <Link
          to="/billing/invoices/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats.total}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
            ${stats.outstandingAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{stats.outstanding} invoices</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            ${stats.paidAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{stats.paid} invoices</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
            {stats.overdue}
          </p>
          <p className="text-xs text-gray-500">invoices</p>
        </div>
      </div>

      {/* Action Result */}
      {actionData?.message && (
        <div className={`mb-4 rounded-md p-4 ${actionData.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {actionData.message}
        </div>
      )}

      {/* Invoice List */}
      <InvoiceList
        invoices={invoices}
        filters={filters}
      />
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
      title="Failed to Load Invoices"
      message="We couldn't load the invoices. Please try again."
      backTo="/billing"
      backLabel="Return to Billing"
    />
  );
}
