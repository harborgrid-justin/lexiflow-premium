import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KPIMetric } from './entities/kpi-metric.entity';

export interface PracticeGroupMetrics {
  practiceGroupId: string;
  name: string;
  revenue: number;
  revenueGrowth: number;
  activeCases: number;
  attorneys: number;
  utilizationRate: number;
  realizationRate: number;
  averageCaseValue: number;
  billableHours: number;
  profitMargin: number;
  clientCount: number;
}

@Injectable()
export class PracticeGroupAnalyticsService {
  private readonly logger = new Logger(PracticeGroupAnalyticsService.name);

  constructor(
    @InjectRepository(KPIMetric)
    private kpiRepository: Repository<KPIMetric>,
  ) {}

  async getPracticeGroupMetrics(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PracticeGroupMetrics[]> {
    // Mock data - in production, query actual practice group data
    return [
      {
        practiceGroupId: 'pg-1',
        name: 'Corporate Law',
        revenue: 1250000,
        revenueGrowth: 15.3,
        activeCases: 45,
        attorneys: 12,
        utilizationRate: 87.5,
        realizationRate: 94.2,
        averageCaseValue: 27777.78,
        billableHours: 5280,
        profitMargin: 38.5,
        clientCount: 34,
      },
      {
        practiceGroupId: 'pg-2',
        name: 'Litigation',
        revenue: 980000,
        revenueGrowth: 12.8,
        activeCases: 67,
        attorneys: 15,
        utilizationRate: 92.3,
        realizationRate: 91.5,
        averageCaseValue: 14626.87,
        billableHours: 6600,
        profitMargin: 32.1,
        clientCount: 52,
      },
      {
        practiceGroupId: 'pg-3',
        name: 'Real Estate',
        revenue: 750000,
        revenueGrowth: 8.5,
        activeCases: 28,
        attorneys: 8,
        utilizationRate: 84.2,
        realizationRate: 93.8,
        averageCaseValue: 26785.71,
        billableHours: 3520,
        profitMargin: 35.7,
        clientCount: 21,
      },
      {
        practiceGroupId: 'pg-4',
        name: 'Intellectual Property',
        revenue: 620000,
        revenueGrowth: 18.9,
        activeCases: 34,
        attorneys: 6,
        utilizationRate: 88.9,
        realizationRate: 92.4,
        averageCaseValue: 18235.29,
        billableHours: 2640,
        profitMargin: 40.2,
        clientCount: 28,
      },
    ];
  }

  async getPracticeGroupComparison(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{
    metric: string;
    practiceGroups: Array<{ name: string; value: number }>;
  }>> {
    return [
      {
        metric: 'Revenue',
        practiceGroups: [
          { name: 'Corporate', value: 1250000 },
          { name: 'Litigation', value: 980000 },
          { name: 'Real Estate', value: 750000 },
          { name: 'IP', value: 620000 },
        ],
      },
      {
        metric: 'Utilization Rate',
        practiceGroups: [
          { name: 'Corporate', value: 87.5 },
          { name: 'Litigation', value: 92.3 },
          { name: 'Real Estate', value: 84.2 },
          { name: 'IP', value: 88.9 },
        ],
      },
      {
        metric: 'Profit Margin',
        practiceGroups: [
          { name: 'Corporate', value: 38.5 },
          { name: 'Litigation', value: 32.1 },
          { name: 'Real Estate', value: 35.7 },
          { name: 'IP', value: 40.2 },
        ],
      },
    ];
  }
}
