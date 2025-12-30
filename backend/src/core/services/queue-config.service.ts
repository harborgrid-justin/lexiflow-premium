import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * QueueConfigService
 *
 * Provides globally injectable access to queue configuration.
 * Consolidates job timeout, retries, backoff, and cleanup settings.
 */
@Injectable()
export class QueueConfigService {
  // Job Settings
  get jobTimeoutMs(): number {
    return MasterConfig.QUEUE_JOB_TIMEOUT_MS;
  }

  get maxAttempts(): number {
    return MasterConfig.QUEUE_MAX_ATTEMPTS;
  }

  get backoffDelayMs(): number {
    return MasterConfig.QUEUE_BACKOFF_DELAY_MS;
  }

  get backoffType(): string {
    return MasterConfig.QUEUE_BACKOFF_TYPE;
  }

  // Cleanup Settings
  get removeOnComplete(): number | boolean {
    return MasterConfig.QUEUE_REMOVE_ON_COMPLETE;
  }

  get removeOnFail(): number | boolean {
    return MasterConfig.QUEUE_REMOVE_ON_FAIL;
  }

  // Stalled Job Handling
  get maxStalledCount(): number {
    return MasterConfig.QUEUE_MAX_STALLED_COUNT;
  }

  get stalledIntervalMs(): number {
    return MasterConfig.QUEUE_STALLED_INTERVAL_MS;
  }

  // Features
  get enablePriority(): boolean {
    return MasterConfig.QUEUE_ENABLE_PRIORITY;
  }

  get enableDelay(): boolean {
    return MasterConfig.QUEUE_ENABLE_DELAY;
  }

  // Queue-specific Concurrency
  get documentConcurrency(): number {
    return MasterConfig.QUEUE_DOCUMENT_CONCURRENCY;
  }

  get emailConcurrency(): number {
    return MasterConfig.QUEUE_EMAIL_CONCURRENCY;
  }

  get notificationConcurrency(): number {
    return MasterConfig.QUEUE_NOTIFICATION_CONCURRENCY;
  }

  get reportConcurrency(): number {
    return MasterConfig.QUEUE_REPORT_CONCURRENCY;
  }

  get backupConcurrency(): number {
    return MasterConfig.QUEUE_BACKUP_CONCURRENCY;
  }

  /**
   * Get concurrency for a specific queue
   */
  getConcurrency(queueName: string): number {
    const concurrencyMap: Record<string, number> = {
      'document-processing': this.documentConcurrency,
      email: this.emailConcurrency,
      notification: this.notificationConcurrency,
      reports: this.reportConcurrency,
      backup: this.backupConcurrency,
    };
    return concurrencyMap[queueName] || 5; // default concurrency
  }

  /**
   * Get default job options for Bull
   */
  getDefaultJobOptions(): Record<string, unknown> {
    return {
      attempts: this.maxAttempts,
      backoff: {
        type: this.backoffType,
        delay: this.backoffDelayMs,
      },
      removeOnComplete: this.removeOnComplete,
      removeOnFail: this.removeOnFail,
      timeout: this.jobTimeoutMs,
    };
  }

  /**
   * Get queue-specific job options
   */
  getQueueJobOptions(queueName: string): Record<string, unknown> {
    const baseOptions = this.getDefaultJobOptions();

    const queueOverrides: Record<string, Partial<Record<string, unknown>>> = {
      'document-processing': {
        timeout: 600000, // 10 minutes for document processing
        attempts: 3,
      },
      email: {
        timeout: 30000,
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
      },
      backup: {
        timeout: 3600000, // 1 hour for backups
        attempts: 2,
      },
    };

    return { ...baseOptions, ...queueOverrides[queueName] };
  }

  /**
   * Get summary of configuration
   */
  getSummary(): Record<string, unknown> {
    return {
      job: {
        timeoutMs: this.jobTimeoutMs,
        maxAttempts: this.maxAttempts,
        backoffType: this.backoffType,
        backoffDelayMs: this.backoffDelayMs,
      },
      cleanup: {
        removeOnComplete: this.removeOnComplete,
        removeOnFail: this.removeOnFail,
      },
      stalled: {
        maxCount: this.maxStalledCount,
        intervalMs: this.stalledIntervalMs,
      },
      concurrency: {
        document: this.documentConcurrency,
        email: this.emailConcurrency,
        notification: this.notificationConcurrency,
        report: this.reportConcurrency,
        backup: this.backupConcurrency,
      },
    };
  }
}
