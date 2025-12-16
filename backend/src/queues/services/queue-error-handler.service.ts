import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES } from '../constants';

/**
 * Global error handler for Bull queues
 * Provides centralized error handling, logging, and notification for failed jobs
 */
@Injectable()
export class QueueErrorHandlerService implements OnModuleInit {
  private readonly logger = new Logger(QueueErrorHandlerService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.DOCUMENT_PROCESSING)
    private readonly documentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EMAIL)
    private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.REPORTS)
    private readonly reportsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BACKUP)
    private readonly backupQueue: Queue,
  ) {}

  /**
   * Initialize error handlers for all queues when module starts
   */
  async onModuleInit() {
    this.logger.log('Initializing global queue error handlers...');

    const queues = [
      { name: QUEUE_NAMES.DOCUMENT_PROCESSING, queue: this.documentQueue },
      { name: QUEUE_NAMES.EMAIL, queue: this.emailQueue },
      { name: QUEUE_NAMES.REPORTS, queue: this.reportsQueue },
      { name: QUEUE_NAMES.NOTIFICATIONS, queue: this.notificationsQueue },
      { name: QUEUE_NAMES.BACKUP, queue: this.backupQueue },
    ];

    for (const { name, queue } of queues) {
      this.attachErrorHandlers(name, queue);
    }

    this.logger.log('Global queue error handlers initialized successfully');
  }

  /**
   * Attach error handlers to a queue
   */
  private attachErrorHandlers(queueName: string, queue: Queue) {
    // Handle job failures
    queue.on('failed', (job, error) => {
      this.handleJobFailure(queueName, job, error);
    });

    // Handle job completion with errors
    queue.on('error', (error) => {
      this.handleQueueError(queueName, error);
    });

    // Handle stalled jobs
    queue.on('stalled', (job) => {
      this.handleStalledJob(queueName, job);
    });

    // Log when jobs complete successfully (debug level)
    queue.on('completed', (job) => {
      this.logger.debug(
        `[${queueName}] Job ${job.id} completed successfully`,
      );
    });

    // Log when jobs are active
    queue.on('active', (job) => {
      this.logger.debug(
        `[${queueName}] Job ${job.id} started processing`,
      );
    });
  }

  /**
   * Handle individual job failures
   */
  private handleJobFailure(queueName: string, job: any, error: Error) {
    const attemptsMade = job.attemptsMade || 0;
    const maxAttempts = job.opts?.attempts || 1;
    const willRetry = attemptsMade < maxAttempts;

    this.logger.error(
      `[${queueName}] Job ${job.id} failed (attempt ${attemptsMade}/${maxAttempts})`,
      {
        jobId: job.id,
        jobName: job.name,
        queueName,
        attemptsMade,
        maxAttempts,
        willRetry,
        error: error.message,
        stack: error.stack,
        jobData: this.sanitizeJobData(job.data),
      },
    );

    // If job won't be retried, send notification
    if (!willRetry) {
      this.sendFailureNotification(queueName, job, error);
    }
  }

  /**
   * Handle queue-level errors
   */
  private handleQueueError(queueName: string, error: Error) {
    this.logger.error(
      `[${queueName}] Queue error occurred`,
      {
        queueName,
        error: error.message,
        stack: error.stack,
      },
    );

    // Send critical alert for queue-level errors
    this.sendCriticalAlert(queueName, error);
  }

  /**
   * Handle stalled jobs (jobs that stopped processing unexpectedly)
   */
  private handleStalledJob(queueName: string, job: any) {
    this.logger.warn(
      `[${queueName}] Job ${job.id} has stalled and will be reprocessed`,
      {
        jobId: job.id,
        jobName: job.name,
        queueName,
        attemptsMade: job.attemptsMade,
        jobData: this.sanitizeJobData(job.data),
      },
    );
  }

  /**
   * Send notification for permanently failed jobs
   */
  private sendFailureNotification(queueName: string, job: any, error: Error) {
    // TODO: Integrate with notification service
    this.logger.error(
      `[${queueName}] Job ${job.id} permanently failed after all retry attempts`,
      {
        jobId: job.id,
        jobName: job.name,
        queueName,
        error: error.message,
        jobData: this.sanitizeJobData(job.data),
        notification: 'PERMANENT_JOB_FAILURE',
      },
    );

    // In production, you would:
    // 1. Send email to administrators
    // 2. Create a database record for manual review
    // 3. Send Slack/Teams notification
    // 4. Trigger PagerDuty alert if critical
  }

  /**
   * Send critical alert for queue-level errors
   */
  private sendCriticalAlert(queueName: string, error: Error) {
    // TODO: Integrate with alerting service
    this.logger.error(
      `[${queueName}] CRITICAL: Queue-level error requires immediate attention`,
      {
        queueName,
        error: error.message,
        alert: 'CRITICAL_QUEUE_ERROR',
      },
    );

    // In production, you would:
    // 1. Send immediate alert to on-call engineer
    // 2. Trigger PagerDuty/OpsGenie incident
    // 3. Send critical Slack notification
  }

  /**
   * Sanitize job data to remove sensitive information from logs
   */
  private sanitizeJobData(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'authorization',
      'creditCard',
      'ssn',
    ];

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Get failed jobs for a specific queue
   */
  async getFailedJobs(queueName: string, limit = 50) {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.getFailed(0, limit);
  }

  /**
   * Retry a specific failed job
   */
  async retryFailedJob(queueName: string, jobId: string) {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    await job.retry();
    this.logger.log(`[${queueName}] Job ${jobId} scheduled for retry`);

    return job;
  }

  /**
   * Get queue by name
   */
  private getQueueByName(queueName: string): Queue | null {
    switch (queueName) {
      case QUEUE_NAMES.DOCUMENT_PROCESSING:
        return this.documentQueue;
      case QUEUE_NAMES.EMAIL:
        return this.emailQueue;
      case QUEUE_NAMES.REPORTS:
        return this.reportsQueue;
      case QUEUE_NAMES.NOTIFICATIONS:
        return this.notificationsQueue;
      case QUEUE_NAMES.BACKUP:
        return this.backupQueue;
      default:
        return null;
    }
  }

  /**
   * Get queue statistics for monitoring
   */
  async getQueueStats(queueName: string) {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getPausedCount(),
    ]);

    return {
      queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get statistics for all queues
   */
  async getAllQueueStats() {
    const queueNames = Object.values(QUEUE_NAMES) as string[];
    const stats = await Promise.all(
      queueNames.map((name) => this.getQueueStats(name)),
    );

    return stats;
  }
}
