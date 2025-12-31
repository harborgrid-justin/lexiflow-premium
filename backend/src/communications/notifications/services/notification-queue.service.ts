import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { QueuedDelivery, DeliveryAttempt, EmailPayload, SMSPayload, PushPayload, SlackPayload } from '../types';
import { DeliveryChannel } from '../dto/delivery-preferences.dto';

/**
 * Notification Queue Service
 *
 * Manages queuing and retry logic for failed notification deliveries:
 * - Queue management with priority ordering
 * - Exponential backoff retry strategy
 * - Failed delivery tracking
 * - Dead letter queue for permanent failures
 * - Automatic cleanup of old deliveries
 * - Metrics and monitoring
 *
 * In production, integrate with actual queue services:
 * - Bull (Redis-based queue)
 * - AWS SQS
 * - RabbitMQ
 *
 * @class NotificationQueueService
 */
/**
 * ╔=================================================================================================================╗
 * ║NOTIFICATIONQUEUE                                                                                                ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class NotificationQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationQueueService.name);

  // In-memory queue (for development/testing)
  private queue: Map<string, QueuedDelivery> = new Map();
  private deadLetterQueue: Map<string, QueuedDelivery> = new Map();

  // Queue processing
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL_MS = 5000; // 5 seconds
  private readonly MAX_QUEUE_SIZE = 10000;
  private readonly DEAD_LETTER_TTL_DAYS = 7;

  // Retry configuration
  private readonly DEFAULT_MAX_ATTEMPTS = 3;
  private readonly BASE_RETRY_DELAY_MS = 1000; // 1 second
  private readonly RETRY_BACKOFF_MULTIPLIER = 2;
  private readonly MAX_RETRY_DELAY_MS = 300000; // 5 minutes

  constructor() {
    this.logger.log('NotificationQueueService initialized');
    this.startProcessing();
  }

  onModuleDestroy(): void {
    this.stopProcessing();
    this.queue.clear();
    this.deadLetterQueue.clear();
    this.logger.log('NotificationQueueService destroyed');
  }

  /**
   * Enqueue a delivery job
   */
  async enqueue(
    userId: string,
    channel: DeliveryChannel,
    payload: EmailPayload | SMSPayload | PushPayload | SlackPayload,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      maxAttempts?: number;
      delayMs?: number;
    },
  ): Promise<string> {
    // Check queue size limit
    if (this.queue.size >= this.MAX_QUEUE_SIZE) {
      throw new Error('Queue is full, cannot enqueue more deliveries');
    }

    const jobId = `queue-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const priority = options?.priority || 'medium';
    const maxAttempts = options?.maxAttempts || this.DEFAULT_MAX_ATTEMPTS;

    const queuedDelivery: QueuedDelivery = {
      id: jobId,
      userId,
      channel,
      payload,
      attempts: [],
      maxAttempts,
      nextRetryAt: options?.delayMs ? new Date(Date.now() + options.delayMs) : new Date(),
      createdAt: new Date(),
      status: 'pending',
      priority,
    };

    this.queue.set(jobId, queuedDelivery);

    this.logger.debug(
      `Enqueued delivery job ${jobId} for user ${userId} on channel ${channel} (priority: ${priority})`,
    );

    return jobId;
  }

  /**
   * Record delivery attempt
   */
  recordAttempt(
    jobId: string,
    success: boolean,
    error?: string,
    messageId?: string,
  ): void {
    const job = this.queue.get(jobId);
    if (!job) {
      this.logger.warn(`Cannot record attempt: job ${jobId} not found in queue`);
      return;
    }

    const attempt: DeliveryAttempt = {
      attemptNumber: job.attempts.length + 1,
      timestamp: new Date(),
      success,
      error,
      messageId,
    };

    job.attempts.push(attempt);

    if (success) {
      job.status = 'completed';
      job.completedAt = new Date();
      this.logger.log(`Delivery job ${jobId} completed successfully`);
    } else if (job.attempts.length >= job.maxAttempts) {
      job.status = 'failed';
      job.completedAt = new Date();
      this.moveToDeadLetterQueue(job);
      this.logger.error(`Delivery job ${jobId} failed after ${job.maxAttempts} attempts`);
    } else {
      // Schedule retry
      const retryDelay = this.calculateRetryDelay(job.attempts.length);
      job.nextRetryAt = new Date(Date.now() + retryDelay);
      job.status = 'pending';
      this.logger.debug(
        `Delivery job ${jobId} will retry in ${retryDelay}ms (attempt ${job.attempts.length}/${job.maxAttempts})`,
      );
    }

    this.queue.set(jobId, job);
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): QueuedDelivery | null {
    return this.queue.get(jobId) || this.deadLetterQueue.get(jobId) || null;
  }

  /**
   * Get pending jobs ready for processing
   */
  getPendingJobs(): QueuedDelivery[] {
    const now = new Date();
    const pendingJobs = Array.from(this.queue.values())
      .filter(job => {
        return (
          job.status === 'pending' &&
          (!job.nextRetryAt || job.nextRetryAt <= now)
        );
      })
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return pendingJobs;
  }

  /**
   * Start processing queue
   */
  private startProcessing(): void {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.PROCESSING_INTERVAL_MS);

    this.logger.log('Queue processing started');
  }

  /**
   * Stop processing queue
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      this.logger.log('Queue processing stopped');
    }
  }

  /**
   * Process queue (stub for actual processing)
   */
  private processQueue(): void {
    const pendingJobs = this.getPendingJobs();

    if (pendingJobs.length === 0) {
      return;
    }

    this.logger.debug(`Processing ${pendingJobs.length} pending jobs`);

    // In production, this would be handled by the delivery service
    // For now, we just mark jobs as ready for processing
    pendingJobs.forEach(job => {
      if (job.status === 'pending') {
        job.status = 'processing';
        this.queue.set(job.id, job);
      }
    });

    // Cleanup old completed/failed jobs
    this.cleanup();
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attemptNumber: number): number {
    const delay = this.BASE_RETRY_DELAY_MS * Math.pow(this.RETRY_BACKOFF_MULTIPLIER, attemptNumber);
    return Math.min(delay, this.MAX_RETRY_DELAY_MS);
  }

  /**
   * Move failed job to dead letter queue
   */
  private moveToDeadLetterQueue(job: QueuedDelivery): void {
    this.deadLetterQueue.set(job.id, job);
    this.queue.delete(job.id);
    this.logger.warn(`Job ${job.id} moved to dead letter queue`);
  }

  /**
   * Get dead letter queue jobs
   */
  getDeadLetterJobs(): QueuedDelivery[] {
    return Array.from(this.deadLetterQueue.values());
  }

  /**
   * Retry job from dead letter queue
   */
  retryDeadLetterJob(jobId: string): boolean {
    const job = this.deadLetterQueue.get(jobId);
    if (!job) {
      this.logger.warn(`Job ${jobId} not found in dead letter queue`);
      return false;
    }

    // Reset job for retry
    job.status = 'pending';
    job.attempts = [];
    job.nextRetryAt = new Date();
    job.completedAt = undefined;

    this.queue.set(jobId, job);
    this.deadLetterQueue.delete(jobId);

    this.logger.log(`Job ${jobId} moved from dead letter queue back to main queue`);
    return true;
  }

  /**
   * Remove job from queue
   */
  removeJob(jobId: string): boolean {
    const removed = this.queue.delete(jobId) || this.deadLetterQueue.delete(jobId);
    if (removed) {
      this.logger.debug(`Job ${jobId} removed from queue`);
    }
    return removed;
  }

  /**
   * Cleanup old completed/failed jobs
   */
  private cleanup(): void {
    const now = Date.now();
    const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for main queue
    const DLQ_TTL_MS = this.DEAD_LETTER_TTL_DAYS * 24 * 60 * 60 * 1000;

    let removedCount = 0;

    // Cleanup main queue
    for (const [id, job] of this.queue.entries()) {
      if (
        job.status === 'completed' &&
        job.completedAt &&
        now - job.completedAt.getTime() > TTL_MS
      ) {
        this.queue.delete(id);
        removedCount++;
      }
    }

    // Cleanup dead letter queue
    for (const [id, job] of this.deadLetterQueue.entries()) {
      if (
        job.completedAt &&
        now - job.completedAt.getTime() > DLQ_TTL_MS
      ) {
        this.deadLetterQueue.delete(id);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(`Cleanup: Removed ${removedCount} old jobs from queues`);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queueSize: number;
    deadLetterQueueSize: number;
    pendingJobs: number;
    processingJobs: number;
    completedJobs: number;
    failedJobs: number;
    byPriority: Record<string, number>;
    byChannel: Record<string, number>;
  } {
    const jobs = Array.from(this.queue.values());

    const stats = {
      queueSize: this.queue.size,
      deadLetterQueueSize: this.deadLetterQueue.size,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      processingJobs: jobs.filter(j => j.status === 'processing').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      byPriority: {
        urgent: jobs.filter(j => j.priority === 'urgent').length,
        high: jobs.filter(j => j.priority === 'high').length,
        medium: jobs.filter(j => j.priority === 'medium').length,
        low: jobs.filter(j => j.priority === 'low').length,
      },
      byChannel: {
        email: jobs.filter(j => j.channel === DeliveryChannel.EMAIL).length,
        sms: jobs.filter(j => j.channel === DeliveryChannel.SMS).length,
        push: jobs.filter(j => j.channel === DeliveryChannel.PUSH).length,
        in_app: jobs.filter(j => j.channel === DeliveryChannel.IN_APP).length,
        slack: jobs.filter(j => j.channel === DeliveryChannel.SLACK).length,
      },
    };

    return stats;
  }

  /**
   * Clear all queues (use with caution!)
   */
  clearAll(): void {
    const mainQueueSize = this.queue.size;
    const dlqSize = this.deadLetterQueue.size;

    this.queue.clear();
    this.deadLetterQueue.clear();

    this.logger.warn(
      `Cleared all queues: ${mainQueueSize} main queue jobs, ${dlqSize} DLQ jobs`,
    );
  }
}
