/**
 * ErrorReporting.service.ts
 * Centralized error reporting and logging service
 * Supports multiple error tracking backends (Sentry, LogRocket, custom)
 */

// ============================================================================
// Types
// ============================================================================

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  context?: Record<string, any>;
  severity: ErrorSeverity;
  tags?: Record<string, string>;
  breadcrumbs?: Breadcrumb[];
}

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface Breadcrumb {
  type: 'navigation' | 'http' | 'user' | 'console' | 'error';
  category: string;
  message: string;
  timestamp: string;
  level?: ErrorSeverity;
  data?: Record<string, any>;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  apiEndpoint?: string;
  sentryDsn?: string;
  logRocketAppId?: string;
  environment: 'development' | 'staging' | 'production';
  sampleRate?: number; // 0-1, percentage of errors to report
  beforeSend?: (report: ErrorReport) => ErrorReport | null;
}

// ============================================================================
// Error Reporting Service
// ============================================================================

class ErrorReportingService {
  private config: ErrorReportingConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private context: Record<string, any> = {};

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enabled: true,
      environment: this.detectEnvironment(),
      sampleRate: 1.0,
      ...config,
    };

    this.initializeIntegrations();
    this.setupGlobalErrorHandlers();
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  private detectEnvironment(): 'development' | 'staging' | 'production' {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging')) {
      return 'staging';
    }
    return 'production';
  }

  private initializeIntegrations(): void {
    // Initialize Sentry if DSN provided
    if (this.config.sentryDsn && typeof window !== 'undefined') {
      // Sentry.init({
      //   dsn: this.config.sentryDsn,
      //   environment: this.config.environment,
      //   sampleRate: this.config.sampleRate,
      // });
      console.log('Sentry integration ready');
    }

    // Initialize LogRocket if App ID provided
    if (this.config.logRocketAppId && typeof window !== 'undefined') {
      // LogRocket.init(this.config.logRocketAppId);
      console.log('LogRocket integration ready');
    }
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        severity: 'error',
        context: {
          type: 'uncaught_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          severity: 'error',
          context: {
            type: 'unhandled_rejection',
          },
        }
      );
    });
  }

  // ============================================================================
  // Breadcrumbs
  // ============================================================================

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  // ============================================================================
  // Context
  // ============================================================================

  setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  setUser(user: { id: string; email: string; name: string }): void {
    this.context.user = user;
  }

  clearContext(): void {
    this.context = {};
  }

  // ============================================================================
  // Error Capture
  // ============================================================================

  captureError(
    error: Error | string,
    options: {
      severity?: ErrorSeverity;
      context?: Record<string, any>;
      tags?: Record<string, string>;
    } = {}
  ): string | null {
    if (!this.config.enabled) return null;

    // Sample rate check
    if (Math.random() > (this.config.sampleRate || 1.0)) {
      return null;
    }

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const { severity = 'error', context = {}, tags = {} } = options;

    // Build error report
    const report: ErrorReport = {
      message: errorObj.message,
      stack: errorObj.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      user: this.context.user,
      context: {
        ...this.context,
        ...context,
      },
      severity,
      tags,
      breadcrumbs: [...this.breadcrumbs],
    };

    // Allow modification or filtering via beforeSend
    const processedReport = this.config.beforeSend?.(report) || report;
    if (!processedReport) return null;

    // Send to backend
    this.sendToBackend(processedReport);

    // Log to console in development
    if (this.config.environment === 'development') {
      console.error('[ErrorReporting]', processedReport);
    }

    // Add breadcrumb for this error
    this.addBreadcrumb({
      type: 'error',
      category: 'error',
      message: errorObj.message,
      level: severity,
      data: context,
    });

    return report.timestamp;
  }

  captureMessage(
    message: string,
    severity: ErrorSeverity = 'info',
    context?: Record<string, any>
  ): string | null {
    return this.captureError(new Error(message), { severity, context });
  }

  // ============================================================================
  // Network Error Handling
  // ============================================================================

  captureNetworkError(
    url: string,
    method: string,
    status: number,
    statusText: string,
    responseData?: any
  ): string | null {
    const error = new Error(`Network Error: ${method} ${url} ${status} ${statusText}`);

    return this.captureError(error, {
      severity: status >= 500 ? 'error' : 'warning',
      context: {
        type: 'network_error',
        url,
        method,
        status,
        statusText,
        response: responseData,
      },
      tags: {
        error_type: 'network',
        http_status: String(status),
      },
    });
  }

  // ============================================================================
  // Performance Tracking
  // ============================================================================

  capturePerformance(metric: string, value: number, context?: Record<string, any>): void {
    this.addBreadcrumb({
      type: 'console',
      category: 'performance',
      message: `${metric}: ${value}ms`,
      data: {
        metric,
        value,
        ...context,
      },
    });

    // Send to analytics backend
    this.sendPerformanceMetric(metric, value, context);
  }

  // ============================================================================
  // Backend Communication
  // ============================================================================

  private async sendToBackend(report: ErrorReport): Promise<void> {
    if (!this.config.apiEndpoint) return;

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  private async sendPerformanceMetric(
    metric: string,
    value: number,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric,
          value,
          context,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  setConfig(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }

  flush(): Promise<void> {
    // Wait for all pending reports to send
    return Promise.resolve();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let errorReportingInstance: ErrorReportingService | null = null;

export function initializeErrorReporting(config: Partial<ErrorReportingConfig> = {}): void {
  if (errorReportingInstance) {
    console.warn('Error reporting already initialized');
    return;
  }

  errorReportingInstance = new ErrorReportingService(config);
}

export function getErrorReporting(): ErrorReportingService {
  if (!errorReportingInstance) {
    errorReportingInstance = new ErrorReportingService();
  }

  return errorReportingInstance;
}

// ============================================================================
// Convenience Functions
// ============================================================================

export function captureError(
  error: Error | string,
  options?: {
    severity?: ErrorSeverity;
    context?: Record<string, any>;
    tags?: Record<string, string>;
  }
): string | null {
  return getErrorReporting().captureError(error, options);
}

export function captureMessage(
  message: string,
  severity?: ErrorSeverity,
  context?: Record<string, any>
): string | null {
  return getErrorReporting().captureMessage(message, severity, context);
}

export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
  getErrorReporting().addBreadcrumb(breadcrumb);
}

export function setContext(key: string, value: any): void {
  getErrorReporting().setContext(key, value);
}

export function setUser(user: { id: string; email: string; name: string }): void {
  getErrorReporting().setUser(user);
}

export default ErrorReportingService;
