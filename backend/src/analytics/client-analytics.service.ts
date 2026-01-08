import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KPIMetric } from './entities/kpi-metric.entity';

export interface ClientProfitabilityMetrics {
  clientId: string;
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  activeCases: number;
  totalCases: number;
  averageCaseValue: number;
  retentionMonths: number;
  lifetimeValue: number;
  satisfactionScore: number;
  billedHours: number;
  collectionRate: number;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

@Injectable()
export class ClientAnalyticsService {
  private readonly logger = new Logger(ClientAnalyticsService.name);

  constructor(
    @InjectRepository(KPIMetric)
    private kpiRepository: Repository<KPIMetric>,
  ) {}

  async getClientProfitability(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClientProfitabilityMetrics[]> {
    // Mock data - in production, query actual client data
    return [
      {
        clientId: 'client-1',
        name: 'TechCorp Industries',
        revenue: 485000,
        expenses: 275000,
        profit: 210000,
        profitMargin: 43.3,
        activeCases: 8,
        totalCases: 24,
        averageCaseValue: 20208.33,
        retentionMonths: 36,
        lifetimeValue: 1250000,
        satisfactionScore: 9.2,
        billedHours: 1820,
        collectionRate: 96.5,
        tier: 'platinum',
      },
      {
        clientId: 'client-2',
        name: 'Global Finance LLC',
        revenue: 342000,
        expenses: 198000,
        profit: 144000,
        profitMargin: 42.1,
        activeCases: 5,
        totalCases: 18,
        averageCaseValue: 19000,
        retentionMonths: 28,
        lifetimeValue: 980000,
        satisfactionScore: 8.8,
        billedHours: 1280,
        collectionRate: 94.2,
        tier: 'gold',
      },
      {
        clientId: 'client-3',
        name: 'Metro Real Estate',
        revenue: 275000,
        expenses: 165000,
        profit: 110000,
        profitMargin: 40.0,
        activeCases: 4,
        totalCases: 12,
        averageCaseValue: 22916.67,
        retentionMonths: 24,
        lifetimeValue: 620000,
        satisfactionScore: 8.5,
        billedHours: 1030,
        collectionRate: 92.8,
        tier: 'gold',
      },
    ];
  }

  async getClientSegmentation(
    organizationId: string,
  ): Promise<Array<{
    tier: string;
    count: number;
    revenue: number;
    percentOfRevenue: number;
  }>> {
    return [
      { tier: 'Platinum', count: 12, revenue: 2100000, percentOfRevenue: 49.4 },
      { tier: 'Gold', count: 28, revenue: 1450000, percentOfRevenue: 34.1 },
      { tier: 'Silver', count: 45, revenue: 550000, percentOfRevenue: 12.9 },
      { tier: 'Bronze', count: 102, revenue: 150000, percentOfRevenue: 3.6 },
    ];
  }

  async getClientRetentionAnalysis(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    retentionRate: number;
    churnRate: number;
    newClients: number;
    lostClients: number;
    retentionTrend: Array<{ month: string; rate: number }>;
  }> {
    return {
      retentionRate: 92.5,
      churnRate: 7.5,
      newClients: 18,
      lostClients: 14,
      retentionTrend: [
        { month: 'Jan', rate: 91.2 },
        { month: 'Feb', rate: 92.8 },
        { month: 'Mar', rate: 93.1 },
        { month: 'Apr', rate: 91.9 },
        { month: 'May', rate: 92.5 },
        { month: 'Jun', rate: 93.4 },
      ],
    };
  }

  async getClientLifetimeValue(
    clientId: string,
  ): Promise<{
    totalRevenue: number;
    totalCases: number;
    averageMonthlyRevenue: number;
    projectedLifetimeValue: number;
    retentionProbability: number;
  }> {
    return {
      totalRevenue: 1250000,
      totalCases: 24,
      averageMonthlyRevenue: 34722,
      projectedLifetimeValue: 2500000,
      retentionProbability: 0.94,
    };
  }
}
