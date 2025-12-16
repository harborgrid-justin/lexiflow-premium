import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../constants';

export interface EmailJob {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: any;
  priority?: 'high' | 'normal' | 'low';
}

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessorService {
  private readonly logger = new Logger(EmailProcessorService.name);

  @Process('send')
  async handleSendEmail(job: Job<EmailJob>) {
    this.logger.log(`Sending email to: ${job.data.to}`);

    try {
      // Simulate email sending
      await this.delay(1000);

      this.logger.log(`Email sent successfully to: ${job.data.to}`);
      return { success: true, messageId: `msg-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Email sending failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('bulk-send')
  async handleBulkSend(job: Job<{ emails: EmailJob[] }>) {
    this.logger.log(`Sending ${job.data.emails.length} emails in bulk`);

    try {
      const results = [];

      for (const email of job.data.emails) {
        await this.delay(500);
        results.push({ to: email.to, success: true });
      }

      this.logger.log(`Bulk email sending completed`);
      return { success: true, results };
    } catch (error) {
      this.logger.error(`Bulk email sending failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
