import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../constants';

export interface NotificationJob {
  userId: string | string[];
  type: 'email' | 'sms' | 'push' | 'in-app';
  title: string;
  message: string;
  data?: any;
  priority?: 'high' | 'normal' | 'low';
}

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessorService {
  private readonly logger = new Logger(NotificationProcessorService.name);

  @Process('send')
  async handleSendNotification(job: Job<NotificationJob>) {
    this.logger.log(`Sending ${job.data.type} notification to: ${job.data.userId}`);

    try {
      // Simulate notification sending
      await this.delay(500);

      this.logger.log(`Notification sent successfully: ${job.data.type}`);
      return { success: true, notificationId: `notif-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Notification sending failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('broadcast')
  async handleBroadcast(job: Job<Omit<NotificationJob, 'userId'> & { userIds: string[] }>) {
    this.logger.log(`Broadcasting notification to ${job.data.userIds.length} users`);

    try {
      await this.delay(2000);

      this.logger.log(`Broadcast notification completed`);
      return { success: true, recipientCount: job.data.userIds.length };
    } catch (error) {
      this.logger.error(`Broadcast failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
