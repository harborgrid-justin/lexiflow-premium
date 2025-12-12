import { Injectable, Logger } from '@nestjs/common';
import { NotificationCategory } from './notification-preferences.service';

export interface DigestNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

export interface DigestSchedule {
  userId: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  time?: string; // HH:MM format for daily/weekly
  dayOfWeek?: number; // 0-6 for weekly
  timezone: string;
  lastSent?: Date;
}

export interface DigestEmail {
  userId: string;
  subject: string;
  notifications: DigestNotification[];
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    total: number;
    byCategory: Record<string, number>;
    unread: number;
  };
}

@Injectable()
export class NotificationDigestService {
  private readonly logger = new Logger(NotificationDigestService.name);
  private pendingNotifications = new Map<string, DigestNotification[]>(); // userId -> notifications
  private digestSchedules = new Map<string, DigestSchedule>(); // userId -> schedule
  private lastDigestSent = new Map<string, Date>(); // userId -> timestamp

  /**
   * Add notification to digest queue
   */
  addToDigest(userId: string, notification: DigestNotification): void {
    if (!this.pendingNotifications.has(userId)) {
      this.pendingNotifications.set(userId, []);
    }

    this.pendingNotifications.get(userId)!.push(notification);
  }

  /**
   * Set digest schedule for user
   */
  setDigestSchedule(schedule: DigestSchedule): void {
    this.digestSchedules.set(schedule.userId, schedule);
    this.logger.log(
      `Set ${schedule.frequency} digest schedule for user ${schedule.userId}`,
    );
  }

  /**
   * Get digest schedule for user
   */
  getDigestSchedule(userId: string): DigestSchedule | undefined {
    return this.digestSchedules.get(userId);
  }

  /**
   * Remove digest schedule
   */
  removeDigestSchedule(userId: string): void {
    this.digestSchedules.delete(userId);
  }

  /**
   * Check if digest should be sent now
   */
  shouldSendDigest(userId: string): boolean {
    const schedule = this.digestSchedules.get(userId);

    if (!schedule) {
      return false;
    }

    const lastSent = this.lastDigestSent.get(userId);
    const now = new Date();

    if (!lastSent) {
      return true;
    }

    const timeSinceLastSent = now.getTime() - lastSent.getTime();

    switch (schedule.frequency) {
      case 'hourly':
        return timeSinceLastSent >= 60 * 60 * 1000; // 1 hour

      case 'daily':
        return (
          timeSinceLastSent >= 24 * 60 * 60 * 1000 &&
          this.isScheduledTime(schedule)
        );

      case 'weekly':
        return (
          timeSinceLastSent >= 7 * 24 * 60 * 60 * 1000 &&
          this.isScheduledDay(schedule) &&
          this.isScheduledTime(schedule)
        );

      default:
        return false;
    }
  }

  /**
   * Generate digest email
   */
  generateDigest(userId: string): DigestEmail | null {
    const notifications = this.pendingNotifications.get(userId) || [];

    if (notifications.length === 0) {
      return null;
    }

    const schedule = this.digestSchedules.get(userId);
    const lastSent = this.lastDigestSent.get(userId) || new Date(0);
    const now = new Date();

    // Count by category
    const byCategory: Record<string, number> = {};
    let unread = 0;

    notifications.forEach((notif) => {
      const category = notif.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;

      if (!notif.read) {
        unread++;
      }
    });

    // Generate subject based on frequency
    const frequency = schedule?.frequency || 'digest';
    const subject = this.generateSubject(frequency, notifications.length, unread);

    const digest: DigestEmail = {
      userId,
      subject,
      notifications: [...notifications],
      period: {
        start: lastSent,
        end: now,
      },
      summary: {
        total: notifications.length,
        byCategory,
        unread,
      },
    };

    return digest;
  }

  /**
   * Send digest for user
   */
  async sendDigest(userId: string): Promise<boolean> {
    const digest = this.generateDigest(userId);

    if (!digest) {
      return false;
    }

    try {
      // In a real implementation, this would send via email service
      this.logger.log(
        `Sending digest to user ${userId}: ${digest.notifications.length} notifications`,
      );

      // Mark as sent
      this.lastDigestSent.set(userId, new Date());

      // Clear pending notifications
      this.pendingNotifications.delete(userId);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send digest to user ${userId}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Process all pending digests
   */
  async processDigests(): Promise<number> {
    let sentCount = 0;

    for (const [userId, schedule] of this.digestSchedules.entries()) {
      if (this.shouldSendDigest(userId)) {
        const sent = await this.sendDigest(userId);
        if (sent) {
          sentCount++;
        }
      }
    }

    if (sentCount > 0) {
      this.logger.log(`Processed ${sentCount} digest emails`);
    }

    return sentCount;
  }

  /**
   * Get pending notifications for user
   */
  getPendingNotifications(userId: string): DigestNotification[] {
    return this.pendingNotifications.get(userId) || [];
  }

  /**
   * Get pending notification count
   */
  getPendingCount(userId: string): number {
    return this.pendingNotifications.get(userId)?.length || 0;
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): void {
    const notifications = this.pendingNotifications.get(userId);

    if (!notifications) {
      return;
    }

    const notification = notifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): void {
    const notifications = this.pendingNotifications.get(userId);

    if (notifications) {
      notifications.forEach((n) => (n.read = true));
    }
  }

  /**
   * Clear pending notifications
   */
  clearPendingNotifications(userId: string): void {
    this.pendingNotifications.delete(userId);
  }

  /**
   * Get digest preview
   */
  getDigestPreview(userId: string): string {
    const digest = this.generateDigest(userId);

    if (!digest) {
      return 'No notifications to display';
    }

    let preview = `${digest.subject}\n\n`;
    preview += `Period: ${digest.period.start.toLocaleString()} - ${digest.period.end.toLocaleString()}\n\n`;
    preview += `Summary:\n`;
    preview += `- Total: ${digest.summary.total}\n`;
    preview += `- Unread: ${digest.summary.unread}\n\n`;
    preview += `By Category:\n`;

    Object.entries(digest.summary.byCategory).forEach(([category, count]) => {
      preview += `- ${category}: ${count}\n`;
    });

    preview += `\nNotifications:\n`;

    digest.notifications.slice(0, 10).forEach((notif, index) => {
      preview += `${index + 1}. ${notif.title}\n`;
      preview += `   ${notif.message}\n`;
      preview += `   ${notif.timestamp.toLocaleString()}\n\n`;
    });

    if (digest.notifications.length > 10) {
      preview += `... and ${digest.notifications.length - 10} more\n`;
    }

    return preview;
  }

  /**
   * Get digest HTML (for email)
   */
  getDigestHTML(userId: string): string | null {
    const digest = this.generateDigest(userId);

    if (!digest) {
      return null;
    }

    let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .summary { background: #F3F4F6; padding: 15px; margin: 20px 0; border-radius: 8px; }
    .notification { border-left: 4px solid #4F46E5; padding: 15px; margin: 10px 0; background: #FFFFFF; }
    .notification.unread { background: #EEF2FF; }
    .category { display: inline-block; background: #E0E7FF; color: #4338CA; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px; }
    .timestamp { color: #6B7280; font-size: 14px; }
    .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>LexiFlow Notification Digest</h1>
    <p>${digest.subject}</p>
  </div>

  <div style="padding: 20px;">
    <div class="summary">
      <h2>Summary</h2>
      <p><strong>Period:</strong> ${digest.period.start.toLocaleString()} - ${digest.period.end.toLocaleString()}</p>
      <p><strong>Total Notifications:</strong> ${digest.summary.total}</p>
      <p><strong>Unread:</strong> ${digest.summary.unread}</p>

      <h3>By Category:</h3>
      <ul>
        ${Object.entries(digest.summary.byCategory)
          .map(([category, count]) => `<li>${category}: ${count}</li>`)
          .join('')}
      </ul>
    </div>

    <h2>Notifications</h2>
    ${digest.notifications
      .map(
        (notif) => `
      <div class="notification ${notif.read ? '' : 'unread'}">
        <span class="category">${notif.category}</span>
        <h3>${notif.title}</h3>
        <p>${notif.message}</p>
        <p class="timestamp">${notif.timestamp.toLocaleString()}</p>
      </div>
    `,
      )
      .join('')}
  </div>

  <div class="footer">
    <p>This is an automated notification digest from LexiFlow.</p>
    <p>Manage your notification preferences in your account settings.</p>
  </div>
</body>
</html>
    `;

    return html;
  }

  private generateSubject(
    frequency: string,
    total: number,
    unread: number,
  ): string {
    const period =
      frequency === 'hourly'
        ? 'Hourly'
        : frequency === 'daily'
          ? 'Daily'
          : 'Weekly';

    return `${period} Digest: ${total} notifications (${unread} unread)`;
  }

  private isScheduledTime(schedule: DigestSchedule): boolean {
    if (!schedule.time) {
      return true;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const [hour, minute] = schedule.time.split(':');
    const scheduledTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    // Allow a 5-minute window
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const scheduledMinutes =
      parseInt(hour) * 60 + parseInt(minute);

    return Math.abs(currentMinutes - scheduledMinutes) <= 5;
  }

  private isScheduledDay(schedule: DigestSchedule): boolean {
    if (schedule.dayOfWeek === undefined) {
      return true;
    }

    const now = new Date();
    return now.getDay() === schedule.dayOfWeek;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalUsers: number;
    totalPendingNotifications: number;
    byFrequency: Record<string, number>;
    averageNotificationsPerUser: number;
  } {
    const byFrequency: Record<string, number> = {
      hourly: 0,
      daily: 0,
      weekly: 0,
    };

    let totalPendingNotifications = 0;

    this.digestSchedules.forEach((schedule) => {
      byFrequency[schedule.frequency]++;
    });

    this.pendingNotifications.forEach((notifications) => {
      totalPendingNotifications += notifications.length;
    });

    return {
      totalUsers: this.digestSchedules.size,
      totalPendingNotifications,
      byFrequency,
      averageNotificationsPerUser:
        this.pendingNotifications.size > 0
          ? totalPendingNotifications / this.pendingNotifications.size
          : 0,
    };
  }
}
