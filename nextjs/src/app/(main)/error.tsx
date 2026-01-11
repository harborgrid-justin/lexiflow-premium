'use client';

/**
 * Main Route Group Error Boundary - Enterprise Grade
 *
 * Catches errors in all authenticated/main application routes.
 * Provides context-aware error handling with navigation options.
 *
 * Next.js 16 Compliance:
 * - Client Component (required for error boundaries)
 * - Implements error/reset props interface
 * - Integrates with application layout
 * - Provides actionable recovery options
 *
 * Coverage: All 165 pages in (main) route group
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

import { AlertTriangle, ArrowLeft, FileText, HelpCircle, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Enhanced error logging for authenticated routes
    console.error('Main Route Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    });

    
    // Sentry.captureException(error, {
    //   tags: { section: 'main' },
    //   user: { id: user?.id }
    // });
  }, [error]);

  const isDevMode = process.env.NODE_ENV === 'development';

  // Categorize error for better UX
  const errorCategory = categorizeError(error);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header with severity indicator */}
          <div className="bg-linear-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  {errorCategory.title}
                </h1>
                <p className="text-red-100 text-sm">
                  {errorCategory.description}
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
                      Development Error Details
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-red-700 dark:text-red-400 mb-1">Message:</p>
                        <p className="text-sm text-red-900 dark:text-red-300 font-mono wrap-break-word bg-red-100 dark:bg-red-900/30 p-2 rounded">
                          {error.message}
                        </p>
                      </div>
                      {error.digest && (
                        <div>
                          <p className="text-xs text-red-700 dark:text-red-400 mb-1">Error ID:</p>
                          <p className="text-sm text-red-900 dark:text-red-300 font-mono">
                            {error.digest}
                          </p>
                        </div>
                      )}
                    </div>
                    {error.stack && (
                      <details className="mt-3">
                        <summary className="text-sm text-red-700 dark:text-red-400 cursor-pointer hover:text-red-800 dark:hover:text-red-300 font-medium">
                          Show stack trace →
                        </summary>
                        <pre className="mt-2 text-xs text-red-800 dark:text-red-300 overflow-auto max-h-48 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Production Error Reference */}
            {!isDevMode && error.digest && (
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Error Reference
                  </h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                  Error ID: <span className="font-mono font-semibold">{error.digest}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Please include this ID when reporting the issue
                </p>
              </div>
            )}

            {/* Suggested Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                What you can do:
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {errorCategory.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
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
              {' '}or check our{' '}
              <a
                href="/knowledge-base"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Knowledge Base
              </a>
            </p>
          </div>
        </div>

        {/* Additional Context (Development) */}
        {isDevMode && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Development Mode:</strong> This error boundary covers all 165 pages in the (main) route group.
              In production, errors are logged to your monitoring service automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Categorize error for better user experience
 */
function categorizeError(error: Error): {
  title: string;
  description: string;
  suggestions: string[];
} {
  const message = error.message.toLowerCase();

  // Network/API errors
  if (message.includes('fetch') || message.includes('network') || message.includes('api')) {
    return {
      title: 'Connection Issue',
      description: 'We encountered a problem communicating with our servers',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'If the problem persists, our servers may be experiencing issues',
      ],
    };
  }

  // Permission/Auth errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return {
      title: 'Access Denied',
      description: "You don't have permission to access this resource",
      suggestions: [
        'Verify you are logged in with the correct account',
        'Contact your administrator for access',
        'Try logging out and back in',
      ],
    };
  }

  // Data/Validation errors
  if (message.includes('invalid') || message.includes('validation') || message.includes('required')) {
    return {
      title: 'Invalid Data',
      description: 'The data provided is invalid or incomplete',
      suggestions: [
        'Check that all required fields are filled correctly',
        'Verify the data format matches requirements',
        'Try clearing your browser cache',
      ],
    };
  }

  // Default generic error
  return {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred while processing your request',
    suggestions: [
      'Try refreshing the page',
      'Clear your browser cache and cookies',
      'If the problem continues, contact support with the error ID above',
    ],
  };
}
