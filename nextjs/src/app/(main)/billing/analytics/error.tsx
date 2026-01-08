'use client';

/**
 * Billing Analytics Error Boundary
 *
 * Error handling UI for the analytics dashboard.
 *
 * @module billing/analytics/error
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft, BarChart3 } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BillingAnalyticsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Billing Analytics Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <Link
              href="/billing"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/20">
              <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Billing Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Profitability, realization, and performance metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Unable to Load Analytics
          </h2>

          <p className="mt-4 text-slate-600 dark:text-slate-400">
            We encountered an error while loading the billing analytics dashboard.
            This could be due to a temporary connection issue or a problem with the
            analytics service.
          </p>

          {error.message && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Error Details:
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <Link
              href="/billing"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Billing
            </Link>
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-left dark:border-slate-700 dark:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Troubleshooting Steps
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Check your internet connection and try refreshing the page
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Wait a few moments and try again - the service may be temporarily unavailable
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Clear your browser cache and cookies, then reload the page
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                If the problem persists, contact support with the error ID above
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
