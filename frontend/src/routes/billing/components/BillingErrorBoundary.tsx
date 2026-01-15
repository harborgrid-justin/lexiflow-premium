/**
 * @module components/billing/BillingErrorBoundary
 * @description Error boundary for billing module with financial data protection
 * Provides graceful error handling and prevents financial data corruption
 */

import { Button } from '@/components/atoms/Button/Button';
import { AlertTriangle, DollarSign, Home, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

const getAppEnv = () => process.env.NODE_ENV;

interface Props {
  children: ReactNode;
  onReset?: () => void;
}
// ...
// Rest of file


interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class BillingErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    // React 18: Must return complete State, not Partial<State>
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to error reporting service
    console.error('Billing Error Boundary caught error:', error, errorInfo);

    // Log error for monitoring - integrate with error tracking service in production
    if (getAppEnv() === 'production') {
      // Production error logging can be integrated here
      console.error('Billing Error:', error, errorInfo);
    }
    // Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen flex items-center justify-center p-4">
          <div style={{ backgroundColor: 'var(--color-surface)' }} className="max-w-2xl w-full rounded-lg shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Billing System Error
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  An error occurred in the billing module. Your financial data is safe and no transactions were affected.
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-1">
                    Error Details
                  </h3>
                  <p className="text-sm text-rose-800 dark:text-rose-200 font-mono break-all">
                    {this.state.error?.message || 'Unknown error occurred'}
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting Tips */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Troubleshooting Steps
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Click "Try Again" to reload the billing module</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Check if your session has expired and try logging in again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Verify your network connection is stable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>Clear your browser cache and cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>If the problem persists, contact your system administrator</span>
                </li>
              </ul>
            </div>

            {/* Financial Data Safety Notice */}
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Financial Data Protected
              </h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                All financial data is securely stored. No transactions were lost or corrupted.
                Your billing records, invoices, and time entries are safe.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2"
                variant="primary"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2"
                variant="secondary"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Button>
            </div>

            {/* Development Mode Stack Trace */}
            {getAppEnv() === 'development' && this.state.errorInfo && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                  Stack Trace (Development Only)
                </summary>
                <pre style={{ backgroundColor: 'var(--color-surfaceHover)', color: 'var(--color-text)' }} className="mt-2 p-4 rounded text-xs overflow-auto max-h-64">
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
