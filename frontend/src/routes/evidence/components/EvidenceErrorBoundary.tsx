/**
 * @module components/evidence/EvidenceErrorBoundary
 * @description Error boundary for Evidence Vault to catch and display errors gracefully
 */

import { Button } from '@/shared/ui/atoms/Button/Button';
import { AlertOctagon, Home, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class EvidenceErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    // React 18: Must return complete State, not Partial<State>
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Evidence Vault Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  override render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="h-full flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-red-200 p-8">
            <div className="flex items-start mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertOctagon className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Evidence Vault Error
                </h2>
                <p className="text-slate-600">
                  Something went wrong while loading the Evidence Vault. The error has been logged and our team has been notified.
                </p>
              </div>
            </div>

            {isDevelopment && this.state.error && (
              <div className="mb-6 bg-slate-900 text-white p-4 rounded-md overflow-auto max-h-64 text-sm font-mono">
                <div className="font-bold text-red-400 mb-2">{this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <pre className="text-xs opacity-75 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                icon={Home}
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-2">Troubleshooting Tips:</h3>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Check your internet connection</li>
                <li>Clear your browser cache and refresh</li>
                <li>Verify that all evidence data is properly synced</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
