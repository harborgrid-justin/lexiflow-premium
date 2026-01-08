/**
 * New Write-Off Request Page - Server Component
 *
 * Form to create a new write-off request.
 * Follows Next.js 16 strict requirements with async params handling.
 *
 * @module billing/write-offs/new/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, FileX } from 'lucide-react';
import { NewWriteOffForm } from './new-write-off-form';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'New Write-Off Request | Billing | LexiFlow',
  description: 'Create a new write-off request for invoice adjustment',
};

// =============================================================================
// Types
// =============================================================================

interface PageProps {
  searchParams: Promise<{
    invoiceId?: string;
    invoiceNumber?: string;
    clientName?: string;
    balanceDue?: string;
  }>;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function NewWriteOffPage({ searchParams }: PageProps) {
  // Next.js 16: Await searchParams
  const resolvedSearchParams = await searchParams;

  // Pre-fill invoice data if provided (e.g., navigating from invoice detail)
  const prefillData = {
    invoiceId: resolvedSearchParams.invoiceId || '',
    invoiceNumber: resolvedSearchParams.invoiceNumber || '',
    clientName: resolvedSearchParams.clientName || '',
    balanceDue: resolvedSearchParams.balanceDue
      ? parseFloat(resolvedSearchParams.balanceDue)
      : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-3xl">
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
              New Request
            </span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
            <FileX className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              New Write-Off Request
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Submit a request to write off invoice balance
            </p>
          </div>
        </div>

        <NewWriteOffForm prefillData={prefillData} />
      </div>
    </div>
  );
}
