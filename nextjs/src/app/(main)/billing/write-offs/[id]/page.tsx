/**
 * Write-Off Detail Page - Server Component
 *
 * Displays single write-off request with approval/rejection workflow.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/write-offs/[id]/page
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FileX,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  FileText,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  History,
} from 'lucide-react';
import {
  getWriteOffById,
} from '../../write-off-actions';
import {
  type WriteOffRequest,
  type WriteOffStatus,
  WRITE_OFF_CATEGORIES,
} from '../../write-off-types';
import { WriteOffActions } from './write-off-detail-actions';

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getWriteOffById(resolvedParams.id);

  if (!result.success || !result.data) {
    return { title: 'Write-Off Not Found | LexiFlow' };
  }

  return {
    title: `Write-Off - ${result.data.invoiceNumber} | LexiFlow`,
    description: `Write-off request details for ${result.data.clientName}`,
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

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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
      return <CheckCircle2 className="h-5 w-5" />;
    case 'rejected':
      return <XCircle className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
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

function WriteOffHeader({ writeOff }: { writeOff: WriteOffRequest }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Write-Off Request
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
              writeOff.status
            )}`}
          >
            {getStatusIcon(writeOff.status)}
            {getStatusLabel(writeOff.status)}
          </span>
        </div>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Invoice: {writeOff.invoiceNumber} - {writeOff.clientName}
        </p>
      </div>
      <WriteOffActions writeOff={writeOff} />
    </div>
  );
}

function WriteOffAmount({ writeOff }: { writeOff: WriteOffRequest }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <DollarSign className="h-5 w-5 text-slate-400" />
        Write-Off Amount
      </h2>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(writeOff.amount)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Amount to be written off
          </p>
        </div>
        {writeOff.impactedArAmount && (
          <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">AR Impact</span>
              <span className="font-medium text-slate-900 dark:text-white">
                -{formatCurrency(writeOff.impactedArAmount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceInfo({ writeOff }: { writeOff: WriteOffRequest }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <FileText className="h-5 w-5 text-slate-400" />
        Invoice Details
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Invoice Number</span>
          <Link
            href={`/billing/invoices/${writeOff.invoiceId}`}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {writeOff.invoiceNumber}
          </Link>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Client</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {writeOff.clientName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Category</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {getCategoryLabel(writeOff.category)}
          </span>
        </div>
      </div>
    </div>
  );
}

function RequestInfo({ writeOff }: { writeOff: WriteOffRequest }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <User className="h-5 w-5 text-slate-400" />
        Request Information
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Requested By</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {writeOff.requestedByName || writeOff.requestedBy}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Request Date</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatDateTime(writeOff.requestedDate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Created</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatDateTime(writeOff.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReasonSection({ writeOff }: { writeOff: WriteOffRequest }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <MessageSquare className="h-5 w-5 text-slate-400" />
        Reason for Write-Off
      </h2>
      <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">
        {writeOff.reason}
      </p>
      {writeOff.notes && (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Additional Notes
          </h3>
          <p className="whitespace-pre-line text-slate-600 dark:text-slate-400">
            {writeOff.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function ApprovalInfo({ writeOff }: { writeOff: WriteOffRequest }) {
  if (writeOff.status === 'pending') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">
              Awaiting Approval
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              This write-off request is pending review and approval.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (writeOff.status === 'approved') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
          Approved
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-emerald-700 dark:text-emerald-400">Approved By</span>
            <span className="font-medium text-emerald-900 dark:text-emerald-200">
              {writeOff.approvedByName || writeOff.approvedBy}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-700 dark:text-emerald-400">Approved Date</span>
            <span className="font-medium text-emerald-900 dark:text-emerald-200">
              {writeOff.approvedDate ? formatDateTime(writeOff.approvedDate) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (writeOff.status === 'rejected') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-red-800 dark:text-red-300">
          <XCircle className="h-5 w-5" />
          Rejected
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-red-700 dark:text-red-400">Rejected By</span>
            <span className="font-medium text-red-900 dark:text-red-200">
              {writeOff.rejectedByName || writeOff.rejectedBy}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700 dark:text-red-400">Rejected Date</span>
            <span className="font-medium text-red-900 dark:text-red-200">
              {writeOff.rejectedDate ? formatDateTime(writeOff.rejectedDate) : 'N/A'}
            </span>
          </div>
          {writeOff.rejectionReason && (
            <div className="border-t border-red-200 pt-3 dark:border-red-700">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Rejection Reason:
              </p>
              <p className="mt-1 text-red-800 dark:text-red-300">
                {writeOff.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function Timeline({ writeOff }: { writeOff: WriteOffRequest }) {
  const events = [
    {
      date: writeOff.createdAt,
      title: 'Request Created',
      description: `Write-off request submitted by ${writeOff.requestedByName || writeOff.requestedBy}`,
      icon: <FileX className="h-4 w-4" />,
      color: 'bg-slate-500',
    },
  ];

  if (writeOff.status === 'approved' && writeOff.approvedDate) {
    events.push({
      date: writeOff.approvedDate,
      title: 'Request Approved',
      description: `Approved by ${writeOff.approvedByName || writeOff.approvedBy}`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'bg-emerald-500',
    });
  }

  if (writeOff.status === 'rejected' && writeOff.rejectedDate) {
    events.push({
      date: writeOff.rejectedDate,
      title: 'Request Rejected',
      description: `Rejected by ${writeOff.rejectedByName || writeOff.rejectedBy}`,
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-500',
    });
  }

  // Sort by date descending (newest first)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        <History className="h-5 w-5 text-slate-400" />
        Activity Timeline
      </h2>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${event.color} text-white`}
            >
              {event.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">
                {event.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {event.description}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {formatDateTime(event.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function WriteOffContent({ id }: { id: string }) {
  const result = await getWriteOffById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const writeOff = result.data;

  return (
    <div className="space-y-6">
      <WriteOffHeader writeOff={writeOff} />

      {/* Approval Status Banner */}
      <ApprovalInfo writeOff={writeOff} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ReasonSection writeOff={writeOff} />
          <Timeline writeOff={writeOff} />
        </div>
        <div className="space-y-6">
          <WriteOffAmount writeOff={writeOff} />
          <InvoiceInfo writeOff={writeOff} />
          <RequestInfo writeOff={writeOff} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function WriteOffDetailPage({ params }: PageProps) {
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
              href="/billing/write-offs"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Write-Offs
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">
              Request Details
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
              <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                    />
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <WriteOffContent id={resolvedParams.id} />
        </Suspense>
      </div>
    </div>
  );
}
