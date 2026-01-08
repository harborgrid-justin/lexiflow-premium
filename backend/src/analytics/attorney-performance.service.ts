import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KPIMetric } from './entities/kpi-metric.entity';

export interface AttorneyPerformanceMetrics {
  attorneyId: string;
  name: string;
  title: string;
  practiceGroup: string;
  billableHours: number;
  nonBillableHours: number;
  utilizationRate: number;
  realizationRate: number;
  collectionRate: number;
  revenue: number;
  activeCases: number;
  averageHourlyRate: number;
  clientCount: number;
  performance: {
    score: number;
    rank: number;
    tier: 'top' | 'high' | 'average' | 'below';
  };
}

@Injectable()
export class AttorneyPerformanceService {
  private readonly logger = new Logger(AttorneyPerformanceService.name);

  constructor(
    @InjectRepository(KPIMetric)
    private kpiRepository: Repository<KPIMetric>,
  ) {}

  async getAttorneyPerformance(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttorneyPerformanceMetrics[]> {
    // Mock data - in production, query actual attorney performance
    return [
      {
        attorneyId: 'att-1',
        name: 'Sarah Johnson',
        title: 'Senior Partner',
        practiceGroup: 'Corporate',
        billableHours: 520,
        nonBillableHours: 80,
        utilizationRate: 86.7,
        realizationRate: 96.5,
        collectionRate: 94.2,
        revenue: 312000,
        activeCases: 12,
        averageHourlyRate: 600,
        clientCount: 8,
        performance: { score: 95, rank: 1, tier: 'top' },
      },
      {
        attorneyId: 'att-2',
        name: 'Michael Chen',
        title: 'Partner',
        practiceGroup: 'Litigation',
        billableHours: 480,
        nonBillableHours: 95,
        utilizationRate: 83.5,
        realizationRate: 92.3,
        collectionRate: 91.8,
        revenue: 216000,
        activeCases: 18,
        averageHourlyRate: 450,
        clientCount: 14,
        performance: { score: 88, rank: 2, tier: 'high' },
      },
    ];
  }

  async getAttorneyUtilizationTrend(
    attorneyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; utilization: number; target: number }>> {
    const data = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      data.push({
        date: current.toISOString().split('T')[0],
        utilization: Math.floor(Math.random() * 20) + 75,
        target: 85,
      });
      current.setDate(current.getDate() + 7);
    }

    return data;
  }

  async getAttorneyLeaderboard(
    organizationId: string,
    metric: 'revenue' | 'utilization' | 'realization',
    limit = 10,
  ): Promise<Array<{
    rank: number;
    attorneyId: string;
    name: string;
    value: number;
    change: number;
  }>> {
    // Mock leaderboard data
    const data = [];
    for (let i = 1; i <= limit; i++) {
      data.push({
        rank: i,
        attorneyId: `att-${i}`,
        name: `Attorney ${i}`,
        value: Math.floor(Math.random() * 300000) + 100000,
        change: Math.floor(Math.random() * 30) - 10,
      });
    }
    return data;
  }
}
