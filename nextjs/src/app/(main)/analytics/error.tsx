'use client';

/**
 * Analytics Error Boundary
 * Handles errors in the analytics section with recovery options
 *
 * Next.js 16 file convention for error boundaries
 */

import { Button } from '@/components/ui/shadcn/button';
import { AlertTriangle, ArrowLeft, BarChart3, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalyticsError({ error, reset }: ErrorProps): React.JSX.Element {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Analytics Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Title and Description */}
          <h1 className="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">
            Analytics Unavailable
          </h1>
          <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
            We encountered an error while loading the analytics data. This might be a temporary
            issue.
          </p>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-700">
              <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Error Details:
              </p>
              <p className="break-words font-mono text-xs text-red-600 dark:text-red-400">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-slate-500">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={reset} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            If this problem persists, please contact support.
          </p>
        </div>

        {/* Analytics Icon Badge */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 dark:bg-slate-700">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Analytics Module
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
