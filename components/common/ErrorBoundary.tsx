import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { errorHandler } from '../../utils/errorHandler';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  scope?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // FIX: Class properties `state` and `props` must be accessed with `this`.
    this.state = {
      hasError: false,
      error: null,
    };
    this.handleReset = this.handleReset.bind(this);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // FIX: Class property `props` must be accessed with `this`.
    errorHandler.logError(error, this.props.scope || 'ErrorBoundary');
    console.debug('Component Stack:', errorInfo.componentStack);
  }

  private handleReset() {
    // FIX: Class methods like `setState` must be called on `this`.
    this.setState({ hasError: false, error: null });
    // FIX: Class property `props` must be accessed with `this`.
    if (this.props.onReset) {
      // FIX: Class property `props` must be accessed with `this`.
      this.props.onReset();
    }
  }

  public render() {
    // FIX: Class property `state` must be accessed with `this`.
    if (this.state.hasError) {
      // FIX: Class property `props` must be accessed with `this`.
      if (this.props.fallback) {
        // FIX: Class property `props` must be accessed with `this`.
        return this.props.fallback;
      }

      return (
        <div className="flex h-full w-full items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {/* FIX: Class property `state` must be accessed with `this`. */}
              {this.state.error?.message || 'An unexpected error occurred in this module.'}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // FIX: Class property `props` must be accessed with `this`.
    return this.props.children;
  }
}
