// ================================================================================
// ENTERPRISE REACT ERROR BOUNDARY - DATA LAYER
// ================================================================================

/**
 * Data Error Provider
 *
 * Error boundary for data layer concerns (CRUD operations, domain logic).
 * Catches data-related errors and provides fallback UI.
 *
 * @module providers/data/errorprovider
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface DataErrorProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class DataErrorProvider extends Component<
  DataErrorProviderProps,
  ErrorBoundaryState
> {
  constructor(props: DataErrorProviderProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[DataErrorBoundary] Caught error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Report to error tracking service
    this.props.onError?.(error, errorInfo);

    // Log to localStorage for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      layer: 'data',
      error: {
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    };

    try {
      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      logs.push(errorLog);
      localStorage.setItem('errorLogs', JSON.stringify(logs.slice(-50))); // Keep last 50
    } catch (err) {
      console.error('[DataErrorBoundary] Failed to log error:', err);
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Data Error
                </h3>
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              <p className="mb-2">
                An error occurred while loading or processing data. This may be
                temporary.
              </p>
              {this.state.error && (
                <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={this.reset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  // Clear data caches
                  sessionStorage.clear();
                  this.reset();
                }}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Clear Cache
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                  Component Stack
                </summary>
                <pre className="mt-2 text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-32 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DataErrorProvider;
