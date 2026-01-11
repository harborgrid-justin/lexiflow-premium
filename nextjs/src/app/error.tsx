'use client';

/**
 * Root Error Boundary - Enterprise Grade
 *
 * Catches all unhandled errors in the application root.
 * Provides user-friendly error UI with recovery options.
 *
 * Next.js 16 Compliance:
 * - Client Component (error boundaries must be client-side)
 * - Implements error/reset props interface
 * - Provides error logging for monitoring
 * - Graceful degradation with recovery options
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry, DataDog)
    console.error('Root Error Boundary:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    
    // Sentry.captureException(error);
  }, [error]);

  const isDevMode = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Something went wrong
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  We encountered an unexpected error
                </p>
              </div>
            </div>

            {/* Error Details (Development Only) */}
            {isDevMode && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2 mb-2">
                  <Bug className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                      Error Details (Development Mode)
                    </h2>
                    <p className="text-sm text-red-800 dark:text-red-400 font-mono break-all">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </div>
                </div>
                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-sm text-red-700 dark:text-red-400 cursor-pointer hover:text-red-800 dark:hover:text-red-300">
                      View stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-800 dark:text-red-400 overflow-auto max-h-64 p-3 bg-red-100 dark:bg-red-900/30 rounded">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Production Error Message */}
            {!isDevMode && error.digest && (
              <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Error ID: <span className="font-mono text-slate-900 dark:text-white">{error.digest}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                <Home className="h-5 w-5" />
                Go Home
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                If this problem persists, please{' '}
                <a
                  href="/support"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
