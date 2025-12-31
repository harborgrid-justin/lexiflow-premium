import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SyncQueue, SyncStatus } from './entities/sync-queue.entity';
import { SyncConflict } from './entities/sync-conflict.entity';

/**
 * ╔=================================================================================================================╗
 * ║SYNC                                                                                                             ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncQueue)
    private readonly syncQueueRepository: Repository<SyncQueue>,
    @InjectRepository(SyncConflict)
    private readonly syncConflictRepository: Repository<SyncConflict>,
  ) {}

  async getStatus() {
    const [pending, syncing, completed, failed, conflicts] = await Promise.all([
      this.syncQueueRepository.count({ where: { status: SyncStatus.PENDING } }),
      this.syncQueueRepository.count({ where: { status: SyncStatus.SYNCING } }),
      this.syncQueueRepository.count({ where: { status: SyncStatus.COMPLETED } }),
      this.syncQueueRepository.count({ where: { status: SyncStatus.FAILED } }),
      this.syncConflictRepository.count({ where: { resolved: false } }),
    ]);

    const lastSync = await this.syncQueueRepository.findOne({
      where: { status: SyncStatus.COMPLETED },
      order: { syncedAt: 'DESC' },
    });

    return {
      pending,
      syncing,
      completed,
      failed,
      conflicts,
      lastSyncTime: lastSync?.syncedAt || null,
      isHealthy: failed === 0 && conflicts === 0,
    };
  }

  async getQueue(filters?: { status?: SyncStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 50 } = filters || {};
    
    const queryBuilder = this.syncQueueRepository.createQueryBuilder('queue');

    if (status) {
      queryBuilder.where('queue.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .orderBy('queue.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getConflicts(filters?: { resolved?: boolean; page?: number; limit?: number }) {
    const { resolved = false, page = 1, limit = 50 } = filters || {};
    
    const [data, total] = await this.syncConflictRepository.findAndCount({
      where: { resolved },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async resolveConflict(
    id: string,
    resolution: 'local' | 'remote' | 'merge',
    userId: string,
  ): Promise<SyncConflict> {
    const conflict = await this.syncConflictRepository.findOne({ where: { id } });
    
    if (!conflict) {
      throw new NotFoundException(`Conflict with ID ${id} not found`);
    }

    conflict.resolved = true;
    conflict.resolution = resolution;
    conflict.resolvedBy = userId;
    conflict.resolvedAt = new Date();

    return await this.syncConflictRepository.save(conflict);
  }

  async retryFailed(ids: string[]): Promise<{ updated: number }> {
    await this.syncQueueRepository.update(
      { id: In(ids), status: SyncStatus.FAILED },
      { status: SyncStatus.PENDING, retryCount: 0, error: undefined },
    );

    return { updated: ids.length };
  }

  async clearCompleted(): Promise<{ deleted: number }> {
    const result = await this.syncQueueRepository.delete({
      status: SyncStatus.COMPLETED,
    });

    return { deleted: result.affected || 0 };
  }
}
