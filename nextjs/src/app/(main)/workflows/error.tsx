'use client';

/**
 * Workflows Error Boundary
 *
 * Catches errors in workflow routes and provides recovery options.
 *
 * Next.js 16 Compliance:
 * - Client Component (required for error boundaries)
 * - Implements error/reset props interface
 *
 * @module app/(main)/workflows/error
 */

import { AlertTriangle, ArrowLeft, Home, RefreshCw, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function WorkflowsError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error for debugging
    console.error('Workflows Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const isDevMode = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold mb-1">Workflow Error</h1>
                <p className="text-red-100 text-sm">
                  Something went wrong while loading workflows
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Development Error Details */}
            {isDevMode && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                      Error Details (Development)
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-300 font-mono break-words bg-red-100 dark:bg-red-900/30 p-2 rounded">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="mt-2 text-xs text-red-700 dark:text-red-400">
                        Digest: {error.digest}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Production Error Reference */}
            {!isDevMode && error.digest && (
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Error Reference: <span className="font-mono font-semibold">{error.digest}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Suggestions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                What you can try:
              </h3>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">1.</span>
                  <span>Refresh the page to try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">2.</span>
                  <span>Check your internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">3.</span>
                  <span>Return to the dashboard and try again</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
              <button
                onClick={() => router.push('/workflows')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-all"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Need help?{' '}
              <a
                href="/support"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
