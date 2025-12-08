import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    if (typeof window !== 'undefined') window.location.reload();
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-slate-50 dark:bg-slate-900 p-8 text-center">
          <div className="bg-rose-50 dark:bg-rose-950/50 p-4 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-rose-700 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Something went wrong</h2>
          
          <div className="max-w-3xl w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6 overflow-auto max-h-96 shadow-sm">
            <p className="font-mono text-red-600 dark:text-red