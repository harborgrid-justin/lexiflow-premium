/**
 * Collections Management Page - Server Component
 *
 * Manages collection activities for overdue invoices including
 * contact history, status tracking, and payment plan creation.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/collections/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight,
  DollarSign,
  Phone,
  Mail,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  FileText,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { getCollectionItems, getCollectionSummary } from '../ar-actions';
import type {
  CollectionItem,
  CollectionSummary,
  CollectionStatus,
  CollectionFilters,
  ContactType,
} from '../types';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Collections Management | Billing | LexiFlow',
  description:
    'Manage collection activities, track overdue invoices, and log client communications',
  keywords: ['collections', 'overdue invoices', 'accounts receivable', 'legal billing'],
};

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    clientId?: string;
    assignedTo?: string;
    search?: string;
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

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function getStatusColor(status: CollectionStatus | string): {
  bg: string;
  text: string;
  dot: string;
} {
  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    pending: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-500',
    },
    in_progress: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500',
    },
    promised: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
    },
    escalated: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500',
    },
    collected: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    write_off: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-500 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  return statusColors[status] || statusColors.pending;
}

function getPriorityColor(priority: string): {
  bg: string;
  text: string;
} {
  const priorityColors: Record<string, { bg: string; text: string }> = {
    low: {
      bg: 'bg-slate-100 dark:bg-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
    },
    medium: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
    },
    high: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-400',
    },
    critical: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
    },
  };

  return priorityColors[priority] || priorityColors.medium;
}

function getStatusLabel(status: CollectionStatus | string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    promised: 'Payment Promised',
    escalated: 'Escalated',
    collected: 'Collected',
    write_off: 'Write-Off',
  };
  return labels[status] || status;
}

function getContactTypeIcon(type: ContactType | string) {
  switch (type) {
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'letter':
      return <FileText className="h-4 w-4" />;
    case 'in_person':
      return <Users className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
}

// =============================================================================
// Components
// =============================================================================

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    yellow: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CollectionStatus | string }) {
  const colors = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {getStatusLabel(status)}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = getPriorityColor(priority);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function CollectionItemRow({ item }: { item: CollectionItem }) {
  const isOverdue = item.daysOverdue > 90;
  const needsFollowUp =
    item.nextFollowUpDate && new Date(item.nextFollowUpDate) <= new Date();

  return (
    <div className="group border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/clients/${item.clientId}`}
              className="font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
            >
              {item.clientName}
            </Link>
            <StatusBadge status={item.status} />
            <PriorityBadge priority={item.priority} />
            {needsFollowUp && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" />
                Follow-up due
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <Link
              href={`/billing/invoices/${item.invoiceId}`}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {item.invoiceNumber}
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span
              className={
                isOverdue
                  ? 'font-medium text-red-600 dark:text-red-400'
                  : ''
              }
            >
              {item.daysOverdue} days overdue
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Due: {formatDate(item.dueDate)}</span>
          </div>
          {item.lastContactDate && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              Last contact: {formatDate(item.lastContactDate)}
              {item.assignedToName && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Users className="h-3 w-3" />
                  Assigned to: {item.assignedToName}
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(item.amount)}
            </p>
            {item.amount !== item.originalAmount && (
              <p className="text-xs text-slate-500 line-through dark:text-slate-400">
                {formatCurrency(item.originalAmount)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/billing/collections/${item.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              Manage
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ filters }: { filters: CollectionFilters }) {
  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'promised', label: 'Payment Promised' },
    { value: 'escalated', label: 'Escalated' },
    { value: 'collected', label: 'Collected' },
  ];

  const priorities = [
    { value: '', label: 'All Priority' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client or invoice..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          defaultValue={filters.status || ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <select
          defaultValue={filters.priority || ''}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>
      <Link
        href="/billing/ar-aging"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
      >
        <TrendingUp className="h-4 w-4" />
        AR Aging
      </Link>
    </div>
  );
}

async function CollectionSummarySection() {
  const result = await getCollectionSummary();

  const summary: CollectionSummary = result.data || {
    totalItems: 0,
    totalAmount: 0,
    pendingCount: 0,
    inProgressCount: 0,
    promisedCount: 0,
    escalatedCount: 0,
    collectedThisMonth: 0,
    averageDaysOverdue: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryCard
        title="Total Outstanding"
        value={formatCurrency(summary.totalAmount)}
        subtitle={`${formatNumber(summary.totalItems)} items`}
        icon={<DollarSign className="h-5 w-5" />}
        color="blue"
      />
      <SummaryCard
        title="Pending"
        value={summary.pendingCount}
        subtitle="Needs action"
        icon={<Clock className="h-5 w-5" />}
        color="yellow"
      />
      <SummaryCard
        title="In Progress"
        value={summary.inProgressCount}
        subtitle="Being worked"
        icon={<Phone className="h-5 w-5" />}
        color="purple"
      />
      <SummaryCard
        title="Escalated"
        value={summary.escalatedCount}
        subtitle="High priority"
        icon={<AlertTriangle className="h-5 w-5" />}
        color="red"
      />
      <SummaryCard
        title="Collected (MTD)"
        value={formatCurrency(summary.collectedThisMonth)}
        subtitle="This month"
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="green"
      />
    </div>
  );
}

async function CollectionList({ filters }: { filters: CollectionFilters }) {
  const result = await getCollectionItems(filters);
  const items = result.data || [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-700 dark:bg-slate-800">
        <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No collections to manage
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All accounts are current. Great job!
        </p>
        <Link
          href="/billing/ar-aging"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <TrendingUp className="h-4 w-4" />
          View AR Aging
        </Link>
      </div>
    );
  }

  // Group items by priority
  const criticalItems = items.filter((item) => item.priority === 'critical');
  const highItems = items.filter((item) => item.priority === 'high');
  const otherItems = items.filter(
    (item) => item.priority !== 'critical' && item.priority !== 'high'
  );

  return (
    <div className="space-y-6">
      {/* Critical Priority */}
      {criticalItems.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-red-200 bg-white dark:border-red-800 dark:bg-slate-800">
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-700 dark:text-red-400">
                  Critical Priority
                </span>
                <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-800 dark:text-red-300">
                  {criticalItems.length}
                </span>
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {formatCurrency(criticalItems.reduce((sum, item) => sum + item.amount, 0))}
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {criticalItems.map((item) => (
              <CollectionItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* High Priority */}
      {highItems.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-orange-200 bg-white dark:border-orange-800 dark:bg-slate-800">
          <div className="border-b border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-orange-700 dark:text-orange-400">
                  High Priority
                </span>
                <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-800 dark:text-orange-300">
                  {highItems.length}
                </span>
              </div>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {formatCurrency(highItems.reduce((sum, item) => sum + item.amount, 0))}
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {highItems.map((item) => (
              <CollectionItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Other Items */}
      {otherItems.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Other Collections
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {otherItems.length}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {formatCurrency(otherItems.reduce((sum, item) => sum + item.amount, 0))}
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {otherItems.map((item) => (
              <CollectionItemRow key={item.id} item={item} />
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

export default async function CollectionsPage({ searchParams }: PageProps) {
  // Next.js 16: Await searchParams
  const resolvedSearchParams = await searchParams;

  const filters: CollectionFilters = {
    status: resolvedSearchParams.status,
    priority: resolvedSearchParams.priority,
    clientId: resolvedSearchParams.clientId,
    assignedTo: resolvedSearchParams.assignedTo,
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
                  <Phone className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Collections Management
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track and manage overdue invoice collections
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/billing/ar-aging"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <TrendingUp className="h-4 w-4" />
                AR Aging
              </Link>
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                <CreditCard className="h-4 w-4" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary Stats */}
        <section className="mb-6">
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <CollectionSummarySection />
          </Suspense>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <FilterBar filters={filters} />
        </section>

        {/* Collection Items */}
        <section>
          <Suspense
            fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                  />
                ))}
              </div>
            }
          >
            <CollectionList filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
