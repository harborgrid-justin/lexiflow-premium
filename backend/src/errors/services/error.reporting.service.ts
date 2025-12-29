import { Injectable, Logger } from '@nestjs/common';
import { ErrorCategory, ErrorSeverity } from '@errors/constants/error.codes.constant';

/**
 * Error Report
 */
export interface ErrorReport {
  id: string;
  timestamp: string;
  errorCode: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  stackTrace?: string;
  context?: Record<string, unknown>;
  userContext?: UserContext;
  requestContext?: RequestContext;
  environment: string;
}

/**
 * User Context
 */
export interface UserContext {
  userId?: string;
  email?: string;
  organizationId?: string;
  roles?: string[];
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Request Context
 */
export interface RequestContext {
  method?: string;
  url?: string;
  correlationId?: string;
  headers?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
}

/**
 * Error Aggregation Stats
 */
export interface ErrorAggregationStats {
  totalErrors: number;
  errorsByCategory: Map<ErrorCategory, number>;
  errorsBySeverity: Map<ErrorSeverity, number>;
  errorsByCode: Map<string, number>;
  topErrors: Array<{ code: string; count: number }>;
  timeWindow: string;
}

/**
 * Error Reporting Service
 * Aggregates, categorizes, and reports errors to monitoring systems
 * Integrates with Sentry, Datadog, or other error tracking platforms
 */
@Injectable()
export class ErrorReportingService {
  private readonly logger = new Logger(ErrorReportingService.name);
  private errorBuffer: ErrorReport[] = [];
  private errorStats: Map<string, number> = new Map();
  private readonly bufferSize = 1000;
  private readonly flushInterval = 60000; // 1 minute

  constructor() {
    // Set up periodic flushing
    this.startPeriodicFlush();
  }

  /**
   * Report an error to monitoring systems
   */
  async reportError(
    error: Error,
    context?: {
      errorCode?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      userContext?: UserContext;
      requestContext?: RequestContext;
      additionalContext?: Record<string, unknown>;
    },
  ): Promise<void> {
    const report = this.createErrorReport(error, context);

    // Add to buffer
    this.addToBuffer(report);

    // Update statistics
    this.updateStats(report);

    // Log based on severity
    this.logError(report);

    // Send to external monitoring (Sentry, Datadog, etc.)
    await this.sendToMonitoring(report);

    // Send critical errors immediately
    if (report.severity === ErrorSeverity.CRITICAL) {
      await this.sendCriticalAlert(report);
    }
  }

  /**
   * Get aggregated error statistics
   */
  getAggregatedStats(timeWindowMinutes: number = 60): ErrorAggregationStats {
    const now = Date.now();
    const windowStart = now - timeWindowMinutes * 60 * 1000;

    const recentErrors = this.errorBuffer.filter(
      (report) => new Date(report.timestamp).getTime() >= windowStart,
    );

    const errorsByCategory = new Map<ErrorCategory, number>();
    const errorsBySeverity = new Map<ErrorSeverity, number>();
    const errorsByCode = new Map<string, number>();

    recentErrors.forEach((report) => {
      // Count by category
      errorsByCategory.set(
        report.category,
        (errorsByCategory.get(report.category) || 0) + 1,
      );

      // Count by severity
      errorsBySeverity.set(
        report.severity,
        (errorsBySeverity.get(report.severity) || 0) + 1,
      );

      // Count by error code
      errorsByCode.set(
        report.errorCode,
        (errorsByCode.get(report.errorCode) || 0) + 1,
      );
    });

    // Get top errors
    const topErrors = Array.from(errorsByCode.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([code, count]) => ({ code, count }));

    return {
      totalErrors: recentErrors.length,
      errorsByCategory,
      errorsBySeverity,
      errorsByCode,
      topErrors,
      timeWindow: `${timeWindowMinutes} minutes`,
    };
  }

  /**
   * Get error trend analysis
   */
  getErrorTrend(errorCode: string, hours: number = 24): number[] {
    const now = Date.now();
    const hourlyBuckets: number[] = new Array(hours).fill(0);

    this.errorBuffer
      .filter((report) => report.errorCode === errorCode)
      .forEach((report) => {
        const errorTime = new Date(report.timestamp).getTime();
        const hoursAgo = Math.floor((now - errorTime) / (60 * 60 * 1000));

        if (hoursAgo < hours) {
          const index = hours - 1 - hoursAgo;
          if (hourlyBuckets[index] !== undefined) hourlyBuckets[index]++;
        }
      });

    return hourlyBuckets;
  }

  /**
   * Check if error rate is anomalous
   */
  isAnomalousErrorRate(
    errorCode: string,
    thresholdMultiplier: number = 3,
  ): boolean {
    const recentRate = this.getErrorRate(errorCode, 5); // Last 5 minutes
    const baselineRate = this.getErrorRate(errorCode, 60); // Last hour

    return recentRate > baselineRate * thresholdMultiplier;
  }

  /**
   * Clear error buffer (for testing or manual cleanup)
   */
  clearBuffer(): void {
    this.errorBuffer = [];
    this.errorStats.clear();
    this.logger.log('Error buffer cleared');
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.errorBuffer.length;
  }

  private createErrorReport(
    error: Error,
    context?: {
      errorCode?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      userContext?: UserContext;
      requestContext?: RequestContext;
      additionalContext?: Record<string, unknown>;
    },
  ): ErrorReport {
    return {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      errorCode: context?.errorCode || 'UNKNOWN',
      message: error.message,
      category: context?.category || ErrorCategory.SYSTEM,
      severity: context?.severity || this.inferSeverity(error),
      stackTrace: this.sanitizeStackTrace(error.stack),
      context: context?.additionalContext,
      userContext: context?.userContext,
      requestContext: this.sanitizeRequestContext(context?.requestContext),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  private addToBuffer(report: ErrorReport): void {
    this.errorBuffer.push(report);

    // Prevent buffer overflow
    if (this.errorBuffer.length > this.bufferSize) {
      this.errorBuffer.shift();
    }
  }

  private updateStats(report: ErrorReport): void {
    const count = this.errorStats.get(report.errorCode) || 0;
    this.errorStats.set(report.errorCode, count + 1);
  }

  private logError(report: ErrorReport): void {
    const logContext = {
      errorId: report.id,
      errorCode: report.errorCode,
      category: report.category,
      severity: report.severity,
      userId: report.userContext?.userId,
      correlationId: report.requestContext?.correlationId,
    };

    switch (report.severity) {
      case ErrorSeverity.CRITICAL:
        this.logger.error(
          `CRITICAL ERROR: ${report.message}`,
          JSON.stringify(logContext),
        );
        break;
      case ErrorSeverity.HIGH:
        this.logger.error(
          `HIGH SEVERITY: ${report.message}`,
          JSON.stringify(logContext),
        );
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn(
          `MEDIUM SEVERITY: ${report.message}`,
          JSON.stringify(logContext),
        );
        break;
      case ErrorSeverity.LOW:
        this.logger.log(
          `LOW SEVERITY: ${report.message}`,
          JSON.stringify(logContext),
        );
        break;
    }

    // Log stack trace for high and critical errors in development
    if (
      (report.severity === ErrorSeverity.HIGH ||
        report.severity === ErrorSeverity.CRITICAL) &&
      process.env.NODE_ENV !== 'production'
    ) {
      this.logger.debug(report.stackTrace);
    }
  }

  private async sendToMonitoring(report: ErrorReport): Promise<void> {
    try {
      // Integration point for Sentry
      if (process.env.SENTRY_DSN) {
        await this.sendToSentry(report);
      }

      // Integration point for Datadog
      if (process.env.DATADOG_API_KEY) {
        await this.sendToDatadog(report);
      }

      // Integration point for custom monitoring
      if (process.env.CUSTOM_MONITORING_ENDPOINT) {
        await this.sendToCustomMonitoring(report);
      }
    } catch (error) {
      // Don't let monitoring failures affect application
      this.logger.warn(`Failed to send error to monitoring: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async sendToSentry(report: ErrorReport): Promise<void> {
    // Sentry integration placeholder
    // In production, use @sentry/node SDK
    this.logger.debug(`[Sentry] Would send error: ${report.errorCode}`);
  }

  private async sendToDatadog(report: ErrorReport): Promise<void> {
    // Datadog integration placeholder
    // In production, use dd-trace or datadog-api-client
    this.logger.debug(`[Datadog] Would send error: ${report.errorCode}`);
  }

  private async sendToCustomMonitoring(report: ErrorReport): Promise<void> {
    // Custom monitoring endpoint placeholder
    this.logger.debug(`[Custom] Would send error: ${report.errorCode}`);
  }

  private async sendCriticalAlert(report: ErrorReport): Promise<void> {
    // Send immediate alerts for critical errors
    this.logger.error(
      `CRITICAL ALERT: ${report.errorCode} - ${report.message}`,
      JSON.stringify({
        errorId: report.id,
        timestamp: report.timestamp,
        userContext: report.userContext,
        requestContext: report.requestContext,
      }),
    );

    // Integration points for alerting
    // - PagerDuty
    // - Slack
    // - Email
    // - SMS
  }

  private sanitizeStackTrace(stack?: string): string | undefined {
    if (!stack) return undefined;

    // Remove sensitive information from stack traces
    return stack
      .split('\n')
      .filter((line) => !line.includes('node_modules'))
      .join('\n');
  }

  private sanitizeRequestContext(
    context?: RequestContext,
  ): RequestContext | undefined {
    if (!context) return undefined;

    // Remove sensitive headers and data
    const sanitizedHeaders = context.headers
      ? this.sanitizeHeaders(context.headers)
      : undefined;

    const sanitizedBody = context.body
      ? this.sanitizeBody(context.body)
      : undefined;

    return {
      method: context.method,
      url: context.url,
      correlationId: context.correlationId,
      headers: sanitizedHeaders,
      query: context.query,
      body: sanitizedBody,
    };
  }

  private sanitizeHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];

    const sanitized: Record<string, string> = {};

    Object.keys(headers).forEach((key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        const value = headers[key];
        if (value) sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: unknown): any {
    if (typeof body !== 'object') return body;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'accessToken',
      'refreshToken',
      'ssn',
      'creditCard',
    ];

    const sanitized: Record<string, unknown> = { ...body };

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private inferSeverity(error: Error): ErrorSeverity {
    const errorName = error.name.toLowerCase();
    const errorMessage = error.message.toLowerCase();

    if (
      errorName.includes('critical') ||
      errorMessage.includes('critical') ||
      errorMessage.includes('fatal')
    ) {
      return ErrorSeverity.CRITICAL;
    }

    if (
      errorName.includes('timeout') ||
      errorName.includes('unavailable') ||
      errorMessage.includes('database')
    ) {
      return ErrorSeverity.HIGH;
    }

    if (
      errorName.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('not found')
    ) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  private getErrorRate(errorCode: string, minutes: number): number {
    const now = Date.now();
    const windowStart = now - minutes * 60 * 1000;

    const count = this.errorBuffer.filter(
      (report) =>
        report.errorCode === errorCode &&
        new Date(report.timestamp).getTime() >= windowStart,
    ).length;

    return count / minutes; // Errors per minute
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushOldErrors();
    }, this.flushInterval);
  }

  private flushOldErrors(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours

    const initialLength = this.errorBuffer.length;
    this.errorBuffer = this.errorBuffer.filter(
      (report) => new Date(report.timestamp).getTime() > cutoff,
    );

    const flushed = initialLength - this.errorBuffer.length;
    if (flushed > 0) {
      this.logger.debug(`Flushed ${flushed} old error reports from buffer`);
    }
  }
}
