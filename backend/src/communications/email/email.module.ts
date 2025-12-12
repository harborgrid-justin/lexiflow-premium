import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Email Module
 *
 * Provides email integration functionality
 * Supports template-based emails and transactional messaging
 *
 * Configuration:
 * - EMAIL_PROVIDER: 'smtp' | 'sendgrid' | 'ses' | 'mailgun'
 * - EMAIL_FROM: Default sender email
 * - EMAIL_FROM_NAME: Default sender name
 *
 * SMTP Configuration:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_SECURE
 *
 * SendGrid Configuration:
 * - SENDGRID_API_KEY
 *
 * AWS SES Configuration:
 * - AWS_REGION
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 *
 * @module EmailModule
 */
@Module({
  imports: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
