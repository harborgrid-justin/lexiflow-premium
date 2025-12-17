import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncQueue } from './entities/sync-queue.entity';
import { SyncConflict } from './entities/sync-conflict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncQueue, SyncConflict])],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
