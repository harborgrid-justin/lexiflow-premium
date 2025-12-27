import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '@queues/constants';

export interface BackupJob {
  backupType: 'full' | 'incremental' | 'differential';
  targetPath?: string;
  compress?: boolean;
  encrypt?: boolean;
}

@Processor(QUEUE_NAMES.BACKUP)
export class BackupProcessorService {
  private readonly logger = new Logger(BackupProcessorService.name);

  @Process('create')
  async handleBackupCreation(job: Job<BackupJob>) {
    this.logger.log(`Creating ${job.data.backupType} backup`);

    try {
      // Simulate backup creation
      await this.delay(10000);

      this.logger.log(`Backup created successfully: ${job.data.backupType}`);
      return {
        success: true,
        backupId: `backup-${Date.now()}`,
        size: Math.floor(Math.random() * 1000000),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Backup creation failed: ${message}`, stack);
      throw error;
    }
  }

  @Process('restore')
  async handleBackupRestore(job: Job<{ backupId: string; targetPath?: string }>) {
    this.logger.log(`Restoring backup: ${job.data.backupId}`);

    try {
      await this.delay(15000);

      this.logger.log(`Backup restored successfully: ${job.data.backupId}`);
      return { success: true, restoredFiles: Math.floor(Math.random() * 1000) };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Backup restore failed: ${message}`, stack);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
