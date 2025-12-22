import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PerformanceMetric } from './entities/performance-metric.entity';
import { SystemAlert, AlertSeverity } from './entities/system-alert.entity';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(PerformanceMetric)
    private readonly metricRepository: Repository<PerformanceMetric>,
    @InjectRepository(SystemAlert)
    private readonly alertRepository: Repository<SystemAlert>,
  ) {}

  async recordMetric(data: {
    metricName: string;
    value: number;
    unit?: string;
    tags?: Record<string, unknown>;
  }): Promise<PerformanceMetric> {
    const metric = this.metricRepository.create({
      ...data,
      timestamp: new Date(),
    });

    return await this.metricRepository.save(metric);
  }

  async getMetrics(filters: {
    metricName?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }) {
    const { metricName, startTime, endTime, limit = 1000 } = filters;

    const queryBuilder = this.metricRepository.createQueryBuilder('metric');

    if (metricName) {
      queryBuilder.where('metric.metricName = :metricName', { metricName });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('metric.timestamp BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    }

    const data = await queryBuilder
      .orderBy('metric.timestamp', 'DESC')
      .limit(limit)
      .getMany();

    return { data };
  }

  async getSystemHealth() {
    // Get recent metrics for health indicators
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const cpuMetrics = await this.metricRepository.find({
      where: {
        metricName: 'cpu_usage',
        timestamp: MoreThan(fiveMinutesAgo),
      },
      order: { timestamp: 'DESC' },
      take: 5,
    });

    const memoryMetrics = await this.metricRepository.find({
      where: {
        metricName: 'memory_usage',
        timestamp: MoreThan(fiveMinutesAgo),
      },
      order: { timestamp: 'DESC' },
      take: 5,
    });

    const avgCpu = cpuMetrics.length > 0
      ? cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length
      : 0;

    const avgMemory = memoryMetrics.length > 0
      ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length
      : 0;

    const activeAlerts = await this.alertRepository.count({
      where: { resolved: false },
    });

    return {
      status: activeAlerts === 0 && avgCpu < 80 && avgMemory < 80 ? 'healthy' : 'degraded',
      cpuUsage: Math.round(avgCpu),
      memoryUsage: Math.round(avgMemory),
      activeAlerts,
      timestamp: new Date(),
    };
  }

  async getAlerts(filters?: {
    severity?: AlertSeverity;
    resolved?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { severity, resolved = false, page = 1, limit = 50 } = filters || {};

    const queryBuilder = this.alertRepository.createQueryBuilder('alert');

    queryBuilder.where('alert.resolved = :resolved', { resolved });

    if (severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity });
    }

    const [data, total] = await queryBuilder
      .orderBy('alert.createdAt', 'DESC')
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

  async createAlert(data: {
    title: string;
    message: string;
    severity: AlertSeverity;
    source: string;
  }): Promise<SystemAlert> {
    const alert = this.alertRepository.create(data);
    return await this.alertRepository.save(alert);
  }

  async acknowledgeAlert(id: string, userId: string): Promise<SystemAlert | null> {
    const alert = await this.alertRepository.findOne({ where: { id } });

    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
      return await this.alertRepository.save(alert);
    }

    return null;
  }

  async resolveAlert(id: string): Promise<SystemAlert | null> {
    const alert = await this.alertRepository.findOne({ where: { id } });

    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return await this.alertRepository.save(alert);
    }

    return null;
  }
}
