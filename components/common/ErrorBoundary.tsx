
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    if (typeof window !== 'undefined') window.location.reload();
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-slate-50 dark:bg-slate-900 p-8 text-center">
          <div className="bg-rose-50 dark:bg-rose-950/50 p-4 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-rose-700 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Something went wrong</h2>
          
          <div className="max-w-3xl w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6 overflow-auto max-h-96 shadow-sm">
            <p className="font-mono text-red-600 dark:text-red-400 text-sm font-bold mb-2">
              {this.state.error?.toString()}
            </p>
            <pre className="font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => { if(typeof window !== 'undefined') window.location.href = '/'; }}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </button>
            <button 
              onClick={this.handleReset}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
