import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { errorService } from '../../services/errorService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  correlationId: string | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 * Automatically logs errors and can create GitHub issues
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      correlationId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate correlation ID
    const correlationId = this.generateCorrelationId();

    // Update state with error details
    this.setState({
      errorInfo,
      correlationId,
    });

    // Log error to service
    try {
      await errorService.logError({
        error,
        componentStack: errorInfo.componentStack,
        correlationId,
        context: {
          boundary: 'ErrorBoundary',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      correlationId: null,
    });
  };

  handleReportIssue = async () => {
    const { error, errorInfo, correlationId } = this.state;

    if (!error || !correlationId) return;

    try {
      await errorService.reportIssue({
        error,
        componentStack: errorInfo?.componentStack,
        correlationId,
      });

      alert('Error report submitted successfully. Thank you for your feedback!');
    } catch (reportError) {
      console.error('Failed to report issue:', reportError);
      alert('Failed to submit error report. Please try again later.');
    }
  };

  private generateCorrelationId(): string {
    return `fe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default fallback
      return (
        <ErrorFallback
          error={this.state.error}
          componentStack={this.state.errorInfo?.componentStack}
          correlationId={this.state.correlationId}
          onReset={this.handleReset}
          onReportIssue={this.handleReportIssue}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
) {
  return (props: P) => (
    <ErrorBoundary onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );
}
