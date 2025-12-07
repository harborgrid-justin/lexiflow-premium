
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Sparkles, Loader2, Clipboard, Check } from 'lucide-react';
import { GeminiService } from '../../services/geminiService';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  aiResolution: string | null;
  isResolving: boolean;
  debugInfo: string | null;
  isCopied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    aiResolution: null,
    isResolving: false,
    debugInfo: null,
    isCopied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, aiResolution: null, isResolving: false, isCopied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Construct debug information
    const debugInfo = `
--- LexiFlow Error Report ---
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}

-- Error --
Name: ${error.name}
Message: ${error.message}
Stack Trace:
${error.stack}

-- Component Stack --
${errorInfo.componentStack}

-- Browser & Environment --
User Agent: ${navigator.userAgent}
Platform: ${navigator.platform}
Viewport: ${window.innerWidth}x${window.innerHeight}
---------------------------
    `.trim();

    // Log structured data to the console
    console.groupCollapsed("ErrorBoundary: Detailed Debug Information");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`URL: ${window.location.href}`);
    console.error("Error Object:", error);
    console.log("Component Stack:", errorInfo.componentStack);
    console.log("Browser:", {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        viewport: `${window.innerWidth}x${window.innerHeight}`
    });
    console.groupEnd();
    
    this.setState({ isResolving: true, debugInfo });

    GeminiService.getResolutionForError(error.message)
      .then(resolution => {
        if (this.state.hasError) { // Check if still mounted/in error state
            this.setState({ aiResolution: resolution, isResolving: false });
        }
      })
      .catch(e => {
        if (this.state.hasError) {
            this.setState({ aiResolution: "AI analysis is currently unavailable.", isResolving: false });
        }
      });
  }

  private handleReset = () => {
    window.location.reload();
  }
  
  private handleCopyDebugInfo = () => {
    if (this.state.debugInfo && !this.state.isCopied) {
        navigator.clipboard.writeText(this.state.debugInfo).then(() => {
            this.setState({ isCopied: true });
            setTimeout(() => {
                // Check if component is still mounted implicitly by state check logic if needed, 
                // but for class components usually safe unless unmounted
                this.setState({ isCopied: false });
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy debug info:", err);
        });
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
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
              {this.state.error ? this.state.error.message : 'Unknown Error'}
            </span>
          </p>

          <div className="mt-6 w-full max-w-md text-left">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI-Powered Analysis
            </h3>
            <div className="mt-2 p-4 text-xs rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 min-h-[50px]">
                {this.state.isResolving ? (
                    <div className="flex items-center gap-2 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Analyzing error...
                    </div>
                ) : (
                    this.state.aiResolution || "No analysis available."
                )}
            </div>
          </div>

          <div className="mt-4 w-full max-w-md text-left text-xs p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <strong>Note for Developers:</strong> Ensure no circular dependencies or missing exports in the module path.
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button 
              onClick={this.handleCopyDebugInfo}
              disabled={this.state.isCopied}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-70"
            >
                {this.state.isCopied ? <Check className="h-4 w-4 mr-2 text-green-600"/> : <Clipboard className="h-4 w-4 mr-2" />}
                {this.state.isCopied ? 'Copied!' : 'Copy Debug Info'}
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

    return this.props.children;
  }
}
