/**
 * Invoices List Page - Server Component
 *
 * Displays all invoices with filtering, search, and CRUD operations.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/invoices/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  MoreVertical,
  ChevronRight,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { getInvoices, getInvoiceStats } from '../actions';
import type { Invoice, InvoiceStats, InvoiceStatus, InvoiceFilters } from '../types';

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Invoices | Billing | LexiFlow',
    description: 'Manage client invoices, track payments, and send billing statements',
  };
}

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    caseId?: string;
    clientId?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
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
    month: 'short',
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

function getStatusIcon(status: InvoiceStatus | string) {
  switch (status) {
    case 'Paid':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'Overdue':
      return <AlertTriangle className="h-4 w-4" />;
    case 'Sent':
      return <Send className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

// =============================================================================
// Components
// =============================================================================

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    green: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
    yellow: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
    red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
  };

  const valueColors = {
    blue: 'text-blue-700 dark:text-blue-400',
    green: 'text-emerald-700 dark:text-emerald-400',
    yellow: 'text-amber-700 dark:text-amber-400',
    red: 'text-red-700 dark:text-red-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${valueColors[color]}`}>{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const isOverdue =
    invoice.status !== 'Paid' &&
    invoice.status !== 'Cancelled' &&
    new Date(invoice.dueDate) < new Date();

  return (
    <Link
      href={`/billing/invoices/${invoice.id}`}
      className="group flex items-center justify-between border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                isOverdue && invoice.status !== 'Paid' ? 'Overdue' : invoice.status
              )}`}
            >
              {getStatusIcon(isOverdue && invoice.status !== 'Paid' ? 'Overdue' : invoice.status)}
              {isOverdue && invoice.status !== 'Paid' ? 'Overdue' : invoice.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.clientName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {invoice.matterDescription}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(invoice.totalAmount)}
          </p>
          {invoice.balanceDue > 0 && invoice.balanceDue !== invoice.totalAmount && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {formatCurrency(invoice.balanceDue)} due
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {formatDate(invoice.invoiceDate)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Due: {formatDate(invoice.dueDate)}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function FilterBar({ filters }: { filters: InvoiceFilters }) {
  const statuses = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search invoices..."
          defaultValue={filters.caseId || ''}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          defaultValue={filters.status || ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
}

async function InvoiceStats() {
  const result = await getInvoiceStats();
  const stats: InvoiceStats = result.data || {
    total: 0,
    outstanding: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <StatCard title="Total Invoices" value={stats.total} color="blue" />
      <StatCard
        title="Outstanding"
        value={formatCurrency(stats.outstandingAmount)}
        subtitle={`${stats.outstanding} invoices`}
        color="yellow"
      />
      <StatCard
        title="Collected"
        value={formatCurrency(stats.paidAmount)}
        subtitle={`${stats.paid} paid`}
        color="green"
      />
      <StatCard
        title="Overdue"
        value={stats.overdue}
        subtitle="invoices"
        color="red"
      />
    </div>
  );
}

async function InvoiceList({ filters }: { filters: InvoiceFilters }) {
  const result = await getInvoices(filters);
  const invoices = result.data || [];

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-700">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No invoices found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Get started by creating your first invoice
        </p>
        <Link
          href="/billing/invoices/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Sort by: Date</span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {invoices.map((invoice) => (
          <InvoiceRow key={invoice.id} invoice={invoice} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function InvoicesPage({ searchParams }: PageProps) {
  // Next.js 16: Await searchParams
  const resolvedSearchParams = await searchParams;

  const filters: InvoiceFilters = {
    caseId: resolvedSearchParams.caseId,
    clientId: resolvedSearchParams.clientId,
    status: resolvedSearchParams.status,
  };

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
                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Invoices
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create, send, and track client invoices
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/billing/invoices/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <section className="mb-6">
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <InvoiceStats />
          </Suspense>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <FilterBar filters={filters} />
        </section>

        {/* Invoice List */}
        <section>
          <Suspense
            fallback={
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <InvoiceList filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
