import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';
import { KPIMetric } from './entities/kpi-metric.entity';

export interface FirmAnalyticsData {
  overview: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalCases: number;
    totalClients: number;
    totalAttorneys: number;
    averageCaseValue: number;
  };
  trends: {
    revenueGrowth: number;
    clientGrowth: number;
    caseGrowth: number;
    profitabilityTrend: string;
  };
  departmentBreakdown: Array<{
    department: string;
    revenue: number;
    cases: number;
    attorneys: number;
    utilization: number;
  }>;
  officeBreakdown: Array<{
    office: string;
    revenue: number;
    clients: number;
    attorneys: number;
  }>;
  practiceAreas: Array<{
    name: string;
    revenue: number;
    percentOfTotal: number;
    caseCount: number;
    averageCaseValue: number;
  }>;
}

@Injectable()
export class FirmAnalyticsService {
  private readonly logger = new Logger(FirmAnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsSnapshot)
    private snapshotRepository: Repository<AnalyticsSnapshot>,
    @InjectRepository(KPIMetric)
    private kpiRepository: Repository<KPIMetric>,
  ) {}

  /**
   * Get comprehensive firm analytics
   */
  async getFirmAnalytics(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FirmAnalyticsData> {
    this.logger.log(`Generating firm analytics for organization: ${organizationId}`);

    const [overview, trends, departmentData, officeData, practiceAreaData] = await Promise.all([
      this.getFirmOverview(organizationId, startDate, endDate),
      this.getFirmTrends(organizationId, startDate, endDate),
      this.getDepartmentBreakdown(organizationId, startDate, endDate),
      this.getOfficeBreakdown(organizationId, startDate, endDate),
      this.getPracticeAreaAnalysis(organizationId, startDate, endDate),
    ]);

    return {
      overview,
      trends,
      departmentBreakdown: departmentData,
      officeBreakdown: officeData,
      practiceAreas: practiceAreaData,
    };
  }

  /**
   * Get firm overview metrics
   */
  private async getFirmOverview(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FirmAnalyticsData['overview']> {
    // In production, this would query actual data
    return {
      totalRevenue: 4250000,
      totalExpenses: 2800000,
      netProfit: 1450000,
      profitMargin: 34.12,
      totalCases: 294,
      totalClients: 187,
      totalAttorneys: 45,
      averageCaseValue: 14455.78,
    };
  }

  /**
   * Get firm trend analysis
   */
  private async getFirmTrends(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FirmAnalyticsData['trends']> {
    return {
      revenueGrowth: 12.5,
      clientGrowth: 8.3,
      caseGrowth: 15.7,
      profitabilityTrend: 'up',
    };
  }

  /**
   * Get department breakdown
   */
  private async getDepartmentBreakdown(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FirmAnalyticsData['departmentBreakdown']> {
    return [
      {
        department: 'Corporate',
        revenue: 1250000,
        cases: 45,
        attorneys: 12,
        utilization: 87.5,
      },
      {
        department: 'Litigation',
        revenue: 980000,
        cases: 67,
        attorneys: 15,
        utilization: 92.3,
      },
      {
        department: 'Real Estate',
        revenue: 750000,
        cases: 28,
        attorneys: 8,
        utilization: 84.2,
      },
      {
        department: 'IP',
        revenue: 620000,
        cases: 34,
        attorneys: 6,
        utilization: 88.9,
      },
      {
        department: 'Employment',
        revenue: 450000,
        cases: 41,
        attorneys: 4,
        utilization: 86.1,
      },
    ];
  }

  /**
   * Get office breakdown
   */
  private async getOfficeBreakdown(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FirmAnalyticsData['officeBreakdown']> {
    return [
      {
        office: 'New York',
        revenue: 2100000,
        clients: 89,
        attorneys: 23,
      },
      {
        office: 'Los Angeles',
        revenue: 1350000,
        clients: 54,
        attorneys: 14,
      },
      {
        office: 'Chicago',
        revenue: 800000,
        clients: 44,
        attorneys: 8,
      },
    ];
  }

  /**
   * Get practice area analysis
   */
  private async getPracticeAreaAnalysis(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FirmAnalyticsData['practiceAreas']> {
    const totalRevenue = 4250000;

    return [
      {
        name: 'Corporate Law',
        revenue: 1250000,
        percentOfTotal: 29.41,
        caseCount: 45,
        averageCaseValue: 27777.78,
      },
      {
        name: 'Litigation',
        revenue: 980000,
        percentOfTotal: 23.06,
        caseCount: 67,
        averageCaseValue: 14626.87,
      },
      {
        name: 'Real Estate',
        revenue: 750000,
        percentOfTotal: 17.65,
        caseCount: 28,
        averageCaseValue: 26785.71,
      },
      {
        name: 'Intellectual Property',
        revenue: 620000,
        percentOfTotal: 14.59,
        caseCount: 34,
        averageCaseValue: 18235.29,
      },
      {
        name: 'Employment Law',
        revenue: 450000,
        percentOfTotal: 10.59,
        caseCount: 41,
        averageCaseValue: 10975.61,
      },
    ];
  }

  /**
   * Get firm performance over time
   */
  async getFirmPerformanceTimeSeries(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    granularity: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ): Promise<Array<{
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
    cases: number;
    clients: number;
  }>> {
    // Mock time series data
    const data = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      data.push({
        date: current.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 500000) + 300000,
        expenses: Math.floor(Math.random() * 300000) + 200000,
        profit: Math.floor(Math.random() * 200000) + 100000,
        cases: Math.floor(Math.random() * 30) + 20,
        clients: Math.floor(Math.random() * 20) + 15,
      });

      if (granularity === 'monthly') {
        current.setMonth(current.getMonth() + 1);
      } else if (granularity === 'weekly') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    return data;
  }

  /**
   * Get firm benchmarking data
   */
  async getFirmBenchmarks(
    organizationId: string,
  ): Promise<{
    metrics: Array<{
      name: string;
      firmValue: number;
      industryAverage: number;
      percentile: number;
    }>;
  }> {
    return {
      metrics: [
        {
          name: 'Revenue per Attorney',
          firmValue: 94444,
          industryAverage: 85000,
          percentile: 75,
        },
        {
          name: 'Profit Margin',
          firmValue: 34.12,
          industryAverage: 28.5,
          percentile: 82,
        },
        {
          name: 'Utilization Rate',
          firmValue: 87.8,
          industryAverage: 82.0,
          percentile: 68,
        },
        {
          name: 'Collection Rate',
          firmValue: 92.5,
          industryAverage: 88.0,
          percentile: 71,
        },
      ],
    };
  }
}
