import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // FIX: Property 'props' does not exist on type 'ErrorBoundary'.
    // Directly access this.props properties to avoid a potential issue with destructuring `this.props` in some TypeScript environments.
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
