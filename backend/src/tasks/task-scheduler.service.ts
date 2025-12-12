import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Scheduled task definition
 */
export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  schedule: TaskSchedule;
  action: TaskAction;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  failureCount: number;
  metadata?: Record<string, any>;
}

export interface TaskSchedule {
  type: 'cron' | 'interval' | 'once' | 'recurring';
  cronExpression?: string;
  intervalMs?: number;
  startDate?: Date;
  endDate?: Date;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    time?: string;
  };
}

export interface TaskAction {
  type: 'webhook' | 'email' | 'workflow' | 'script' | 'notification';
  config: Record<string, any>;
}

/**
 * Task Scheduler Service
 * Handles scheduled task execution
 */
@Injectable()
export class TaskSchedulerService {
  private readonly logger = new Logger(TaskSchedulerService.name);
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a scheduled task
   */
  registerTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task);

    if (task.enabled) {
      this.scheduleTask(task);
    }

    this.logger.log(`Registered scheduled task: ${task.name} (${task.id})`);
  }

  /**
   * Unregister a scheduled task
   */
  unregisterTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      this.cancelSchedule(taskId);
      this.tasks.delete(taskId);
      this.logger.log(`Unregistered scheduled task: ${taskId}`);
    }
  }

  /**
   * Schedule task execution
   */
  private scheduleTask(task: ScheduledTask): void {
    const schedule = task.schedule;

    switch (schedule.type) {
      case 'interval':
        if (schedule.intervalMs) {
          this.scheduleInterval(task, schedule.intervalMs);
        }
        break;

      case 'once':
        if (schedule.startDate) {
          this.scheduleOnce(task, schedule.startDate);
        }
        break;

      case 'recurring':
        if (schedule.recurrence) {
          this.scheduleRecurring(task, schedule.recurrence);
        }
        break;

      case 'cron':
        // Cron tasks are handled by @Cron decorators
        break;
    }
  }

  /**
   * Schedule interval-based task
   */
  private scheduleInterval(task: ScheduledTask, intervalMs: number): void {
    const interval = setInterval(async () => {
      await this.executeTask(task);
    }, intervalMs);

    this.intervals.set(task.id, interval);

    // Calculate next run
    task.nextRun = new Date(Date.now() + intervalMs);
  }

  /**
   * Schedule one-time task
   */
  private scheduleOnce(task: ScheduledTask, runDate: Date): void {
    const delay = runDate.getTime() - Date.now();

    if (delay > 0) {
      const timeout = setTimeout(async () => {
        await this.executeTask(task);
        this.intervals.delete(task.id);
      }, delay);

      this.intervals.set(task.id, timeout as any);
      task.nextRun = runDate;
    }
  }

  /**
   * Schedule recurring task
   */
  private scheduleRecurring(
    task: ScheduledTask,
    recurrence: NonNullable<TaskSchedule['recurrence']>,
  ): void {
    const intervalMs = this.calculateRecurrenceInterval(recurrence);

    if (intervalMs > 0) {
      this.scheduleInterval(task, intervalMs);
    }
  }

  /**
   * Calculate interval in milliseconds for recurrence
   */
  private calculateRecurrenceInterval(
    recurrence: NonNullable<TaskSchedule['recurrence']>,
  ): number {
    const baseInterval = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      yearly: 365 * 24 * 60 * 60 * 1000,
    };

    return baseInterval[recurrence.frequency] * recurrence.interval;
  }

  /**
   * Execute a scheduled task
   */
  private async executeTask(task: ScheduledTask): Promise<void> {
    try {
      this.logger.log(`Executing scheduled task: ${task.name}`);

      // Check if task is within date range
      const now = new Date();
      if (task.schedule.startDate && now < task.schedule.startDate) {
        return;
      }
      if (task.schedule.endDate && now > task.schedule.endDate) {
        this.cancelSchedule(task.id);
        return;
      }

      // Execute task action
      await this.executeAction(task.action, task);

      // Update task stats
      task.lastRun = now;
      task.runCount++;

      this.logger.log(
        `Successfully executed scheduled task: ${task.name} (run count: ${task.runCount})`,
      );
    } catch (error) {
      task.failureCount++;
      this.logger.error(`Failed to execute scheduled task ${task.name}:`, error);

      // Disable task after 5 consecutive failures
      if (task.failureCount >= 5) {
        this.logger.warn(
          `Disabling task ${task.name} after ${task.failureCount} failures`,
        );
        task.enabled = false;
        this.cancelSchedule(task.id);
      }
    }
  }

  /**
   * Execute task action
   */
  private async executeAction(
    action: TaskAction,
    task: ScheduledTask,
  ): Promise<void> {
    switch (action.type) {
      case 'webhook':
        await this.executeWebhook(action.config);
        break;

      case 'email':
        await this.sendEmail(action.config);
        break;

      case 'workflow':
        await this.triggerWorkflow(action.config);
        break;

      case 'script':
        await this.executeScript(action.config);
        break;

      case 'notification':
        await this.sendNotification(action.config);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute webhook action
   */
  private async executeWebhook(config: Record<string, any>): Promise<void> {
    // Implementation would call external webhook
    this.logger.debug(`Webhook executed: ${config.url}`);
  }

  /**
   * Send email action
   */
  private async sendEmail(config: Record<string, any>): Promise<void> {
    // Implementation would send email
    this.logger.debug(`Email sent to: ${config.to}`);
  }

  /**
   * Trigger workflow action
   */
  private async triggerWorkflow(config: Record<string, any>): Promise<void> {
    // Implementation would trigger workflow
    this.logger.debug(`Workflow triggered: ${config.workflowId}`);
  }

  /**
   * Execute script action
   */
  private async executeScript(config: Record<string, any>): Promise<void> {
    // Implementation would execute script safely
    this.logger.debug(`Script executed: ${config.scriptName}`);
  }

  /**
   * Send notification action
   */
  private async sendNotification(config: Record<string, any>): Promise<void> {
    // Implementation would send notification
    this.logger.debug(`Notification sent to: ${config.recipients}`);
  }

  /**
   * Cancel task schedule
   */
  private cancelSchedule(taskId: string): void {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      clearTimeout(interval);
      this.intervals.delete(taskId);
    }
  }

  /**
   * Get all scheduled tasks
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Enable task
   */
  enableTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && !task.enabled) {
      task.enabled = true;
      this.scheduleTask(task);
      this.logger.log(`Enabled task: ${task.name}`);
    }
  }

  /**
   * Disable task
   */
  disableTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.enabled) {
      task.enabled = false;
      this.cancelSchedule(taskId);
      this.logger.log(`Disabled task: ${task.name}`);
    }
  }

  /**
   * Run task immediately
   */
  async runTaskNow(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    await this.executeTask(task);
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    // Cancel all intervals
    this.intervals.forEach((interval) => {
      clearInterval(interval);
      clearTimeout(interval);
    });
    this.intervals.clear();

    this.logger.log('Task scheduler cleanup completed');
  }

  /**
   * Example cron job - Daily deadline check
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyDeadlineCheck(): Promise<void> {
    this.logger.log('Running daily deadline check');
    // Implementation would check upcoming deadlines
  }

  /**
   * Example cron job - Weekly report generation
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyReports(): Promise<void> {
    this.logger.log('Generating weekly reports');
    // Implementation would generate reports
  }
}
