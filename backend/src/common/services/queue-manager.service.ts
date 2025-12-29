import { Injectable, Logger } from '@nestjs/common';
import { Queue, Job } from 'bull';

/**
 * Job Priority Levels
 */
export enum JobPriority {
  LOW = 10,
  NORMAL = 5,
  HIGH = 1,
  CRITICAL = 0,
}

/**
 * Job Options
 */
export interface JobOptions {
  priority?: JobPriority;
  delay?: number; // milliseconds
  attempts?: number;
  backoff?: number | { type: 'fixed' | 'exponential'; delay: number };
  timeout?: number;
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

/**
 * Queue Manager Service
 * Provides enterprise-grade background job processing with Bull
 * Supports priorities, retries, delays, and job scheduling
 * 
 * @example
 * await queueManager.addJob('document-ocr', {
 *   documentId: 'doc123',
 *   pages: 50
 * }, { priority: JobPriority.HIGH });
 */
@Injectable()
export class QueueManagerService {
  private readonly logger = new Logger(QueueManagerService.name);
  private queues: Map<string, Queue> = new Map();

  /**
   * Add job to queue
   */
  async addJob<T = any>(
    queueName: string,
    data: T,
    options: JobOptions = {},
  ): Promise<Job<T>> {
    const queue = this.getOrCreateQueue(queueName);

    const job = await queue.add(data, {
      priority: options.priority || JobPriority.NORMAL,
      delay: options.delay,
      attempts: options.attempts || 3,
      backoff: options.backoff || { type: 'exponential', delay: 2000 },
      timeout: options.timeout,
      removeOnComplete: options.removeOnComplete ?? true,
      removeOnFail: options.removeOnFail ?? false,
    });

    this.logger.log(`Added job ${job.id} to queue ${queueName}`);
    return job;
  }

  /**
   * Add bulk jobs
   */
  async addBulkJobs<T = any>(
    queueName: string,
    jobs: Array<{ data: T; options?: JobOptions }>,
  ): Promise<Job<T>[]> {
    const queue = this.getOrCreateQueue(queueName);

    const bullJobs = jobs.map((job) => ({
      data: job.data,
      opts: {
        priority: job.options?.priority || JobPriority.NORMAL,
        delay: job.options?.delay,
        attempts: job.options?.attempts || 3,
        backoff: job.options?.backoff || { type: 'exponential', delay: 2000 },
      },
    }));

    const addedJobs = await queue.addBulk(bullJobs);
    this.logger.log(`Added ${addedJobs.length} jobs to queue ${queueName}`);
    return addedJobs;
  }

  /**
   * Schedule recurring job (cron)
   */
  async scheduleJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    cronExpression: string,
  ): Promise<Job<T>> {
    const queue = this.getOrCreateQueue(queueName);

    const job = await queue.add(data, {
      repeat: {
        cron: cronExpression,
      },
      jobId: jobName, // Prevents duplicates
    });

    this.logger.log(`Scheduled job ${jobName} on queue ${queueName} (cron: ${cronExpression})`);
    return job;
  }

  /**
   * Get job by ID
   */
  async getJob(queueName: string, jobId: string): Promise<Job | null> {
    const queue = this.getOrCreateQueue(queueName);
    return queue.getJob(jobId);
  }

  /**
   * Get job status
   */
  async getJobStatus(
    queueName: string,
    jobId: string,
  ): Promise<JobStatus | null> {
    const job = await this.getJob(queueName, jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      id: String(job.id),
      state,
      progress: job.progress(),
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  /**
   * Remove job
   */
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Removed job ${jobId} from queue ${queueName}`);
    }
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.pause();
    this.logger.log(`Paused queue ${queueName}`);
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.resume();
    this.logger.log(`Resumed queue ${queueName}`);
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics(queueName: string): Promise<QueueMetrics> {
    const queue = this.getOrCreateQueue(queueName);

    const [waiting, active, completed, failed, delayed, paused] =
      await Promise.all([
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
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Clean old jobs
   */
  async cleanQueue(
    queueName: string,
    grace: number = 3600000, // 1 hour
    status?: 'completed' | 'failed',
  ): Promise<string[]> {
    const queue = this.getOrCreateQueue(queueName);
    const cleaned = await queue.clean(grace, status);
    this.logger.log(`Cleaned ${cleaned.length} ${status} jobs from ${queueName}`);
    return cleaned.map((job: unknown) => String((job as any).id || job));
  }

  private getOrCreateQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      throw new Error(
        `Queue "${queueName}" is not configured. ` +
        `Please register the queue in the module imports using BullModule.registerQueue({ name: '${queueName}' }) ` +
        `or inject it with @InjectQueue('${queueName}') in the constructor.`
      );
    }

    return this.queues.get(queueName)!;
  }

  /**
   * Register a queue instance
   * Should be called by dependency injection when queues are provided
   */
  registerQueue(queueName: string, queue: Queue): void {
    if (this.queues.has(queueName)) {
      this.logger.warn(`Queue ${queueName} is already registered, replacing with new instance`);
    }
    this.queues.set(queueName, queue);
    this.logger.log(`Registered queue: ${queueName}`);
  }

  /**
   * Check if a queue is registered
   */
  hasQueue(queueName: string): boolean {
    return this.queues.has(queueName);
  }

  /**
   * Get all registered queue names
   */
  getRegisteredQueues(): string[] {
    return Array.from(this.queues.keys());
  }
}

export interface JobStatus {
  id: string;
  state: string;
  progress: number | object;
  data: unknown;
  returnvalue: unknown;
  failedReason?: string;
  attemptsMade: number;
  processedOn?: number;
  finishedOn?: number;
}

export interface QueueMetrics {
  queueName: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  total: number;
}
