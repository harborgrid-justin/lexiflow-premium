import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { errorHandler } from '../../utils/errorHandler';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  scope?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // The error is still logged for observability.
    errorHandler.logError(error, this.props.scope || 'ErrorBoundary');
    console.debug('Component Stack:', errorInfo.componentStack);
  }

  private handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="font-bold">An error occurred in {this.props.scope || 'this component'}.</h3>
          </div>
          <p className="mt-2 text-sm">
            {this.state.error?.message || 'An unknown error was caught by the boundary.'}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={this.handleReset}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 flex items-center"
            >
              <RefreshCw className="h-3 w-3 inline mr-1" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
