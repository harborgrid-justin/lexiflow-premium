import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocumentProcessorService } from './processors/document-processor.service';
import { EmailProcessorService } from './processors/email-processor.service';
import { ReportProcessorService } from './processors/report-processor.service';
import { NotificationProcessorService } from './processors/notification-processor.service';
import { BackupProcessorService } from './processors/backup-processor.service';

export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: 'document-processing',
  EMAIL: 'email',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  BACKUP: 'backup',
};

@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: QUEUE_NAMES.DOCUMENT_PROCESSING,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          redis: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
          },
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
          redis: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
          },
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
          redis: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
          },
        }),
      },
      {
        name: QUEUE_NAMES.NOTIFICATIONS,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          redis: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
          },
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
          redis: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
          },
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
  ],
  exports: [BullModule],
})
export class QueuesModule {}
