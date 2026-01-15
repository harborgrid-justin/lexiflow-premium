// ================================================================================
// ENTERPRISE REACT ERROR BOUNDARY - INFRASTRUCTURE LAYER
// ================================================================================

/**
 * Infrastructure Error Provider
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Error Boundaries + Logging
 *
 * RESPONSIBILITIES:
 * • Catch infrastructure-level errors
 * • Provide fallback UI for infrastructure failures
 * • Log errors to localStorage (debugging)
 * • Report to error tracking service
 * • Graceful degradation
 *
 * CATCHES:
 * • Theme system errors
 * • Toast/notification errors
 * • Query client errors
 * • WebSocket connection errors
 * • Session management errors
 *
 * REACT 18 PATTERNS:
 * ✓ Class component (error boundaries requirement)
 * ✓ getDerivedStateFromError (render-safe)
 * ✓ componentDidCatch (side effects)
 * ✓ Reset capability
 * ✓ Custom fallback support
 *
 * ENTERPRISE INVARIANTS:
 * • Isolates infrastructure failures
 * • Prevents cascade failures
 * • Observable error state
 * • Debugging support
 *
 * @module providers/infrastructure/errorprovider
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface InfrastructureErrorProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class InfrastructureErrorProvider extends Component<
  InfrastructureErrorProviderProps,
  ErrorBoundaryState
> {
  constructor(props: InfrastructureErrorProviderProps) {
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
    console.error('[InfrastructureErrorBoundary] Caught error:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Report to error tracking service
    this.props.onError?.(error, errorInfo);

    // Log to localStorage for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      layer: 'infrastructure',
      error: {
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    };

    try {
      const logs = JSON.parse(localStorage.getItem('lexiflow-error-logs') || '[]');
      logs.push(errorLog);
      localStorage.setItem('lexiflow-error-logs', JSON.stringify(logs.slice(-50))); // Keep last 50
    } catch (err) {
      console.error('[InfrastructureErrorBoundary] Failed to log error:', err);
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Infrastructure Error
                </h3>
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              <p className="mb-2">
                A low-level error occurred in the application infrastructure layer.
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
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
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

export default InfrastructureErrorProvider;
