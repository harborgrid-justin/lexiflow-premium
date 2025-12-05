import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// FIX: Extend React.Component to make this a valid class component with state and props.
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-slate-50 p-8 text-center rounded-lg border border-slate-200">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Module Error</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md">
            The application encountered an unexpected error in this component. 
            <br/>
            <span className="font-mono text-xs bg-slate-200 px-1 rounded mt-2 inline-block text-slate-700">
              {this.state.error?.message || 'Unknown Error'}
            </span>
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button 
              onClick={this.handleReset}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
