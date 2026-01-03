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

import { api } from '@/api';
import type { Invoice } from '@/types';
import { format } from 'date-fns';
import { Form, Link, useNavigation } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

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

export async function loader({ request: _ }: Route.LoaderArgs) {
  try {
    const [invoices, stats] = await Promise.all([
      api.invoices.getAll(),
      api.invoices.getStats().catch(() => ({
        total: 0,
        outstanding: 0,
        paid: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
      })),
    ]);

    return {
      invoices: invoices as Invoice[],
      summary: {
        totalOutstanding: stats.outstandingAmount,
        totalReceived: stats.paidAmount,
        overdueCount: stats.overdue,
      },
    };
  } catch (error) {
    console.error("Failed to load billing data:", error);
    throw error;
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
      case "create-invoice": {
        // Basic implementation - in real app would likely redirect to a dedicated create page
        // or handle a complex form submission
        const caseId = formData.get("caseId") as string;
        const invoiceNumber = formData.get("invoiceNumber") as string;

        if (!caseId || !invoiceNumber) {
          return { success: false, error: "Missing required fields" };
        }

        await api.invoices.create({
          caseId,
          invoiceNumber,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
          items: [], // Empty items for now
        });
        return { success: true, message: "Invoice created" };
      }

      case "mark-paid": {
        const id = formData.get("id") as string;
        const amount = parseFloat(formData.get("amount") as string);

        if (!id || isNaN(amount)) {
          return { success: false, error: "Invalid payment data" };
        }

        await api.invoices.recordPayment(id, {
          amount,
          date: new Date().toISOString(),
          method: 'Check', // Default
        });
        return { success: true, message: "Payment recorded" };
      }

      case "send-reminder": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "Missing ID" };

        await api.invoices.send(id);
        return { success: true, message: "Reminder sent" };
      }

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

export default function BillingIndexRoute() {
  const { invoices, summary } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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

        <div className="flex gap-3">
          <Link
            to="/billing/time/new"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New Time Entry
          </Link>
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

      {/* Invoices List */}
      <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Invoices</h3>
        </div>
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No invoices found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Invoice #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM d, yyyy') : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {invoice.clientName || invoice.clientId || 'Unknown Client'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    ${invoice.totalAmount?.toLocaleString() ?? '0.00'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      invoice.status === 'Overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {invoice.status !== 'Paid' && (
                        <Form method="post" className="inline-block">
                          <input type="hidden" name="intent" value="mark-paid" />
                          <input type="hidden" name="id" value={invoice.id} />
                          <input type="hidden" name="amount" value={invoice.totalAmount} />
                          <button
                            type="submit"
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                            disabled={isSubmitting}
                          >
                            Mark Paid
                          </button>
                        </Form>
                      )}
                      <Link to={`/billing/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/billing/time"
          className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Time Entries</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track billable time</p>
            </div>
          </div>
        </Link>

        <Link
          to="/billing/expenses"
          className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Expenses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track expenses</p>
            </div>
          </div>
        </Link>

        <Link
          to="/billing/invoices"
          className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Invoices</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage invoices</p>
            </div>
          </div>
        </Link>

        <Link
          to="/billing/trust"
          className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Trust Accounts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">IOLTA compliance</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Features Overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Enterprise Billing Features
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">LEDES/UTBMS Codes</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Standard billing codes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Pre-bill Review</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review before sending</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Write-offs & Adjustments</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Flexible billing adjustments</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Aging Reports</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track payment aging</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Trust Compliance</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">3-way reconciliation</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Batch Invoicing</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate multiple invoices</p>
            </div>
          </div>
        </div>
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
