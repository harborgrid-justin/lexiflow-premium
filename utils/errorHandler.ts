
/**
 * utils/errorHandler.ts
 * Centralized error handling and logging mechanism.
 */

export interface AppError extends Error {
  code?: string;
  context?: Record<string, any>;
  isFatal?: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public logError(error: Error | AppError, context?: string): void {
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
