import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // FIX: 'this.props' is now correctly typed and accessible due to using a standard constructor.
      return this.props.fallback ?? (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-lg font-bold text-red-600">Application Error</h1>
                <p className="text-sm text-slate-500 mt-2">Something went wrong in this module. Please try refreshing the page.</p>
            </div>
        </div>
      );
    }

    // FIX: 'this.props' is now correctly typed and accessible.
    return this.props.children;
  }
}
