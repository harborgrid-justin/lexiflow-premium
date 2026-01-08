'use client';

/**
 * Billing Error Boundary
 *
 * Catches errors in billing routes and provides recovery options.
 */

import { AlertTriangle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BillingError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Billing Error:', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-white/20 p-3">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Billing Error</h1>
                <p className="mt-1 text-red-100">
                  Something went wrong loading the billing module.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="mb-2 text-sm font-medium text-red-900 dark:text-red-300">
                  Error Details:
                </p>
                <p className="font-mono text-sm text-red-800 dark:text-red-400">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-500">
                    ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>This could be due to:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>A temporary server issue</li>
                <li>Network connectivity problems</li>
                <li>Data loading failure</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
