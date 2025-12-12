import axios from 'axios';
import { errorUtils } from '../utils/errorUtils';

/**
 * Error log entry interface
 */
export interface ErrorLogEntry {
  error: Error;
  componentStack?: string;
  correlationId: string;
  context?: Record<string, any>;
  userInfo?: {
    userId?: string;
    email?: string;
  };
  timestamp?: string;
}

/**
 * Error report interface
 */
export interface ErrorReport {
  error: Error;
  componentStack?: string;
  correlationId: string;
  userDescription?: string;
  reproSteps?: string[];
}

/**
 * Error Service
 * Handles error logging, reporting, and GitHub issue creation
 */
class ErrorService {
  private apiBaseUrl: string;
  private errorQueue: ErrorLogEntry[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Log an error to the backend
   */
  async logError(entry: ErrorLogEntry): Promise<void> {
    try {
      // Add to queue for batch processing
      this.errorQueue.push({
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
      });

      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        await this.processErrorQueue();
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', entry);
      }
    } catch (error) {
      // Fail silently to not disrupt user experience
      console.error('Failed to log error:', error);
    }
  }

  /**
   * Process queued errors
   */
  private async processErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    this.isProcessingQueue = true;

    try {
      const errorsToSend = [...this.errorQueue];
      this.errorQueue = [];

      await axios.post(`${this.apiBaseUrl}/errors/log`, {
        errors: errorsToSend.map((entry) => ({
          message: entry.error.message,
          stack: entry.error.stack,
          name: entry.error.name,
          correlationId: entry.correlationId,
          componentStack: entry.componentStack,
          context: entry.context,
          userInfo: entry.userInfo,
          timestamp: entry.timestamp,
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        })),
      });
    } catch (error) {
      console.error('Failed to send errors to backend:', error);
      // Put errors back in queue if send failed
      // this.errorQueue.unshift(...errorsToSend);
    } finally {
      this.isProcessingQueue = false;

      // Process any new errors that were added during processing
      if (this.errorQueue.length > 0) {
        setTimeout(() => this.processErrorQueue(), 1000);
      }
    }
  }

  /**
   * Report an issue (can trigger GitHub issue creation)
   */
  async reportIssue(report: ErrorReport): Promise<void> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/errors/report`, {
        error: {
          message: report.error.message,
          stack: report.error.stack,
          name: report.error.name,
        },
        componentStack: report.componentStack,
        correlationId: report.correlationId,
        userDescription: report.userDescription,
        reproSteps: report.reproSteps,
        environment: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to report issue:', error);
      throw error;
    }
  }

  /**
   * Get recent errors for current user/session
   */
  async getRecentErrors(limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/errors/recent`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent errors:', error);
      return [];
    }
  }

  /**
   * Get error details by correlation ID
   */
  async getErrorByCorrelationId(correlationId: string): Promise<any | null> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/errors/${correlationId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch error details:', error);
      return null;
    }
  }

  /**
   * Handle API error response
   */
  handleApiError(error: any): string {
    return errorUtils.getErrorMessage(error);
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(error: any): boolean {
    return errorUtils.isNetworkError(error);
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(error: any): boolean {
    return errorUtils.isAuthError(error);
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: any): string {
    if (this.isNetworkError(error)) {
      return 'Network connection issue. Please check your internet connection.';
    }

    if (this.isAuthError(error)) {
      return 'Authentication failed. Please log in again.';
    }

    return this.handleApiError(error);
  }
}

// Export singleton instance
export const errorService = new ErrorService();
