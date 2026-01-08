/**
 * Invoice Detail Page - Server Component
 *
 * Displays single invoice with line items, payments, and actions.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/invoices/[id]/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FileText,
  ChevronRight,
  Send,
  Download,
  Printer,
  Edit,
  CreditCard,
  Clock,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { getInvoiceById } from '../../actions';
import type { Invoice, InvoiceLineItem, InvoicePayment, InvoiceStatus } from '../../types';
import { InvoiceActions } from './invoice-actions';

// =============================================================================
// Metadata
// =============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getInvoiceById(resolvedParams.id);

  if (!result.success || !result.data) {
    return { title: 'Invoice Not Found | LexiFlow' };
  }

  return {
    title: `Invoice ${result.data.invoiceNumber} | LexiFlow`,
    description: `View invoice details for ${result.data.clientName}`,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusColor(status: InvoiceStatus | string): string {
  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Partially Paid': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Cancelled: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  };
  return statusColors[status] || statusColors.Draft;
}

// =============================================================================
// Components
// =============================================================================

function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  const isOverdue =
    invoice.status !== 'Paid' &&
    invoice.status !== 'Cancelled' &&
    new Date(invoice.dueDate) < new Date();

  const displayStatus = isOverdue ? 'Overdue' : invoice.status;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Invoice {invoice.invoiceNumber}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
              displayStatus
            )}`}
          >
            {displayStatus === 'Paid' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : displayStatus === 'Overdue' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            {displayStatus}
          </span>
        </div>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {invoice.matterDescription}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {invoice.status === 'Draft' && (
          <Link
            href={`/billing/invoices/${invoice.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        )}
        {(invoice.status === 'Draft' || invoice.status === 'Sent') && (
          <InvoiceActions invoice={invoice} />
        )}
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
          <Download className="h-4 w-4" />
          PDF
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>
    </div>
  );
}

function ClientInfo({ invoice }: { invoice: Invoice }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <Building2 className="h-5 w-5 text-slate-400" />
        Bill To
      </h2>
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {invoice.clientName}
          </p>
          {invoice.billingAddress && (
            <div className="mt-1 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="whitespace-pre-line">{invoice.billingAddress}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceDates({ invoice }: { invoice: Invoice }) {
  const isOverdue =
    invoice.status !== 'Paid' &&
    invoice.status !== 'Cancelled' &&
    new Date(invoice.dueDate) < new Date();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <Calendar className="h-5 w-5 text-slate-400" />
        Invoice Details
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Invoice Date</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatDate(invoice.invoiceDate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Due Date</span>
          <span
            className={`font-medium ${
              isOverdue
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatDate(invoice.dueDate)}
          </span>
        </div>
        {invoice.periodStart && invoice.periodEnd && (
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Billing Period</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Payment Terms</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {invoice.terms || 'Net 30'}
          </span>
        </div>
      </div>
    </div>
  );
}

function LineItemsTable({ lineItems }: { lineItems: InvoiceLineItem[] }) {
  if (!lineItems || lineItems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Line Items
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400">
          No line items
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Line Items
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Qty/Hours
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rate
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {lineItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {item.type === 'time' ? (
                      <Clock className="h-4 w-4 text-blue-500" />
                    ) : item.type === 'expense' ? (
                      <Receipt className="h-4 w-4 text-purple-500" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-slate-900 dark:text-white">
                      {item.description}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {item.date ? formatDate(item.date) : '-'}
                </td>
                <td className="px-6 py-4 text-right text-slate-900 dark:text-white">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                  {formatCurrency(item.rate)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Summary
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Time Charges</span>
          <span className="text-slate-900 dark:text-white">
            {formatCurrency(invoice.timeCharges)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Expenses</span>
          <span className="text-slate-900 dark:text-white">
            {formatCurrency(invoice.expenseCharges)}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
          <span className="text-slate-900 dark:text-white">
            {formatCurrency(invoice.subtotal)}
          </span>
        </div>
        {invoice.discountAmount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{formatCurrency(invoice.discountAmount)}</span>
          </div>
        )}
        {invoice.taxAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              Tax ({(invoice.taxRate || 0) * 100}%)
            </span>
            <span className="text-slate-900 dark:text-white">
              {formatCurrency(invoice.taxAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
          <span className="font-semibold text-slate-900 dark:text-white">Total</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>
        {invoice.paidAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Paid</span>
            <span>-{formatCurrency(invoice.paidAmount)}</span>
          </div>
        )}
        {invoice.balanceDue > 0 && (
          <div className="flex justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
            <span className="font-semibold text-red-600 dark:text-red-400">
              Balance Due
            </span>
            <span className="font-bold text-red-600 dark:text-red-400">
              {formatCurrency(invoice.balanceDue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentHistory({ payments }: { payments?: InvoicePayment[] }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <CreditCard className="h-5 w-5 text-slate-400" />
          Payment History
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400">
          No payments recorded
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <CreditCard className="h-5 w-5 text-slate-400" />
        Payment History
      </h2>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-700"
          >
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {payment.method}
                {payment.reference && ` - ${payment.reference}`}
              </p>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {formatDate(payment.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function InvoiceContent({ id }: { id: string }) {
  const result = await getInvoiceById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const invoice = result.data;

  return (
    <div className="space-y-6">
      <InvoiceHeader invoice={invoice} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <LineItemsTable lineItems={invoice.lineItems || []} />
          {invoice.notes && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-2 font-semibold text-slate-900 dark:text-white">
                Notes
              </h2>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <ClientInfo invoice={invoice} />
          <InvoiceDates invoice={invoice} />
          <InvoiceSummary invoice={invoice} />
          <PaymentHistory payments={invoice.payments} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function InvoiceDetailPage({ params }: PageProps) {
  // Next.js 16: Await params
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/billing"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Billing
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Link
              href="/billing/invoices"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Invoices
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">
              Invoice Details
            </span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                    />
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <InvoiceContent id={resolvedParams.id} />
        </Suspense>
      </div>
    </div>
  );
}
