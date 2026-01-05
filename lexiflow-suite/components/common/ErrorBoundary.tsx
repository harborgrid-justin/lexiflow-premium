
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.tsx';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Standard Error Boundary implementation for the LexiFlow platform.
 * Ensures that rendering errors in complex modules don't crash the entire application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMessage: error.message || 'Unknown internal error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Platform-wide error logging to console
    console.error("Platform Fault Detected:", error, errorInfo);
  }

  render(): ReactNode {
    const { hasError, errorMessage } = this.state;

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-slate-50 border-2 border-dashed border-red-100 rounded-3xl m-8">
          <div className="bg-red-50 p-6 rounded-3xl mb-6 border border-red-100 shadow-xl shadow-red-500/10">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Engine Fault Detected</h2>
          <p className="text-slate-500 max-w-md mb-8 leading-relaxed font-medium">
            The enterprise rendering engine encountered a critical state error. This event has been logged for system audit.
            <br/>
            <span className="text-[10px] font-mono bg-red-100 text-red-700 px-3 py-1.5 rounded-lg mt-6 inline-block border border-red-200 font-bold uppercase tracking-wider">
              {typeof errorMessage === 'string' ? errorMessage : 'Unknown Error Object'}
            </span>
          </p>
          <Button 
            variant="primary" 
            icon={RefreshCw} 
            onClick={() => window.location.reload()}
            className="bg-slate-900 border-none rounded-full px-10 py-4 shadow-2xl hover:bg-slate-800 font-black uppercase tracking-widest text-xs"
          >
            Hot-Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
