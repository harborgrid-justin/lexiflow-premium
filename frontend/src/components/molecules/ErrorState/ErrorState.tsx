/**
 * ErrorState.tsx
 *
 * Reusable error state component
 * Replaces repeated error UI patterns
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES
// ============================================================================
export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Custom className */
  className?: string;
  /** Center in container */
  centered?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ErrorState - Consistent error UI component
 *
 * @example
 * ```tsx
 * <ErrorState message="Failed to load data" onRetry={refetch} />
 * <ErrorState title="Connection Error" message="Please check your network" />
 * ```
 */
/**
 * ErrorState - React 18 optimized with React.memo
 */
export const ErrorState = React.memo<ErrorStateProps>(({
  title = 'Error',
  message = 'Something went wrong',
  onRetry,
  retryText = 'Retry',
  className,
  centered = true
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4',
        centered && 'justify-center p-10',
        className
      )}
    >
      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="text-center space-y-2">
        <h3 style={{ color: 'var(--color-text)' }} className="text-lg font-semibold">
          {title}
        </h3>
        <p style={{ color: 'var(--color-textMuted)' }} className="text-sm max-w-md">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          icon={RefreshCw}
          onClick={onRetry}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
});
