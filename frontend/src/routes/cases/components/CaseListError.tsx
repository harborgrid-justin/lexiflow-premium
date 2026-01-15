/**
 * Case List Error - Error Boundary Fallback
 *
 * ENTERPRISE ARCHITECTURE:
 * - Await errorElement
 * - Graceful degradation
 * - Recovery options
 * - User feedback
 *
 * @module routes/cases/components/CaseListError
 */

import { Button } from '@/components/atoms/Button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Link, useAsyncError } from 'react-router';

export function CaseListError() {
  const error = useAsyncError();

  const errorMessage = error instanceof Error
    ? error.message
    : 'Failed to load case data';

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h2 className="text-2xl font-semibold mb-2">
        Failed to Load Cases
      </h2>

      <p className="text-muted-foreground text-center max-w-md mb-6">
        {errorMessage}
      </p>

      <div className="flex gap-3">
        <Button
          onClick={() => window.location.reload()}
          variant="primary"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>

        <Link to="/" className="inline-block">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>

      {/* Technical details for debugging */}
      {import.meta.env.DEV && (
        <details className="mt-8 text-left w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Technical Details (Dev Only)
          </summary>
          <pre className="mt-2 p-4 bg-secondary rounded-md overflow-auto text-xs">
            {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
