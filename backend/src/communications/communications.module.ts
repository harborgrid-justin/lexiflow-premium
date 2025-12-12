import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CorrespondenceModule } from './correspondence/correspondence.module';
import { ServiceJobsModule } from './service-jobs/service-jobs.module';
import { EmailModule } from './email/email.module';

/**
 * Communications Module
 *
 * Centralized communications hub for LexiFlow Enterprise
 * Handles:
 * - Real-time messaging via WebSocket
 * - System and user notifications
 * - Legal correspondence management
 * - Service of process tracking
 * - Email integration and templates
 *
 * @module CommunicationsModule
 */
@Module({
  imports: [
    MessagingModule,
    NotificationsModule,
    CorrespondenceModule,
    ServiceJobsModule,
    EmailModule,
  ],
  exports: [
    MessagingModule,
    NotificationsModule,
    CorrespondenceModule,
    ServiceJobsModule,
    EmailModule,
  ],
})
export class CommunicationsModule {}
