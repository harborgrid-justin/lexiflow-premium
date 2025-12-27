import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncQueue } from './entities/sync-queue.entity';
import { SyncConflict } from './entities/sync-conflict.entity';
import { AuthModule } from '@auth/auth.module';

/**
 * Sync Module
 * Offline data synchronization and conflict resolution
 * Features:
 * - Offline-first data sync queue
 * - Conflict detection and resolution
 * - Last-write-wins and merge strategies
 * - Sync status tracking and retries
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SyncQueue, SyncConflict]),
    AuthModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
