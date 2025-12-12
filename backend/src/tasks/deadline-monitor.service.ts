import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Deadline item
 */
export interface DeadlineItem {
  id: string;
  entityType: 'case' | 'task' | 'document' | 'motion' | 'hearing';
  entityId: string;
  entityName: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: DeadlineStatus;
  assigneeId?: string;
  assigneeName?: string;
  description?: string;
  remindersSent: number;
  lastReminderSent?: Date;
  metadata?: Record<string, any>;
}

export enum DeadlineStatus {
  UPCOMING = 'upcoming',
  DUE_SOON = 'due_soon',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Reminder configuration
 */
export interface ReminderConfig {
  enabled: boolean;
  intervals: number[]; // Days before deadline to send reminders
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  escalationEnabled: boolean;
  escalationDays: number;
  escalateTo?: string[];
}

/**
 * Deadline alert
 */
export interface DeadlineAlert {
  id: string;
  deadlineId: string;
  alertType: 'reminder' | 'escalation' | 'overdue';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  sentAt: Date;
  recipients: string[];
}

/**
 * Deadline Monitor Service
 * Tracks deadlines and sends alerts
 */
@Injectable()
export class DeadlineMonitorService {
  private readonly logger = new Logger(DeadlineMonitorService.name);
  private deadlines: Map<string, DeadlineItem> = new Map();
  private alerts: DeadlineAlert[] = [];

  private readonly defaultReminderConfig: ReminderConfig = {
    enabled: true,
    intervals: [30, 14, 7, 3, 1], // 30, 14, 7, 3, 1 days before
    channels: ['email', 'in-app'],
    escalationEnabled: true,
    escalationDays: 1,
  };

  /**
   * Add deadline to monitoring
   */
  addDeadline(deadline: DeadlineItem): void {
    this.deadlines.set(deadline.id, deadline);
    this.updateDeadlineStatus(deadline);

    this.logger.log(
      `Deadline added: ${deadline.entityName} (${deadline.entityType}) - Due: ${deadline.deadline}`,
    );
  }

  /**
   * Remove deadline from monitoring
   */
  removeDeadline(deadlineId: string): void {
    const deadline = this.deadlines.get(deadlineId);
    if (deadline) {
      this.deadlines.delete(deadlineId);
      this.logger.log(`Deadline removed: ${deadlineId}`);
    }
  }

  /**
   * Update deadline status based on current date
   */
  updateDeadlineStatus(deadline: DeadlineItem): void {
    if (
      deadline.status === DeadlineStatus.COMPLETED ||
      deadline.status === DeadlineStatus.CANCELLED
    ) {
      return;
    }

    const now = new Date();
    const deadlineDate = new Date(deadline.deadline);
    const daysUntilDeadline = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilDeadline < 0) {
      deadline.status = DeadlineStatus.OVERDUE;
    } else if (daysUntilDeadline <= 7) {
      deadline.status = DeadlineStatus.DUE_SOON;
    } else {
      deadline.status = DeadlineStatus.UPCOMING;
    }
  }

  /**
   * Mark deadline as completed
   */
  completeDeadline(deadlineId: string): void {
    const deadline = this.deadlines.get(deadlineId);
    if (deadline) {
      deadline.status = DeadlineStatus.COMPLETED;
      this.logger.log(`Deadline completed: ${deadline.entityName}`);
    }
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(days: number = 30): DeadlineItem[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return Array.from(this.deadlines.values())
      .filter(
        (deadline) =>
          deadline.status !== DeadlineStatus.COMPLETED &&
          deadline.status !== DeadlineStatus.CANCELLED &&
          new Date(deadline.deadline) <= futureDate &&
          new Date(deadline.deadline) >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
  }

  /**
   * Get overdue deadlines
   */
  getOverdueDeadlines(): DeadlineItem[] {
    return Array.from(this.deadlines.values())
      .filter((deadline) => deadline.status === DeadlineStatus.OVERDUE)
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
  }

  /**
   * Get deadlines by assignee
   */
  getDeadlinesByAssignee(assigneeId: string): DeadlineItem[] {
    return Array.from(this.deadlines.values())
      .filter(
        (deadline) =>
          deadline.assigneeId === assigneeId &&
          deadline.status !== DeadlineStatus.COMPLETED &&
          deadline.status !== DeadlineStatus.CANCELLED,
      )
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
  }

  /**
   * Get deadlines by entity
   */
  getDeadlinesByEntity(
    entityType: DeadlineItem['entityType'],
    entityId: string,
  ): DeadlineItem[] {
    return Array.from(this.deadlines.values()).filter(
      (deadline) =>
        deadline.entityType === entityType && deadline.entityId === entityId,
    );
  }

  /**
   * Send deadline reminder
   */
  private async sendReminder(
    deadline: DeadlineItem,
    daysUntilDeadline: number,
  ): Promise<void> {
    const alert: DeadlineAlert = {
      id: `alert-${Date.now()}`,
      deadlineId: deadline.id,
      alertType: 'reminder',
      severity: this.getSeverity(daysUntilDeadline),
      message: this.buildReminderMessage(deadline, daysUntilDeadline),
      sentAt: new Date(),
      recipients: deadline.assigneeId ? [deadline.assigneeId] : [],
    };

    this.alerts.push(alert);
    deadline.remindersSent++;
    deadline.lastReminderSent = new Date();

    this.logger.log(
      `Reminder sent for deadline: ${deadline.entityName} (${daysUntilDeadline} days remaining)`,
    );

    // Implementation would send actual notifications
  }

  /**
   * Send escalation alert
   */
  private async sendEscalation(deadline: DeadlineItem): Promise<void> {
    const alert: DeadlineAlert = {
      id: `alert-${Date.now()}`,
      deadlineId: deadline.id,
      alertType: 'escalation',
      severity: 'critical',
      message: `ESCALATION: Deadline approaching for ${deadline.entityName}`,
      sentAt: new Date(),
      recipients: this.defaultReminderConfig.escalateTo || [],
    };

    this.alerts.push(alert);

    this.logger.warn(`Escalation sent for deadline: ${deadline.entityName}`);

    // Implementation would send actual notifications
  }

  /**
   * Send overdue alert
   */
  private async sendOverdueAlert(deadline: DeadlineItem): Promise<void> {
    const alert: DeadlineAlert = {
      id: `alert-${Date.now()}`,
      deadlineId: deadline.id,
      alertType: 'overdue',
      severity: 'critical',
      message: `OVERDUE: Deadline missed for ${deadline.entityName}`,
      sentAt: new Date(),
      recipients: deadline.assigneeId ? [deadline.assigneeId] : [],
    };

    this.alerts.push(alert);

    this.logger.error(`Overdue alert sent for deadline: ${deadline.entityName}`);

    // Implementation would send actual notifications
  }

  /**
   * Get severity based on days until deadline
   */
  private getSeverity(
    daysUntilDeadline: number,
  ): DeadlineAlert['severity'] {
    if (daysUntilDeadline <= 1) {
      return 'critical';
    } else if (daysUntilDeadline <= 7) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /**
   * Build reminder message
   */
  private buildReminderMessage(
    deadline: DeadlineItem,
    daysUntilDeadline: number,
  ): string {
    const dayText =
      daysUntilDeadline === 1 ? 'tomorrow' : `in ${daysUntilDeadline} days`;

    return `Reminder: ${deadline.entityName} (${deadline.entityType}) is due ${dayText}`;
  }

  /**
   * Check deadlines and send reminders (runs hourly)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkDeadlines(): Promise<void> {
    this.logger.log('Running deadline check...');

    const now = new Date();

    for (const deadline of this.deadlines.values()) {
      // Skip completed/cancelled
      if (
        deadline.status === DeadlineStatus.COMPLETED ||
        deadline.status === DeadlineStatus.CANCELLED
      ) {
        continue;
      }

      // Update status
      this.updateDeadlineStatus(deadline);

      const deadlineDate = new Date(deadline.deadline);
      const daysUntilDeadline = Math.ceil(
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Check for overdue
      if (deadline.status === DeadlineStatus.OVERDUE) {
        await this.sendOverdueAlert(deadline);
        continue;
      }

      // Check if reminder should be sent
      if (this.shouldSendReminder(deadline, daysUntilDeadline)) {
        await this.sendReminder(deadline, daysUntilDeadline);
      }

      // Check if escalation needed
      if (
        this.defaultReminderConfig.escalationEnabled &&
        daysUntilDeadline <= this.defaultReminderConfig.escalationDays
      ) {
        await this.sendEscalation(deadline);
      }
    }

    this.logger.log('Deadline check completed');
  }

  /**
   * Check if reminder should be sent
   */
  private shouldSendReminder(
    deadline: DeadlineItem,
    daysUntilDeadline: number,
  ): boolean {
    // Check if this day is in reminder intervals
    if (!this.defaultReminderConfig.intervals.includes(daysUntilDeadline)) {
      return false;
    }

    // Check if reminder already sent today
    if (deadline.lastReminderSent) {
      const lastSent = new Date(deadline.lastReminderSent);
      const today = new Date();
      if (
        lastSent.getFullYear() === today.getFullYear() &&
        lastSent.getMonth() === today.getMonth() &&
        lastSent.getDate() === today.getDate()
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get deadline statistics
   */
  getStatistics(): {
    total: number;
    upcoming: number;
    dueSoon: number;
    overdue: number;
    completed: number;
    byPriority: Record<string, number>;
    byEntityType: Record<string, number>;
  } {
    const stats = {
      total: this.deadlines.size,
      upcoming: 0,
      dueSoon: 0,
      overdue: 0,
      completed: 0,
      byPriority: {} as Record<string, number>,
      byEntityType: {} as Record<string, number>,
    };

    this.deadlines.forEach((deadline) => {
      // Count by status
      switch (deadline.status) {
        case DeadlineStatus.UPCOMING:
          stats.upcoming++;
          break;
        case DeadlineStatus.DUE_SOON:
          stats.dueSoon++;
          break;
        case DeadlineStatus.OVERDUE:
          stats.overdue++;
          break;
        case DeadlineStatus.COMPLETED:
          stats.completed++;
          break;
      }

      // Count by priority
      stats.byPriority[deadline.priority] =
        (stats.byPriority[deadline.priority] || 0) + 1;

      // Count by entity type
      stats.byEntityType[deadline.entityType] =
        (stats.byEntityType[deadline.entityType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 50): DeadlineAlert[] {
    return this.alerts
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get all deadlines
   */
  getAllDeadlines(): DeadlineItem[] {
    return Array.from(this.deadlines.values());
  }

  /**
   * Get deadline by ID
   */
  getDeadline(deadlineId: string): DeadlineItem | undefined {
    return this.deadlines.get(deadlineId);
  }
}
