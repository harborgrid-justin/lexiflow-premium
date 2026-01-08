'use client';

/**
 * Research Detail Error Boundary
 *
 * @module research/[id]/error
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft, Search } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResearchDetailError({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Unable to Load Research
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We could not load this research item. It may have been deleted or you
            may not have permission to view it.
          </p>

          {error.digest && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
              <Link
                href="/research"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                <Search className="h-4 w-4" />
                Research
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
