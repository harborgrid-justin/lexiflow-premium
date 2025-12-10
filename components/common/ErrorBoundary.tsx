import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Initialize state as a class property.
  // This is a more modern syntax and provides a clearer type definition for TypeScript,
  // resolving the errors related to 'this.state' and 'this.props' not being found.
  public state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-lg font-bold text-red-600">Application Error</h1>
                <p className="text-sm text-slate-500 mt-2">Something went wrong in this module. Please try refreshing the page.</p>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
