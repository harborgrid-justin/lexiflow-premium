// ================================================================================
// ENTERPRISE REACT ERROR BOUNDARY - APPLICATION LAYER
// ================================================================================

/**
 * Application Error Provider
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Error Boundaries + Recovery
 *
 * RESPONSIBILITIES:
 * • Catch application-level errors
 * • Provide fallback UI for app failures
 * • Log errors with context
 * • Report to error tracking
 * • Support error recovery
 *
 * CATCHES:
 * • Authentication errors
 * • Authorization errors
 * • State management errors
 * • Layout rendering errors
 * • User provider errors
 *
 * REACT 18 PATTERNS:
 * ✓ Class component (required for boundaries)
 * ✓ getDerivedStateFromError (safe)
 * ✓ componentDidCatch (effects)
 * ✓ Reset and retry capability
 * ✓ Custom fallback UI
 *
 * LAYERING:
 * • Nested inside InfrastructureErrorProvider
 * • Catches app errors, not infrastructure errors
 * • More specific error handling
 *
 * @module providers/application/errorprovider
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ApplicationErrorProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ApplicationErrorProvider extends Component<
  ApplicationErrorProviderProps,
  ErrorBoundaryState
> {
  constructor(props: ApplicationErrorProviderProps) {
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
    console.error('[ApplicationErrorBoundary] Caught error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Report to error tracking service
    this.props.onError?.(error, errorInfo);

    // Log to localStorage for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      layer: 'application',
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
      console.error('[ApplicationErrorBoundary] Failed to log error:', err);
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
                  className="h-6 w-6 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Application Error
                </h3>
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              <p className="mb-2">
                An error occurred in the application layer. This may be related to
                authentication, navigation, or app state.
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
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Reset App
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

export default ApplicationErrorProvider;
