
/**
 * utils/errorHandler.ts
 * Centralized error handling and logging mechanism with aggregation.
 */

export interface AppError extends Error {
  code?: string;
  context?: Record<string, any>;
  isFatal?: boolean;
}

interface LogEntry {
  timestamp: number;
  count: number;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLogCache: Map<string, LogEntry> = new Map();
  private readonly AGGREGATION_WINDOW_MS = 5000; // 5 seconds window for deduplication

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public logError(error: Error | AppError, context?: string): void {
    const errorKey = `${context || 'General'}:${error.message}`;
    const now = Date.now();
    const existing = this.errorLogCache.get(errorKey);

    if (existing && (now - existing.timestamp < this.AGGREGATION_WINDOW_MS)) {
        // Increment count, suppress log
        existing.count++;
        existing.timestamp = now; // Extend window
        return;
    }

    // If we had previous suppressions, log summary
    if (existing && existing.count > 1) {
        console.warn(`[ErrorHandler] Previous error repeated ${existing.count} times: ${errorKey}`);
    }

    // Reset or Create new entry
    this.errorLogCache.set(errorKey, { timestamp: now, count: 1 });

    const timestamp = new Date().toISOString();
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      context: context || 'General',
      code: (error as AppError).code,
      meta: (error as AppError).context,
    };

    // In production, this would send to Sentry/LogRocket
    console.error(`[${timestamp}] [${context || 'App'}] Error:`, errorDetails);
  }

  public handleFatalError(error: Error): void {
    this.logError(error, 'FATAL');
    // Logic to show a global crash screen or attempt recovery could go here
    // For now, we rely on the React ErrorBoundary to catch this in the UI tree
  }

  public formatErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
        try {
            return JSON.stringify(error);
        } catch (e) {
            return String(error);
        }
    }
    return 'An unexpected error occurred.';
  }
}

export const errorHandler = ErrorHandler.getInstance();
