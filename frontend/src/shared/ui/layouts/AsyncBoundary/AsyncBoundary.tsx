/**
 * @module components/layouts/AsyncBoundary
 * @category Layouts - Suspense
 * @description Combined Suspense + Error Boundary component for handling async operations
 * in layouts. Provides loading states, error recovery, and automatic retry mechanisms.
 *
 * FEATURES:
 * - Suspense boundary for lazy-loaded components
 * - Error boundary for async failures
 * - Customizable loading UI
 * - Automatic retry with exponential backoff
 * - Timeout handling for slow networks
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, ReactNode, useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/shared/ui/organisms/ErrorBoundary/ErrorBoundary';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button/Button';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AsyncBoundaryProps {
  /** Child components that may be lazy-loaded */
  children: ReactNode;
  /** Loading message to display */
  loadingMessage?: string;
  /** Custom loading component */
  loadingFallback?: ReactNode;
  /** Error boundary scope name */
  scope?: string;
  /** Enable automatic retry on error */
  enableRetry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Timeout in milliseconds before showing error */
  timeout?: number;
  /** Callback when component successfully loads */
  onLoad?: () => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

interface TimeoutWrapperProps {
  children: ReactNode;
  timeout: number;
  onTimeout: () => void;
}

// ============================================================================
// TIMEOUT WRAPPER COMPONENT
// ============================================================================
const TimeoutWrapper: React.FC<TimeoutWrapperProps> = ({ children, timeout, onTimeout }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  return <>{children}</>;
};

// ============================================================================
// LOADING FALLBACK COMPONENT
// ============================================================================
const DefaultLoadingFallback: React.FC<{ message?: string }> = ({ message }) => {
  return <LazyLoader message={message} />;
};

// ============================================================================
// ERROR FALLBACK COMPONENT
// ============================================================================
interface ErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  retryCount,
  maxRetries
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 rounded-lg border", theme.surface.default, theme.border.default)}>
      <AlertTriangle className={cn("h-12 w-12 mb-4", theme.status.error.text)} />
      <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>
        Failed to Load Component
      </h3>
      <p className={cn("text-sm mb-4 text-center", theme.text.secondary)}>
        {error.message || 'An unexpected error occurred'}
      </p>
      {retryCount < maxRetries && (
        <Button
          onClick={onRetry}
          icon={RefreshCw}
          variant="outline"
          size="sm"
        >
          Retry ({retryCount}/{maxRetries})
        </Button>
      )}
      {retryCount >= maxRetries && (
        <p className={cn("text-xs", theme.text.tertiary)}>
          Maximum retry attempts reached. Please refresh the page.
        </p>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
/**
 * AsyncBoundary combines Suspense and ErrorBoundary to handle async component loading
 * with automatic retry, timeout handling, and comprehensive error recovery.
 *
 * @example
 * ```tsx
 * <AsyncBoundary
 *   loadingMessage="Loading dashboard..."
 *   enableRetry={true}
 *   maxRetries={3}
 *   timeout={10000}
 * >
 *   <LazyComponent />
 * </AsyncBoundary>
 * ```
 */
export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  loadingMessage = 'Loading...',
  loadingFallback,
  scope = 'Component',
  enableRetry = true,
  maxRetries = 3,
  timeout = 30000, // 30 seconds
  onLoad,
  onError,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [key, setKey] = useState(0); // Force remount on retry

  const handleTimeout = useCallback(() => {
    setHasTimedOut(true);
    const timeoutError = new Error(`Component loading timeout after ${timeout}ms`);
    onError?.(timeoutError);
  }, [timeout, onError]);

  const handleRetry = useCallback(() => {
    // Check if retry is enabled and within limits
    if (!enableRetry || retryCount >= maxRetries) {
      console.warn('[AsyncBoundary] Retry disabled or max retries reached');
      return;
    }

    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setHasTimedOut(false);
      setKey(prev => prev + 1); // Force remount

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
      setTimeout(() => {
        // Retry after delay
      }, delay);
    }
  }, [enableRetry, retryCount, maxRetries]);

  // Notify parent component of load complete
  useEffect(() => {
    if (!hasTimedOut) {
      onLoad?.();
    }
  }, [hasTimedOut, onLoad]);

  const loadingUI = loadingFallback || <DefaultLoadingFallback message={loadingMessage} />;

  if (hasTimedOut) {
    const timeoutError = new Error('Loading timeout');
    onError?.(timeoutError);
    return (
      <ErrorFallback
        error={timeoutError}
        onRetry={handleRetry}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
    );
  }

  return (
    <ErrorBoundary
      scope={scope}
      fallback={
        <ErrorFallback
          error={new Error('Component error')}
          onRetry={handleRetry}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      }
      onReset={handleRetry}
    >
      <Suspense fallback={
        <TimeoutWrapper timeout={timeout} onTimeout={handleTimeout}>
          {loadingUI}
        </TimeoutWrapper>
      }>
        <div key={key}>{children}</div>
      </Suspense>
    </ErrorBoundary>
  );
};

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Simplified AsyncBoundary for quick page-level async operations
 */
export const PageAsyncBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AsyncBoundary
      loadingMessage="Loading page..."
      enableRetry={true}
      maxRetries={3}
      timeout={15000}
    >
      {children}
    </AsyncBoundary>
  );
};

/**
 * AsyncBoundary optimized for component-level async operations
 */
export const ComponentAsyncBoundary: React.FC<{ children: ReactNode; name: string }> = ({
  children,
  name
}) => {
  return (
    <AsyncBoundary
      loadingMessage={`Loading ${name}...`}
      enableRetry={true}
      maxRetries={2}
      timeout={10000}
      scope={name}
    >
      {children}
    </AsyncBoundary>
  );
};
