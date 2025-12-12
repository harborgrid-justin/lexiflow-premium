import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '../../logging/logging.service';

/**
 * Error severity levels for categorization
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error tracking entry
 */
export interface ErrorTrackingEntry {
  correlationId: string;
  error: Error;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  timestamp: Date;
  severity: ErrorSeverity;
  fingerprint: string;
  reportedToGithub?: boolean;
  githubIssueNumber?: number;
}

/**
 * Error Tracking Service
 * Tracks, categorizes, and manages application errors
 * Can integrate with GitHub for automated issue creation
 */
@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name);
  private errorCache = new Map<string, ErrorTrackingEntry[]>();
  private readonly maxCacheSize = 1000;
  private readonly cacheTTL = 3600000; // 1 hour in milliseconds

  constructor(
    private readonly loggingService: LoggingService,
    private readonly configService: ConfigService,
  ) {
    // Clean up cache periodically
    setInterval(() => this.cleanupCache(), this.cacheTTL);
  }

  /**
   * Track an error
   */
  async trackError(entry: Omit<ErrorTrackingEntry, 'timestamp' | 'fingerprint'>): Promise<ErrorTrackingEntry> {
    const fingerprint = this.generateFingerprint(entry.error, entry.context);

    const trackingEntry: ErrorTrackingEntry = {
      ...entry,
      timestamp: new Date(),
      fingerprint,
    };

    // Add to cache
    this.addToCache(trackingEntry);

    // Log the error
    this.loggingService.logError(
      `Error tracked: ${entry.error.message}`,
      entry.error,
      entry.correlationId,
      {
        ...entry.context,
        userId: entry.userId,
        ip: entry.ip,
        userAgent: entry.userAgent,
        severity: entry.severity,
        fingerprint,
      },
    );

    // Check if we should report to GitHub
    if (this.shouldReportToGithub(trackingEntry)) {
      await this.markForGithubReport(trackingEntry);
    }

    return trackingEntry;
  }

  /**
   * Get errors by fingerprint
   */
  getErrorsByFingerprint(fingerprint: string): ErrorTrackingEntry[] {
    return this.errorCache.get(fingerprint) || [];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): ErrorTrackingEntry[] {
    const allErrors: ErrorTrackingEntry[] = [];

    for (const errors of this.errorCache.values()) {
      allErrors.push(...errors);
    }

    return allErrors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get error by correlation ID
   */
  getErrorByCorrelationId(correlationId: string): ErrorTrackingEntry | null {
    for (const errors of this.errorCache.values()) {
      const error = errors.find((e) => e.correlationId === correlationId);
      if (error) return error;
    }
    return null;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byFingerprint: Map<string, number>;
    recentErrors: number;
  } {
    const stats = {
      total: 0,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0,
      },
      byFingerprint: new Map<string, number>(),
      recentErrors: 0,
    };

    const oneHourAgo = Date.now() - 3600000;

    for (const [fingerprint, errors] of this.errorCache.entries()) {
      stats.total += errors.length;
      stats.byFingerprint.set(fingerprint, errors.length);

      for (const error of errors) {
        stats.bySeverity[error.severity]++;
        if (error.timestamp.getTime() > oneHourAgo) {
          stats.recentErrors++;
        }
      }
    }

    return stats;
  }

  /**
   * Mark error for GitHub issue creation
   */
  private async markForGithubReport(entry: ErrorTrackingEntry): Promise<void> {
    this.logger.warn(
      `Error marked for GitHub reporting: ${entry.fingerprint}`,
      JSON.stringify({
        correlationId: entry.correlationId,
        severity: entry.severity,
        message: entry.error.message,
      }),
    );

    // TODO: Integrate with GitHub Issue Service
    // This will be called by a background job or webhook
  }

  /**
   * Check if error should be reported to GitHub
   */
  private shouldReportToGithub(entry: ErrorTrackingEntry): boolean {
    // Only report critical and high severity errors
    if (entry.severity !== ErrorSeverity.CRITICAL && entry.severity !== ErrorSeverity.HIGH) {
      return false;
    }

    // Check if we've already reported this fingerprint
    const existingErrors = this.getErrorsByFingerprint(entry.fingerprint);
    const alreadyReported = existingErrors.some((e) => e.reportedToGithub);

    if (alreadyReported) {
      return false;
    }

    // Check frequency - only report if we've seen this error multiple times
    const threshold = this.configService.get<number>('ERROR_REPORT_THRESHOLD', 5);
    const recentOccurrences = existingErrors.filter(
      (e) => Date.now() - e.timestamp.getTime() < 3600000, // Last hour
    ).length;

    return recentOccurrences >= threshold;
  }

  /**
   * Generate error fingerprint for deduplication
   */
  private generateFingerprint(error: Error, context?: Record<string, any>): string {
    const errorName = error.name || 'Error';
    const errorMessage = error.message.substring(0, 100);
    const contextKey = context ? JSON.stringify(context).substring(0, 50) : '';

    // Extract first line of stack trace for more specific fingerprinting
    const stackLine = error.stack?.split('\n')[1]?.trim().substring(0, 100) || '';

    return `${errorName}:${errorMessage}:${stackLine}:${contextKey}`;
  }

  /**
   * Add error to cache
   */
  private addToCache(entry: ErrorTrackingEntry): void {
    const fingerprint = entry.fingerprint;

    if (!this.errorCache.has(fingerprint)) {
      this.errorCache.set(fingerprint, []);
    }

    const errors = this.errorCache.get(fingerprint)!;
    errors.push(entry);

    // Limit cache size per fingerprint
    if (errors.length > 100) {
      errors.shift(); // Remove oldest
    }

    // Check total cache size
    if (this.errorCache.size > this.maxCacheSize) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up old errors from cache
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [fingerprint, errors] of this.errorCache.entries()) {
      // Remove old errors
      const validErrors = errors.filter(
        (e) => now - e.timestamp.getTime() < this.cacheTTL,
      );

      if (validErrors.length === 0) {
        expiredKeys.push(fingerprint);
      } else if (validErrors.length < errors.length) {
        this.errorCache.set(fingerprint, validErrors);
      }
    }

    // Remove expired fingerprints
    expiredKeys.forEach((key) => this.errorCache.delete(key));

    if (expiredKeys.length > 0) {
      this.logger.debug(
        `Cleaned up ${expiredKeys.length} expired error fingerprints from cache`,
      );
    }
  }

  /**
   * Categorize error severity based on status code and error type
   */
  static categorizeSeverity(statusCode: number, error: Error): ErrorSeverity {
    // 5xx errors are critical or high severity
    if (statusCode >= 500) {
      // Database, external service, or payment errors are critical
      if (
        error.name.includes('Database') ||
        error.name.includes('External') ||
        error.name.includes('Payment') ||
        error.name.includes('AI')
      ) {
        return ErrorSeverity.CRITICAL;
      }
      return ErrorSeverity.HIGH;
    }

    // 4xx errors are typically low to medium severity
    if (statusCode === 401 || statusCode === 403) {
      return ErrorSeverity.MEDIUM;
    }

    if (statusCode >= 400) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }
}
