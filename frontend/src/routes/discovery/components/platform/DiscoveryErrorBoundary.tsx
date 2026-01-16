/**
 * @module components/discovery/DiscoveryErrorBoundary
 * @description Error boundary for graceful degradation in discovery center
 * Catches React errors and provides fallback UI with recovery options
 */
import { Button } from '@/components/atoms/Button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

interface ErrorFallbackProps {
    error: Error;
    errorInfo: ErrorInfo | null;
    onReset: () => void;
    onReturnHome: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    errorInfo,
    onReset,
    onReturnHome
}) => {
    return (
        <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen flex items-center justify-center p-4">
            <div
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                className="max-w-2xl w-full rounded-lg shadow-xl border p-8">
                {/* Error Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Discovery Center Error
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Something went wrong while loading the discovery platform
                        </p>
                    </div>
                </div>

                {/* Error Details */}
                <div
                    style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'var(--color-border)' }}
                    className="mb-6 p-4 rounded-lg border">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Error Details:
                    </h3>
                    <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                        {error.message}
                    </p>
                    {process.env.NODE_ENV === 'development' && errorInfo && (
                        <details className="mt-3">
                            <summary
                                className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                                Component Stack
                            </summary>
                            <pre className="mt-2 text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-40">
                                {errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>

                {/* Troubleshooting Tips */}
                <div
                    className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        Troubleshooting Tips:
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                        <li>Check if discovery requests or legal holds have valid data</li>
                        <li>Verify your network connection and try again</li>
                        <li>Clear browser cache and refresh the page</li>
                        <li>Try accessing a different discovery view (Dashboard, Requests, etc.)</li>
                        <li>Contact support if the issue persists</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        icon={RefreshCw}
                        onClick={onReset}
                        className="flex-1"
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        icon={Home}
                        onClick={onReturnHome}
                        className="flex-1"
                    >
                        Return to Dashboard
                    </Button>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
                    {/* Error ID generation with Date.now() OK here - error boundary render, not normal component render */}
                    Error ID: {Date.now().toString(36)} • This error has been logged for investigation
                </p>
            </div>
        </div>
    );
};

export class DiscoveryErrorBoundary extends Component<Props, State> {
    public override state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    static getDerivedStateFromError(error: Error): State {
        // React 18: getDerivedStateFromError must be static and return complete State
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log to a production error monitoring service (e.g., Sentry)
        console.error('Discovery Error Boundary caught:', error, errorInfo);

        // In production, send to monitoring service:
        // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });

        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    handleReturnHome = (): void => {
        window.location.href = '/';
    };

    override render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onReset={this.handleReset}
                    onReturnHome={this.handleReturnHome}
                />
            );
        }

        return this.props.children;
    }
}
