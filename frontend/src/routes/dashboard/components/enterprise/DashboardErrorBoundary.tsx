/**
 * @module enterprise/dashboard/DashboardErrorBoundary
 * @category Enterprise Dashboard
 * @description Error boundary component for dashboard widgets and sections
 * Provides graceful error handling with recovery options
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
  isolate?: boolean;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorDetails: boolean;
}

/**
 * DashboardErrorBoundary - Error boundary for dashboard components
 * Catches and handles errors gracefully with recovery options
 */
export class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Auto-reset if resetKeys change
    if (
      hasError &&
      resetKeys &&
      prevProps.resetKeys &&
      resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.handleReset();
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });

    this.props.onReset?.();
  };

  toggleErrorDetails = (): void => {
    this.setState((prevState) => ({
      showErrorDetails: !prevState.showErrorDetails,
    }));
  };

  override render(): ReactNode {
    const { hasError, error, errorInfo, showErrorDetails } = this.state;
    const { children, fallback, isolate = true, showDetails = true } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            ${isolate ? 'p-6 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20' : ''}
            ${!isolate ? 'min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-900/20 dark:to-red-900/10' : ''}
          `}
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/30 flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-2">
                  {isolate ? 'Widget Error' : 'Dashboard Error'}
                </h2>
                <p className="text-sm text-rose-700 dark:text-rose-300 mb-4">
                  {isolate
                    ? 'This widget encountered an error and could not be displayed.'
                    : 'The dashboard encountered an unexpected error.'}
                </p>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-4 border border-rose-200 dark:border-rose-800">
                  <p className="text-sm font-mono text-rose-800 dark:text-rose-200">
                    {error.message || 'An unknown error occurred'}
                  </p>
                </div>

                {showDetails && errorInfo && (
                  <div className="mb-4">
                    <button
                      onClick={this.toggleErrorDetails}
                      className="flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 transition-colors"
                    >
                      {showErrorDetails ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Error Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show Error Details
                        </>
                      )}
                    </button>

                    {showErrorDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 bg-white dark:bg-slate-900 rounded-lg p-4 border border-rose-200 dark:border-rose-800 overflow-auto max-h-64"
                      >
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                  {!isolate && (
                    <button
                      onClick={() => window.location.href = '/'}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg font-medium transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      Go Home
                    </button>
                  )}
                </div>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> This error has been logged. If the problem persists,
                    please contact support with the error details above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return children;
  }
}

/**
 * Hook to manually trigger error boundary
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};
