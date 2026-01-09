/**
 * Write-Off Requests List Page - Server Component
 *
 * Displays all write-off requests with filtering, search, and approval workflow.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/write-offs/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileX,
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
} from 'lucide-react';
import {
  getWriteOffRequests,
  getWriteOffStats,
} from '../write-off-actions';
import {
  type WriteOffRequest,
  type WriteOffFilters,
  type WriteOffStats,
  type WriteOffStatus,
  WRITE_OFF_CATEGORIES,
} from '../write-off-types';

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Write-Off Requests | Billing | LexiFlow',
    description: 'Manage write-off requests, approval workflow, and AR adjustments',
  };
}

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    status?: string;
    invoiceId?: string;
    clientId?: string;
    search?: string;
    page?: string;
    category?: string;
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

function getStatusColor(status: WriteOffStatus): string {
  const statusColors: Record<WriteOffStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return statusColors[status] || statusColors.pending;
}

function getStatusIcon(status: WriteOffStatus) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function getStatusLabel(status: WriteOffStatus): string {
  const labels: Record<WriteOffStatus, string> = {
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return labels[status] || status;
}

function getCategoryLabel(category?: string): string {
  if (!category) return 'Not specified';
  const found = WRITE_OFF_CATEGORIES.find((c) => c.value === category);
  return found?.label || category;
}

// =============================================================================
// Components
// =============================================================================

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  icon?: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    green: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
    yellow: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
    red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    purple: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
  };

  const valueColors = {
    blue: 'text-blue-700 dark:text-blue-400',
    green: 'text-emerald-700 dark:text-emerald-400',
    yellow: 'text-amber-700 dark:text-amber-400',
    red: 'text-red-700 dark:text-red-400',
    purple: 'text-purple-700 dark:text-purple-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        {icon}
      </div>
      <p className={`mt-1 text-2xl font-bold ${valueColors[color]}`}>{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

function WriteOffRow({ writeOff }: { writeOff: WriteOffRequest }) {
  return (
    <Link
      href={`/billing/write-offs/${writeOff.id}`}
      className="group flex items-center justify-between border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <FileX className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {writeOff.invoiceNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                writeOff.status
              )}`}
            >
              {getStatusIcon(writeOff.status)}
              {getStatusLabel(writeOff.status)}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{writeOff.clientName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1">
            {writeOff.reason}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(writeOff.amount)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {getCategoryLabel(writeOff.category)}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <User className="h-3 w-3" />
            <span>{writeOff.requestedByName || writeOff.requestedBy}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(writeOff.requestedDate)}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function FilterBar({ filters }: { filters: WriteOffFilters }) {
  const statuses: WriteOffStatus[] = ['pending', 'approved', 'rejected'];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search write-offs by invoice, client, or reason..."
          defaultValue=""
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
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <select
          defaultValue={filters.category || ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="">All Categories</option>
          {WRITE_OFF_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
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

async function WriteOffStatsSection() {
  const result = await getWriteOffStats();
  const stats: WriteOffStats = result.data || {
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalPendingAmount: 0,
    totalApprovedAmount: 0,
    totalRejectedAmount: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Requests"
        value={stats.totalRequests}
        color="blue"
        icon={<FileX className="h-5 w-5 text-blue-500" />}
      />
      <StatCard
        title="Pending Approval"
        value={stats.pendingCount}
        subtitle={formatCurrency(stats.totalPendingAmount)}
        color="yellow"
        icon={<Clock className="h-5 w-5 text-amber-500" />}
      />
      <StatCard
        title="Approved"
        value={formatCurrency(stats.totalApprovedAmount)}
        subtitle={`${stats.approvedCount} requests`}
        color="green"
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
      />
      <StatCard
        title="Rejected"
        value={stats.rejectedCount}
        subtitle={formatCurrency(stats.totalRejectedAmount)}
        color="red"
        icon={<XCircle className="h-5 w-5 text-red-500" />}
      />
    </div>
  );
}

async function WriteOffList({ filters }: { filters: WriteOffFilters }) {
  const result = await getWriteOffRequests(filters);
  const writeOffs = result.data || [];

  if (writeOffs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-700">
          <FileX className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No write-off requests found
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a write-off request to adjust invoice balances
        </p>
        <Link
          href="/billing/write-offs/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Write-Off Request
        </Link>
      </div>
    );
  }

  // Group by status for better organization
  const pendingWriteOffs = writeOffs.filter((w) => w.status === 'pending');
  const otherWriteOffs = writeOffs.filter((w) => w.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Approval Section */}
      {pendingWriteOffs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white dark:border-amber-800 dark:bg-slate-800">
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              Pending Approval ({pendingWriteOffs.length})
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {pendingWriteOffs.map((writeOff) => (
              <WriteOffRow key={writeOff.id} writeOff={writeOff} />
            ))}
          </div>
        </div>
      )}

      {/* All Write-Offs Section */}
      {otherWriteOffs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Processed Requests ({otherWriteOffs.length})
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Sort by: Date</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {otherWriteOffs.map((writeOff) => (
              <WriteOffRow key={writeOff.id} writeOff={writeOff} />
            ))}
          </div>
        </div>
      )}

      {/* Show all in one section if no pending */}
      {pendingWriteOffs.length === 0 && otherWriteOffs.length === 0 && writeOffs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {writeOffs.length} write-off request{writeOffs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {writeOffs.map((writeOff) => (
              <WriteOffRow key={writeOff.id} writeOff={writeOff} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WriteOffsPage({ searchParams }: PageProps) {
  // Next.js 16: Await searchParams
  const resolvedSearchParams = await searchParams;

  const filters: WriteOffFilters = {
    status: resolvedSearchParams.status,
    invoiceId: resolvedSearchParams.invoiceId,
    clientId: resolvedSearchParams.clientId,
    category: resolvedSearchParams.category,
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
                <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                  <FileX className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Write-Off Requests
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage write-off requests and AR adjustments
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/billing/write-offs/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Write-Off Request
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <WriteOffStatsSection />
          </Suspense>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <FilterBar filters={filters} />
        </section>

        {/* Write-Off List */}
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
            <WriteOffList filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
