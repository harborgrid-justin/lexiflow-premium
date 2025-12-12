/**
 * GlobalErrorBoundary.tsx
 * Application-wide error boundary for catching and handling React errors
 * Provides graceful error recovery and reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// GlobalErrorBoundary Component
// ============================================================================

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call onError callback
    this.props.onError?.(error, errorInfo);

    // Send to error reporting service
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;

      const hasChanged = currentKeys.some((key, index) => key !== prevKeys[index]);

      if (hasChanged) {
        this.resetError();
      }
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  reportError(error: Error, errorInfo: ErrorInfo): void {
    // Send to error reporting service (Sentry, LogRocket, etc.)
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Send to backend
      fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(err => {
        console.error('Failed to report error:', err);
      });
    } catch (reportError) {
      console.error('Error reporting failed:', reportError);
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Default Error Fallback UI
// ============================================================================

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, resetError }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.icon}>⚠️</div>
        <h1 style={styles.title}>Something went wrong</h1>
        <p style={styles.message}>
          We're sorry, but something unexpected happened. The error has been reported to our team.
        </p>

        <div style={styles.actions}>
          <button onClick={resetError} style={styles.primaryButton}>
            Try Again
          </button>
          <button onClick={() => window.location.reload()} style={styles.secondaryButton}>
            Reload Page
          </button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={styles.detailsToggle}
        >
          {showDetails ? 'Hide' : 'Show'} Error Details
        </button>

        {showDetails && (
          <div style={styles.details}>
            <h3 style={styles.detailsTitle}>Error Details</h3>
            <pre style={styles.errorMessage}>{error.message}</pre>

            {error.stack && (
              <>
                <h4 style={styles.stackTitle}>Stack Trace:</h4>
                <pre style={styles.stackTrace}>{error.stack}</pre>
              </>
            )}

            {errorInfo?.componentStack && (
              <>
                <h4 style={styles.stackTitle}>Component Stack:</h4>
                <pre style={styles.stackTrace}>{errorInfo.componentStack}</pre>
              </>
            )}
          </div>
        )}

        <p style={styles.footer}>
          If this problem persists, please contact support with the error details above.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  content: {
    maxWidth: '600px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  primaryButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#007bff',
    backgroundColor: 'transparent',
    border: '2px solid #007bff',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detailsToggle: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#666',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  details: {
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    padding: '20px',
    marginTop: '20px',
  },
  detailsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1a1a1a',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    marginBottom: '16px',
  },
  stackTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '16px',
    marginBottom: '8px',
    color: '#666',
  },
  stackTrace: {
    fontSize: '12px',
    color: '#333',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '12px',
    overflow: 'auto',
    maxHeight: '200px',
  },
  footer: {
    fontSize: '14px',
    color: '#999',
    marginTop: '24px',
    marginBottom: '0',
  },
};

// ============================================================================
// Utility Hook
// ============================================================================

export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const showBoundary = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return {
    showBoundary,
    resetError,
  };
};

export default GlobalErrorBoundary;
