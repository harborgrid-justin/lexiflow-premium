import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Switched from public class field to constructor for broader compatibility.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // FIX: Correctly access props via `this.props`. The constructor ensures `this.props` is set.
      return this.props.fallback ?? <h1>Something went wrong.</h1>;
    }

    // FIX: Correctly access props via `this.props`.
    return this.props.children;
  }
}
