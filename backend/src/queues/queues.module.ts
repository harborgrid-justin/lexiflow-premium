import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocumentProcessorService } from './processors/document-processor.service';
import { EmailProcessorService } from './processors/email-processor.service';
import { ReportProcessorService } from './processors/report-processor.service';
import { NotificationProcessorService } from './processors/notification-processor.service';
import { BackupProcessorService } from './processors/backup-processor.service';
import { QueueErrorHandlerService } from './services/queue-error-handler.service';
import { QUEUE_NAMES } from './constants';

/**
 * Queues Module
 * Background job processing with Bull and Redis
 * 
 * Features:
 * - Document processing (OCR, indexing, conversion)
 * - Email sending and delivery
 * - Report generation
 * - Notification dispatch
 * - Automated backups
 * 
 * Each processor runs in separate worker processes for fault isolation.
 * Includes automatic retry logic and error handling.
 */

// Re-export for use in other modules
export { QUEUE_NAMES };

// Helper to get Redis config from ConfigService
const getRedisConfig = (configService: ConfigService) => {
  const redisUrl = configService.get<string>('redis.url');
  if (redisUrl) {
    return { url: redisUrl };
  }
  return {
    redis: {
      host: configService.get<string>('redis.host', 'localhost'),
      port: configService.get<number>('redis.port', 6379),
      password: configService.get<string>('redis.password'),
      username: configService.get<string>('redis.username'),
    },
  };
};

@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: QUEUE_NAMES.DOCUMENT_PROCESSING,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          ...getRedisConfig(configService),
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: 100,
            removeOnFail: 50,
          },
        }),
      },
      {
        name: QUEUE_NAMES.EMAIL,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          ...getRedisConfig(configService),
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
        }),
      },
      {
        name: QUEUE_NAMES.REPORTS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          ...getRedisConfig(configService),
        }),
      },
      {
        name: QUEUE_NAMES.NOTIFICATIONS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          ...getRedisConfig(configService),
          defaultJobOptions: {
            attempts: 3,
          },
        }),
      },
      {
        name: QUEUE_NAMES.BACKUP,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          ...getRedisConfig(configService),
          defaultJobOptions: {
            attempts: 2,
          },
        }),
      },
    ),
  ],
  providers: [
    DocumentProcessorService,
    EmailProcessorService,
    ReportProcessorService,
    NotificationProcessorService,
    BackupProcessorService,
    QueueErrorHandlerService, // Global error handler for all queues
  ],
  exports: [BullModule, QueueErrorHandlerService],
})
export class QueuesModule {}
