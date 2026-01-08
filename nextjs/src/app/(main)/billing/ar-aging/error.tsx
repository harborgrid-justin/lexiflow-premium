'use client';

/**
 * AR Aging Error State
 *
 * Error boundary component for the AR aging page.
 * Provides user-friendly error display and recovery options.
 *
 * @module billing/ar-aging/error
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ARAgingError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('AR Aging error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Unable to Load AR Aging Data
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            There was an error loading the accounts receivable aging analysis.
            This might be a temporary issue.
          </p>
          {error.message && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-left text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-medium">Error details:</p>
              <p className="mt-1 font-mono text-xs">{error.message}</p>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/billing"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Billing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
