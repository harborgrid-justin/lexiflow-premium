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
 *
 * NOTE: This module is conditionally loaded based on REDIS_ENABLED.
 * When Redis is disabled, this module provides no-op implementations.
 */

// Re-export for use in other modules
export { QUEUE_NAMES };

// Check if Redis is enabled at module load time
const redisEnabled = process.env.REDIS_ENABLED !== 'false' && process.env.DEMO_MODE !== 'true';

// Helper to get Redis config from ConfigService
const getRedisConfig = (configService: ConfigService) => {
  const redisUrl = process.env.REDIS_URL || configService.get<string>('app.redis.url');
  if (redisUrl) {
    return { url: redisUrl };
  }
  return {
    redis: {
      host: process.env.REDIS_HOST || configService.get<string>('app.redis.host', 'localhost'),
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || configService.get<string>('app.redis.password'),
      username: process.env.REDIS_USERNAME || configService.get<string>('app.redis.username'),
    },
  };
};

// Queue imports only when Redis is enabled
const queueImports = redisEnabled ? [
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
] : [];

// Providers only when Redis is enabled
const queueProviders = redisEnabled ? [
  DocumentProcessorService,
  EmailProcessorService,
  ReportProcessorService,
  NotificationProcessorService,
  BackupProcessorService,
  QueueErrorHandlerService,
] : [];

// Exports only when Redis is enabled
const queueExports = redisEnabled ? [BullModule, QueueErrorHandlerService] : [];

@Module({
  imports: queueImports,
  providers: queueProviders,
  exports: queueExports,
})
export class QueuesModule {}
