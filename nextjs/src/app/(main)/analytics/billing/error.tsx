'use client';

/**
 * Billing Analytics Error Boundary
 */

import { Button } from '@/components/ui/shadcn/button';
import { AlertTriangle, ArrowLeft, DollarSign, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BillingAnalyticsError({ error, reset }: ErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error('Billing Analytics Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Billing Analytics Unavailable
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Unable to load billing analytics data. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg bg-slate-100 p-4 text-left dark:bg-slate-700">
            <p className="break-words font-mono text-xs text-red-600 dark:text-red-400">
              {error.message}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <Button onClick={reset} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/analytics" className="block">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Button>
          </Link>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 dark:bg-slate-700">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Billing Analytics
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
