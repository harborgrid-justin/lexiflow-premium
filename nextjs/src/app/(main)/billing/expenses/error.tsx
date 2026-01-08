'use client';

/**
 * Expenses Error Boundary
 */

import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ExpensesError({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Failed to Load Expenses
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          We couldn't load the expenses. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => router.push('/billing')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </button>
        </div>
      </div>
    </div>
  );
}
