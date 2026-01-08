'use client';

/**
 * Admin Section Error Boundary
 * Handles errors in admin routes with recovery options
 */

import { AlertTriangle, ArrowLeft, Home, RefreshCw, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log admin errors with additional context
    console.error('Admin Section Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const isDevMode = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">Admin Panel Error</h1>
                <p className="text-red-100 text-sm">
                  Something went wrong while loading the administration panel
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Development Error Details */}
            {isDevMode && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                  Development Error Details
                </h3>
                <p className="text-sm text-red-900 dark:text-red-300 font-mono break-words bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-red-700 dark:text-red-400">
                    Error ID: {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-sm text-red-700 dark:text-red-400 cursor-pointer hover:text-red-800 dark:hover:text-red-300 font-medium">
                      Show stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-red-800 dark:text-red-300 overflow-auto max-h-48 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Production Error Reference */}
            {!isDevMode && error.digest && (
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Error Reference
                  </h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Error ID: <span className="font-mono font-semibold">{error.digest}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Possible Solutions
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">1.</span>
                  <span>Try refreshing the page to reload admin data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">2.</span>
                  <span>Check your network connection and backend API status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">3.</span>
                  <span>Verify you have admin permissions for this section</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">4.</span>
                  <span>Contact system administrator if the problem persists</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg"
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
                onClick={() => router.push('/')}
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
