
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Sparkles, Loader2, Clipboard, Check } from 'lucide-react';
import { GeminiService } from '../../services/geminiService';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  aiResolution: string | null;
  isResolving: boolean;
  debugInfo: string | null;
  isCopied: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Added explicit constructor to ensure proper base class initialization.
  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    aiResolution: null,
    isResolving: false,
    debugInfo: null,
    isCopied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, aiResolution: null, isResolving: false, isCopied: false };
  }

  // FIX: Converted to arrow function property to guarantee 'this' context, resolving 'setState' not found errors.
  public componentDidCatch = (error: Error, errorInfo: ErrorInfo): void => {
    // FIX: Add explicit type assertion for 'this' to resolve TypeScript error regarding 'setState' property.
    const self = this as React.Component<ErrorBoundaryProps, ErrorBoundaryState>;

    const debugInfo = `
--- LexiFlow Error Report ---
Timestamp: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}

-- Error --
Name: ${error.name}
Message: ${error.message}
Stack Trace:
${error.stack}

-- Component Stack --
${errorInfo.componentStack}

-- Browser & Environment --
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
Viewport: ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}
---------------------------
    `.trim();

    console.groupCollapsed("ErrorBoundary: Detailed Debug Information");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`);
    console.error("Error Object:", error);
    console.log("Component Stack:", errorInfo.componentStack);
    console.groupEnd();
    
    self.setState({ isResolving: true, debugInfo });

    GeminiService.getResolutionForError(error.message)
      .then(resolution => {
        if (self.state.hasError) {
            self.setState({ aiResolution: resolution, isResolving: false });
        }
      })
      .catch(e => {
         if (self.state.hasError) {
            self.setState({ aiResolution: "AI analysis is currently unavailable.", isResolving: false });
         }
      });
  }

  private handleReset = () => {
    if (typeof window !== 'undefined') window.location.reload();
  }
  
  private handleCopyDebugInfo = () => {
    if (this.state.debugInfo && !this.state.isCopied) {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            // FIX: Add explicit type assertion for 'this' to resolve TypeScript error regarding 'setState' property.
            const self = this as React.Component<ErrorBoundaryProps, ErrorBoundaryState>;
            navigator.clipboard.writeText(this.state.debugInfo).then(() => {
                self.setState({ isCopied: true });
                setTimeout(() => {
                    self.setState({ isCopied: false });
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy debug info:", err);
            });
        }
    }
  }

  // FIX: Converted to arrow function property to guarantee 'this' context, resolving 'props' not found errors.
  public render = (): ReactNode => {
    // FIX: Add explicit type assertion for 'this' to resolve TypeScript error regarding 'props' property.
    const self = this as React.Component<ErrorBoundaryProps, ErrorBoundaryState>;
    if (self.state.hasError) {
      if (self.props.fallback) {
        return self.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-slate-50 dark:bg-slate-900 p-8 text-center rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="bg-rose-50 dark:bg-rose-950/50 p-4 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-rose-700 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Module Error</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md">
            The application encountered an unexpected error in this component. 
            <br/>
            <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded mt-2 inline-block text-slate-700 dark:text-slate-300">
              {self.state.error ? self.state.error.message : 'Unknown Error'}
            </span>
          </p>

          <div className="mt-6 w-full max-w-md text-left">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI-Powered Analysis
            </h3>
            <div className="mt-2 p-4 text-xs rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 min-h-[50px]">
                {self.state.isResolving ? (
                    <div className="flex items-center gap-2 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Analyzing error...
                    </div>
                ) : (
                    self.state.aiResolution || "No analysis available."
                )}
            </div>
          </div>

          <div className="mt-4 w-full max-w-md text-left text-xs p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <strong>Note for Developers:</strong> Ensure no circular dependencies or missing exports in the module path. Check that all imports use relative paths (e.g., '../') instead of aliases ('@/').
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => { if(typeof window !== 'undefined') window.location.href = '/'; }}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button 
              onClick={this.handleCopyDebugInfo}
              disabled={self.state.isCopied}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-70"
            >
                {self.state.isCopied ? <Check className="h-4 w-4 mr-2 text-green-600"/> : <Clipboard className="h-4 w-4 mr-2" />}
                {self.state.isCopied ? 'Copied!' : 'Copy Debug Info'}
            </button>
            <button 
              onClick={this.handleReset}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return self.props.children;
  }
}
