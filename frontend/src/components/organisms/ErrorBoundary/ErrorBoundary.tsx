/**
 * @module components/common/ErrorBoundary
 * @category Common Components - Error Handling
 * @description React Error Boundary component with fallback UI and reset functionality.
 *
 * THEME SYSTEM USAGE:
 * Uses hardcoded red color palette for error states - consider theme.status.error in future.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Utils & Constants
import { errorHandler } from '@/utils/errorHandler';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // The error is still logged for observability.
    errorHandler.logError(error, this.props.scope || 'ErrorBoundary');
    console.debug('Component Stack:', errorInfo.componentStack);
  }

  private handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="p-4 m-4 border rounded-lg border-red-200 bg-red-50 text-red-800"
        >
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
              className="px-3 py-1 text-white rounded text-sm font-medium flex items-center bg-red-600 hover:opacity-90"
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
