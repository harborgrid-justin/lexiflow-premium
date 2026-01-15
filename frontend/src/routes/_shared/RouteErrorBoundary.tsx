/**
 * Route Error Boundary Components
 *
 * Provides consistent error handling UI across all routes with:
 * - 404 Not Found handling
 * - 403 Forbidden handling
 * - Generic error display
 * - Retry functionality
 * - Navigation back to safe pages
 *
 * @module routes/_shared/RouteErrorBoundary
 */

import { useTheme } from "@/hooks/useTheme";
import { Link, isRouteErrorResponse } from 'react-router';
import type { RouteErrorBoundaryProps } from './types';

// ============================================================================
// Error Icon Component
// ============================================================================

function ErrorIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

// ============================================================================
// 404 Not Found Error
// ============================================================================

interface NotFoundErrorProps {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
}

export function NotFoundError({
  title = 'Not Found',
  message = 'The page you are looking for does not exist or has been moved.',
  backTo = '/',
  backLabel = 'Go Home',
}: NotFoundErrorProps) {
  const { theme } = useTheme();
  // Ensure backTo is always a valid path string
  const safePath = backTo && typeof backTo === 'string' && backTo.trim() !== '' ? backTo : '/';

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        <h1 className={`mb-4 text-6xl font-bold ${theme.text.tertiary}`}>
          404
        </h1>
        <h2 className={`mb-2 text-2xl font-semibold ${theme.text.primary}`}>
          {title}
        </h2>
        <p className={`mb-6 max-w-md ${theme.text.secondary}`}>
          {message}
        </p>
        <Link
          to={safePath}
          className="inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: theme.primary.DEFAULT }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// 403 Forbidden Error
// ============================================================================

interface ForbiddenErrorProps {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
}

export function ForbiddenError({
  title = 'Access Denied',
  message = 'You do not have permission to view this page.',
  backTo = '/',
  backLabel = 'Go Home',
}: ForbiddenErrorProps) {
  // Ensure backTo is always a valid path string
  const safePath = backTo && typeof backTo === 'string' && backTo.trim() !== '' ? backTo : '/';

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
          <svg
            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
          {message}
        </p>
        <Link
          to={safePath}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Generic Error Component
// ============================================================================

interface GenericErrorProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  backTo?: string;
  backLabel?: string;
  showDetails?: boolean;
}

export function GenericError({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  backTo = '/',
  backLabel = 'Go Home',
  showDetails = true,
}: GenericErrorProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Ensure backTo is always a valid path string
  const safePath = backTo && typeof backTo === 'string' && backTo.trim() !== '' ? backTo : '/';

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/40">
              <ErrorIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
              {title}
            </h2>
          </div>

          <p className="mb-4 text-red-700 dark:text-red-300">{message}</p>

          {showDetails && !!error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200">
                Error Details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-3 text-xs text-red-900 dark:bg-red-900/40 dark:text-red-100">
                {errorMessage}
                {errorStack && `\n\n${errorStack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}
            <Link
              to={safePath}
              className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Route Error Boundary
// ============================================================================

/**
 * Universal route error boundary that handles all error types
 * Use this as the ErrorBoundary export in route files
 *
 * @example
 * ```tsx
 * export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
 *   return <RouteErrorBoundary error={error} backTo="/cases" backLabel="Back to Cases" />;
 * }
 * ```
 */
export function RouteErrorBoundary({
  error,
  title,
  message,
  onRetry,
  backTo = '/',
  backLabel = 'Go Home',
}: RouteErrorBoundaryProps) {
  // Handle Response errors (thrown from loaders/actions)
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <NotFoundError
          title={title || 'Not Found'}
          message={message || error.statusText || 'The requested resource was not found.'}
          backTo={backTo}
          backLabel={backLabel}
        />
      );
    }

    if (error.status === 403) {
      return (
        <ForbiddenError
          title={title || 'Access Denied'}
          message={message || error.statusText || 'You do not have permission to access this resource.'}
          backTo={backTo}
          backLabel={backLabel}
        />
      );
    }

    if (error.status === 401) {
      return (
        <ForbiddenError
          title={title || 'Authentication Required'}
          message={message || 'Please log in to access this page.'}
          backTo="/login"
          backLabel="Log In"
        />
      );
    }

    // Generic HTTP error
    return (
      <GenericError
        title={title || `Error ${error.status}`}
        message={message || error.statusText || 'An error occurred.'}
        onRetry={onRetry}
        backTo={backTo}
        backLabel={backLabel}
        showDetails={false}
      />
    );
  }

  // Handle regular JavaScript errors
  return (
    <GenericError
      title={title}
      message={message}
      error={error}
      onRetry={onRetry}
      backTo={backTo}
      backLabel={backLabel}
    />
  );
}
