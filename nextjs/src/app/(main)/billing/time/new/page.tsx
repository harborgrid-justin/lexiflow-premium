/**
 * New Time Entry Page - Server Component
 *
 * Form to create a new time entry with timer functionality.
 * Follows Next.js 16 strict requirements.
 *
 * @module billing/time/new/page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { TimeEntryForm } from './time-entry-form';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'New Time Entry | Billing | LexiFlow',
  description: 'Create a new billable or non-billable time entry',
};

// =============================================================================
// Main Page Component
// =============================================================================

export default function NewTimeEntryPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <Link
              href="/billing"
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Billing
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Link
              href="/billing/time"
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Time Entries
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  New Time Entry
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Record billable time with optional timer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <TimeEntryForm />
      </div>
    </div>
  );
}
