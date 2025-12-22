import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupSnapshot } from './entities/backup-snapshot.entity';
import { BackupSchedule } from './entities/backup-schedule.entity';

@Injectable()
export class BackupsService {
  constructor(
    @InjectRepository(BackupSnapshot)
    private readonly snapshotRepository: Repository<BackupSnapshot>,
    @InjectRepository(BackupSchedule)
    private readonly scheduleRepository: Repository<BackupSchedule>,
  ) {}

  async createSnapshot(data: {
    name: string;
    description?: string;
    type: string;
    userId?: string;
  }): Promise<BackupSnapshot> {
    const snapshot = this.snapshotRepository.create({
      ...data,
      size: Math.floor(Math.random() * 1000000000), // Mock size for now
      location: `/backups/${Date.now()}.backup`,
      status: 'completed',
      createdBy: data.userId || 'system',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return await this.snapshotRepository.save(snapshot);
  }

  async getSnapshots(filters?: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = filters || {};
    
    const [data, total] = await this.snapshotRepository.findAndCount({
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

  async getSnapshot(id: string): Promise<BackupSnapshot> {
    const snapshot = await this.snapshotRepository.findOne({ where: { id } });
    
    if (!snapshot) {
      throw new NotFoundException(`Snapshot with ID ${id} not found`);
    }

    return snapshot;
  }

  async deleteSnapshot(id: string): Promise<void> {
    const snapshot = await this.getSnapshot(id);
    await this.snapshotRepository.remove(snapshot);
  }

  async restore(id: string, _target: string): Promise<{ jobId: string; status: string }> {
    await this.getSnapshot(id);

    // In production, trigger actual restore process
    const jobId = `restore-${Date.now()}`;

    return {
      jobId,
      status: 'started',
    };
  }

  async getSchedules() {
    return await this.scheduleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createSchedule(data: {
    name: string;
    cronExpression: string;
    type: string;
    databases?: string[];
    retentionDays?: number;
  }): Promise<BackupSchedule> {
    const schedule = this.scheduleRepository.create(data);
    return await this.scheduleRepository.save(schedule);
  }

  async updateSchedule(id: string, data: Partial<BackupSchedule>): Promise<BackupSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    Object.assign(schedule, data);
    return await this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(id: string): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    await this.scheduleRepository.remove(schedule);
  }

  async getStats() {
    const totalSnapshots = await this.snapshotRepository.count();
    const result = await this.snapshotRepository
      .createQueryBuilder('snapshot')
      .select('SUM(snapshot.size)', 'totalSize')
      .getRawOne();

    const activeSchedules = await this.scheduleRepository.count({ where: { enabled: true } });

    return {
      totalSnapshots,
      totalSize: parseInt(result?.totalSize || '0'),
      activeSchedules,
    };
  }
}
