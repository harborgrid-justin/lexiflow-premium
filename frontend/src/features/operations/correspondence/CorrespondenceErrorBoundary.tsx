/**
 * @module components/correspondence/CorrespondenceErrorBoundary
 * @category Correspondence
 * @description Error boundary for correspondence components with fallback UI
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/atoms';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Correspondence Module
 * Catches errors and displays user-friendly fallback UI
 */
export class CorrespondenceErrorBoundary extends Component<Props, State> {
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
    // Log to console for debugging
    console.error('Correspondence Error Boundary caught:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorTracking({ error, errorInfo, module: 'Correspondence' });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Fallback UI component displayed when error occurs
 */
const ErrorFallback: React.FC<{ error: Error | null; onReset: () => void }> = ({ error, onReset }) => {
  const FallbackContent = () => {
    const { theme } = useTheme();
    
    return (
      <div className={cn("h-full flex items-center justify-center p-6", theme.background)}>
        <div className={cn("max-w-md w-full rounded-lg border p-8 text-center", theme.surface.default, theme.border.default)}>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>
            Something went wrong
          </h3>
          
          <p className={cn("text-sm mb-6", theme.text.secondary)}>
            We encountered an error in the correspondence module. This has been logged and we're working on it.
          </p>

          {error && process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left">
              <p className="text-xs font-mono text-red-800 break-all">
                {error.toString()}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button 
              variant="secondary" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button 
              variant="primary" 
              icon={RefreshCw}
              onClick={onReset}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return <FallbackContent />;
};
