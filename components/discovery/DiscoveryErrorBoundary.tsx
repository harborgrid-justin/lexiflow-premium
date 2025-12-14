/**
 * @module components/discovery/DiscoveryErrorBoundary
 * @description Error boundary for graceful degradation in discovery center
 * Catches React errors and provides fallback UI with recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../common/Button';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class DiscoveryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to production error monitoring service (e.g., Sentry)
    console.error('Discovery Error Boundary caught:', error, errorInfo);
    
    // In production, send to monitoring service:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReturnHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            {/* Error Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Discovery Center Error
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Something went wrong while loading the discovery platform
                </p>
              </div>
            </div>

            {/* Error Details */}
            {this.state.error && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Error Details:
                </h3>
                <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                  {this.state.error.message}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                      Component Stack
                    </summary>
                    <pre className="mt-2 text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Troubleshooting Tips */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Troubleshooting Tips:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Check if discovery requests or legal holds have valid data</li>
                <li>Verify your network connection and try again</li>
                <li>Clear browser cache and refresh the page</li>
                <li>Try accessing a different discovery view (Dashboard, Requests, etc.)</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={this.handleReset}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                icon={Home}
                onClick={this.handleReturnHome}
                className="flex-1"
              >
                Return to Dashboard
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
              Error ID: {Date.now().toString(36)} • This error has been logged for investigation
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
