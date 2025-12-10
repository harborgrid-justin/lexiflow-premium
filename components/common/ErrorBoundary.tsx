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
    if (this.state.hasError) {
      // Fix: In a class component, props are accessed via `this.props`.
      const { fallback } = this.props;
      if (fallback) {
        return fallback;
      }
      return <h1>Something went wrong.</h1>;
    }

    // Fix: In a class component, props are accessed via `this.props`.
    const { children } = this.props;
    return children;
  }
}
