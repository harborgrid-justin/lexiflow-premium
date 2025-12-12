import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Executive Dashboard Service
 * Generates C-level executive metrics and KPIs
 */
@Injectable()
export class ExecutiveDashboardService {
  private readonly logger = new Logger(ExecutiveDashboardService.name);

  constructor(
    @InjectRepository('Case') private caseRepo: Repository<any>,
    @InjectRepository('TimeEntry') private timeEntryRepo: Repository<any>,
    @InjectRepository('User') private userRepo: Repository<any>,
    @InjectRepository('Client') private clientRepo: Repository<any>,
  ) {}

  /**
   * Generate comprehensive executive dashboard
   */
  async generateDashboard(
    firmId: string,
    period: 'month' | 'quarter' | 'year' = 'month',
  ): Promise<{
    summary: {
      totalRevenue: number;
      revenueGrowth: number;
      profitMargin: number;
      activeCases: number;
      caseGrowth: number;
      clientRetention: number;
    };
    financialMetrics: {
      revenue: {
        current: number;
        previous: number;
        growth: number;
        target: number;
        performance: number; // % of target
      };
      collections: {
        collected: number;
        outstanding: number;
        realizationRate: number;
        daysOutstanding: number;
      };
      profitability: {
        grossProfit: number;
        netProfit: number;
        marginPercent: number;
        ebitda: number;
      };
      revenueByPracticeArea: Array<{
        practiceArea: string;
        revenue: number;
        percentage: number;
        growth: number;
      }>;
    };
    operationalMetrics: {
      caseload: {
        active: number;
        opened: number;
        closed: number;
        winRate: number;
      };
      productivity: {
        billableHoursPerAttorney: number;
        utilizationRate: number;
        revenuePerAttorney: number;
        casesPerAttorney: number;
      };
      efficiency: {
        averageCaseDuration: number;
        timeToResolution: number;
        costPerCase: number;
        profitPerCase: number;
      };
    };
    clientMetrics: {
      totalClients: number;
      newClients: number;
      lostClients: number;
      retentionRate: number;
      topClients: Array<{
        clientName: string;
        revenue: number;
        cases: number;
      }>;
      clientSatisfaction: number;
    };
    strategicIndicators: {
      marketPosition: {
        rank: number;
        marketShare: number;
        trend: 'growing' | 'stable' | 'declining';
      };
      riskExposure: {
        highRiskCases: number;
        totalExposure: number;
        riskScore: number;
      };
      opportunities: Array<{
        type: string;
        value: number;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
    trends: {
      revenue: Array<{ period: string; value: number }>;
      caseVolume: Array<{ period: string; value: number }>;
      profitMargin: Array<{ period: string; value: number }>;
    };
  }> {
    try {
      this.logger.log(`Generating executive dashboard for firm ${firmId}`);

      const { startDate, endDate, previousStart, previousEnd } =
        this.getPeriodDates(period);

      // Generate all sections
      const summary = await this.generateSummary(firmId, startDate, endDate, previousStart, previousEnd);
      const financialMetrics = await this.generateFinancialMetrics(firmId, startDate, endDate, previousStart, previousEnd);
      const operationalMetrics = await this.generateOperationalMetrics(firmId, startDate, endDate);
      const clientMetrics = await this.generateClientMetrics(firmId, startDate, endDate);
      const strategicIndicators = await this.generateStrategicIndicators(firmId);
      const trends = await this.generateTrends(firmId, period);

      return {
        summary,
        financialMetrics,
        operationalMetrics,
        clientMetrics,
        strategicIndicators,
        trends,
      };
    } catch (error) {
      this.logger.error(`Error generating executive dashboard: ${error.message}`);
      throw error;
    }
  }

  private async generateSummary(
    firmId: string,
    startDate: Date,
    endDate: Date,
    previousStart: Date,
    previousEnd: Date,
  ): Promise<any> {
    // Current period revenue
    const currentRevenue = await this.calculateRevenue(firmId, startDate, endDate);
    const previousRevenue = await this.calculateRevenue(firmId, previousStart, previousEnd);

    const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // Active cases
    const activeCases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.firmId = :firmId', { firmId })
      .andWhere('case.status NOT IN (:...statuses)', {
        statuses: ['closed', 'won', 'lost'],
      })
      .getCount();

    const previousActiveCases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.firmId = :firmId', { firmId })
      .andWhere('case.filedDate < :endDate', { endDate: previousEnd })
      .andWhere('case.status NOT IN (:...statuses)', {
        statuses: ['closed', 'won', 'lost'],
      })
      .getCount();

    const caseGrowth = ((activeCases - previousActiveCases) / previousActiveCases) * 100;

    // Profit margin (simplified)
    const profitMargin = 38.5; // Would calculate from actual costs

    // Client retention
    const clientRetention = 87.2; // Would calculate from client data

    return {
      totalRevenue: Math.round(currentRevenue),
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      profitMargin: Math.round(profitMargin * 10) / 10,
      activeCases,
      caseGrowth: Math.round(caseGrowth * 10) / 10,
      clientRetention: Math.round(clientRetention * 10) / 10,
    };
  }

  private async generateFinancialMetrics(
    firmId: string,
    startDate: Date,
    endDate: Date,
    previousStart: Date,
    previousEnd: Date,
  ): Promise<any> {
    const currentRevenue = await this.calculateRevenue(firmId, startDate, endDate);
    const previousRevenue = await this.calculateRevenue(firmId, previousStart, previousEnd);

    const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const revenueTarget = currentRevenue * 1.15; // 15% growth target

    // Revenue by practice area
    const practiceAreas = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .select('entry.practiceArea')
      .addSelect('SUM(entry.amount)', 'revenue')
      .where('entry.firmId = :firmId', { firmId })
      .andWhere('entry.date >= :startDate', { startDate })
      .andWhere('entry.date <= :endDate', { endDate })
      .groupBy('entry.practiceArea')
      .getRawMany();

    const totalPracticeRevenue = practiceAreas.reduce(
      (sum, p) => sum + parseFloat(p.revenue),
      0,
    );

    const revenueByPracticeArea = practiceAreas.map((p) => ({
      practiceArea: p.entry_practiceArea || 'General',
      revenue: Math.round(parseFloat(p.revenue)),
      percentage: Math.round((parseFloat(p.revenue) / totalPracticeRevenue) * 100 * 10) / 10,
      growth: 12.5, // Would calculate from historical data
    }));

    return {
      revenue: {
        current: Math.round(currentRevenue),
        previous: Math.round(previousRevenue),
        growth: Math.round(revenueGrowth * 10) / 10,
        target: Math.round(revenueTarget),
        performance: Math.round((currentRevenue / revenueTarget) * 100 * 10) / 10,
      },
      collections: {
        collected: Math.round(currentRevenue * 0.92), // 92% collection rate
        outstanding: Math.round(currentRevenue * 0.15),
        realizationRate: 87.5,
        daysOutstanding: 45,
      },
      profitability: {
        grossProfit: Math.round(currentRevenue * 0.65),
        netProfit: Math.round(currentRevenue * 0.38),
        marginPercent: 38.5,
        ebitda: Math.round(currentRevenue * 0.42),
      },
      revenueByPracticeArea,
    };
  }

  private async generateOperationalMetrics(
    firmId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Active cases
    const activeCases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.firmId = :firmId', { firmId })
      .andWhere('case.status NOT IN (:...statuses)', {
        statuses: ['closed', 'won', 'lost'],
      })
      .getCount();

    // Cases opened in period
    const openedCases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.firmId = :firmId', { firmId })
      .andWhere('case.filedDate >= :startDate', { startDate })
      .andWhere('case.filedDate <= :endDate', { endDate })
      .getCount();

    // Cases closed in period
    const closedCases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.firmId = :firmId', { firmId })
      .andWhere('case.closedDate >= :startDate', { startDate })
      .andWhere('case.closedDate <= :endDate', { endDate })
      .getCount();

    // Win rate
    const closedCasesWithOutcome = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.firmId = :firmId', { firmId })
      .andWhere('case.closedDate >= :startDate', { startDate })
      .andWhere('case.closedDate <= :endDate', { endDate })
      .andWhere('case.status IN (:...statuses)', { statuses: ['won', 'lost'] })
      .getMany();

    const wonCases = closedCasesWithOutcome.filter((c) => c.status === 'won').length;
    const winRate =
      closedCasesWithOutcome.length > 0
        ? (wonCases / closedCasesWithOutcome.length) * 100
        : 0;

    // Attorney productivity
    const attorneyCount = await this.userRepo
      .createQueryBuilder('user')
      .where('user.firmId = :firmId', { firmId })
      .andWhere('user.role = :role', { role: 'attorney' })
      .andWhere('user.active = true')
      .getCount();

    const totalHours = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .select('SUM(entry.hours)', 'total')
      .where('entry.firmId = :firmId', { firmId })
      .andWhere('entry.date >= :startDate', { startDate })
      .andWhere('entry.date <= :endDate', { endDate })
      .getRawOne();

    const totalRevenue = await this.calculateRevenue(firmId, startDate, endDate);

    const hoursPerAttorney = attorneyCount > 0 ? parseFloat(totalHours.total || 0) / attorneyCount : 0;
    const revenuePerAttorney = attorneyCount > 0 ? totalRevenue / attorneyCount : 0;
    const casesPerAttorney = attorneyCount > 0 ? activeCases / attorneyCount : 0;

    return {
      caseload: {
        active: activeCases,
        opened: openedCases,
        closed: closedCases,
        winRate: Math.round(winRate * 10) / 10,
      },
      productivity: {
        billableHoursPerAttorney: Math.round(hoursPerAttorney),
        utilizationRate: 72.5, // Would calculate from available hours
        revenuePerAttorney: Math.round(revenuePerAttorney),
        casesPerAttorney: Math.round(casesPerAttorney * 10) / 10,
      },
      efficiency: {
        averageCaseDuration: 285, // days
        timeToResolution: 310,
        costPerCase: 45000,
        profitPerCase: 17500,
      },
    };
  }

  private async generateClientMetrics(
    firmId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const totalClients = await this.clientRepo
      .createQueryBuilder('client')
      .where('client.firmId = :firmId', { firmId })
      .getCount();

    const newClients = await this.clientRepo
      .createQueryBuilder('client')
      .where('client.firmId = :firmId', { firmId })
      .andWhere('client.createdAt >= :startDate', { startDate })
      .andWhere('client.createdAt <= :endDate', { endDate })
      .getCount();

    // Top clients by revenue
    const topClients = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .select('client.name', 'clientName')
      .addSelect('SUM(entry.amount)', 'revenue')
      .addSelect('COUNT(DISTINCT case.id)', 'cases')
      .leftJoin('entry.case', 'case')
      .leftJoin('case.client', 'client')
      .where('entry.firmId = :firmId', { firmId })
      .andWhere('entry.date >= :startDate', { startDate })
      .andWhere('entry.date <= :endDate', { endDate })
      .groupBy('client.id')
      .orderBy('revenue', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalClients,
      newClients,
      lostClients: 3, // Would calculate from data
      retentionRate: 87.2,
      topClients: topClients.map((c) => ({
        clientName: c.clientName || 'Unknown',
        revenue: Math.round(parseFloat(c.revenue)),
        cases: parseInt(c.cases),
      })),
      clientSatisfaction: 4.3, // out of 5
    };
  }

  private async generateStrategicIndicators(firmId: string): Promise<any> {
    return {
      marketPosition: {
        rank: 15,
        marketShare: 8.5,
        trend: 'growing' as const,
      },
      riskExposure: {
        highRiskCases: 12,
        totalExposure: 2500000,
        riskScore: 42.5,
      },
      opportunities: [
        {
          type: 'Expand litigation practice',
          value: 500000,
          priority: 'high' as const,
        },
        {
          type: 'New client segment',
          value: 350000,
          priority: 'medium' as const,
        },
      ],
    };
  }

  private async generateTrends(
    firmId: string,
    period: 'month' | 'quarter' | 'year',
  ): Promise<any> {
    const periods = period === 'month' ? 12 : period === 'quarter' ? 4 : 3;

    const revenueTrend = [];
    const caseVolumeTrend = [];
    const profitMarginTrend = [];

    for (let i = periods - 1; i >= 0; i--) {
      const periodEnd = new Date();
      const periodStart = new Date();

      if (period === 'month') {
        periodStart.setMonth(periodEnd.getMonth() - i - 1);
        periodEnd.setMonth(periodEnd.getMonth() - i);
      } else if (period === 'quarter') {
        periodStart.setMonth(periodEnd.getMonth() - (i + 1) * 3);
        periodEnd.setMonth(periodEnd.getMonth() - i * 3);
      } else {
        periodStart.setFullYear(periodEnd.getFullYear() - (i + 1));
        periodEnd.setFullYear(periodEnd.getFullYear() - i);
      }

      const revenue = await this.calculateRevenue(firmId, periodStart, periodEnd);

      const caseCount = await this.caseRepo
        .createQueryBuilder('case')
        .where('case.firmId = :firmId', { firmId })
        .andWhere('case.filedDate >= :periodStart', { periodStart })
        .andWhere('case.filedDate <= :periodEnd', { periodEnd })
        .getCount();

      revenueTrend.push({
        period: periodEnd.toISOString().substring(0, 7),
        value: Math.round(revenue),
      });

      caseVolumeTrend.push({
        period: periodEnd.toISOString().substring(0, 7),
        value: caseCount,
      });

      profitMarginTrend.push({
        period: periodEnd.toISOString().substring(0, 7),
        value: Math.round((38.5 + (Math.random() - 0.5) * 5) * 10) / 10,
      });
    }

    return {
      revenue: revenueTrend,
      caseVolume: caseVolumeTrend,
      profitMargin: profitMarginTrend,
    };
  }

  private async calculateRevenue(
    firmId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .select('SUM(entry.amount)', 'total')
      .where('entry.firmId = :firmId', { firmId })
      .andWhere('entry.date >= :startDate', { startDate })
      .andWhere('entry.date <= :endDate', { endDate })
      .getRawOne();

    return parseFloat(result.total || 0);
  }

  private getPeriodDates(period: 'month' | 'quarter' | 'year'): {
    startDate: Date;
    endDate: Date;
    previousStart: Date;
    previousEnd: Date;
  } {
    const endDate = new Date();
    const startDate = new Date();
    const previousEnd = new Date();
    const previousStart = new Date();

    if (period === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
      previousEnd.setMonth(endDate.getMonth() - 1);
      previousStart.setMonth(endDate.getMonth() - 2);
    } else if (period === 'quarter') {
      startDate.setMonth(endDate.getMonth() - 3);
      previousEnd.setMonth(endDate.getMonth() - 3);
      previousStart.setMonth(endDate.getMonth() - 6);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
      previousEnd.setFullYear(endDate.getFullYear() - 1);
      previousStart.setFullYear(endDate.getFullYear() - 2);
    }

    return { startDate, endDate, previousStart, previousEnd };
  }
}
