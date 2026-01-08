'use client';

/**
 * Research Error Boundary
 * Catches errors in research routes and displays recovery options
 *
 * Next.js 16 Compliance:
 * - Client Component (required for error boundaries)
 * - Implements error/reset interface
 *
 * @module research/error
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Home,
  Search,
  HelpCircle,
} from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResearchError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error for monitoring
    console.error('Research Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const isDevMode = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Research Error</h1>
                <p className="mt-1 text-red-100 text-sm">
                  Something went wrong while loading your research
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Error Details (Development) */}
            {isDevMode && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                  Error Details
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 font-mono break-words">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Production Error Reference */}
            {!isDevMode && error.digest && (
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Error Reference: <span className="font-mono">{error.digest}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Please include this ID when contacting support
                </p>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4" />
                Suggestions
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  Try refreshing the page
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  Check your internet connection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  Clear your browser cache
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  If the problem persists, contact support
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Or navigate to:
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/research"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Research Home
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
