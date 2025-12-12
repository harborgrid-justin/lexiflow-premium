import { Injectable, Logger } from '@nestjs/common';

/**
 * Realization Report Service
 * Tracks fee realization rates (billed vs standard rates, collected vs billed)
 */

export interface RealizationReport {
  reportDate: Date;
  periodStart: Date;
  periodEnd: Date;
  overallRealization: RealizationMetrics;
  byTimekeeper: TimekeeperRealization[];
  byMatter: MatterRealization[];
  byClient: ClientRealization[];
  byPracticeArea: PracticeAreaRealization[];
  trends: RealizationTrend[];
}

export interface RealizationMetrics {
  standardValue: number; // Value at standard rates
  billedValue: number; // Value actually billed
  collectedValue: number; // Value actually collected
  writeDowns: number; // Discounts/adjustments before billing
  writeOffs: number; // Bad debts/uncollectible amounts
  billingRealizationRate: number; // Billed / Standard (%)
  collectionRealizationRate: number; // Collected / Billed (%)
  overallRealizationRate: number; // Collected / Standard (%)
  hoursBilled: number;
  hoursStandard: number;
}

export interface TimekeeperRealization {
  timekeeperId: string;
  timekeeperName: string;
  classification: string;
  standardRate: number;
  averageBilledRate: number;
  hoursWorked: number;
  hoursBilled: number;
  standardValue: number;
  billedValue: number;
  collectedValue: number;
  billingRealizationRate: number;
  collectionRealizationRate: number;
  overallRealizationRate: number;
  writeDownAmount: number;
}

export interface MatterRealization {
  matterId: string;
  matterName: string;
  clientId: string;
  clientName: string;
  standardValue: number;
  billedValue: number;
  collectedValue: number;
  billingRealizationRate: number;
  collectionRealizationRate: number;
  overallRealizationRate: number;
  feeArrangement: string;
  writeDownReason?: string;
}

export interface ClientRealization {
  clientId: string;
  clientName: string;
  standardValue: number;
  billedValue: number;
  collectedValue: number;
  billingRealizationRate: number;
  collectionRealizationRate: number;
  overallRealizationRate: number;
  matterCount: number;
  averageRealization: number;
}

export interface PracticeAreaRealization {
  practiceArea: string;
  standardValue: number;
  billedValue: number;
  collectedValue: number;
  billingRealizationRate: number;
  collectionRealizationRate: number;
  matterCount: number;
  timekeeperCount: number;
}

export interface RealizationTrend {
  period: string;
  billingRealizationRate: number;
  collectionRealizationRate: number;
  overallRealizationRate: number;
  totalBilled: number;
  totalCollected: number;
}

export interface WriteDownAnalysis {
  totalWriteDowns: number;
  writeDownRate: number;
  byReason: WriteDownByReason[];
  byTimekeeper: WriteDownByTimekeeper[];
  byClient: WriteDownByClient[];
}

export interface WriteDownByReason {
  reason: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface WriteDownByTimekeeper {
  timekeeperId: string;
  timekeeperName: string;
  writeDownAmount: number;
  affectedHours: number;
  writeDownRate: number;
}

export interface WriteDownByClient {
  clientId: string;
  clientName: string;
  writeDownAmount: number;
  writeDownRate: number;
  reasonsCount: Map<string, number>;
}

@Injectable()
export class RealizationReportService {
  private readonly logger = new Logger(RealizationReportService.name);

  /**
   * Generate comprehensive realization report
   */
  async generateRealizationReport(
    startDate: Date,
    endDate: Date,
    options: {
      clientId?: string;
      matterId?: string;
      practiceArea?: string;
    } = {},
  ): Promise<RealizationReport> {
    this.logger.log(`Generating realization report from ${startDate} to ${endDate}`);

    // Fetch billing data
    const billingData = await this.getBillingData(startDate, endDate, options);

    // Calculate overall realization
    const overallRealization = this.calculateOverallRealization(billingData);

    // Group by various dimensions
    const byTimekeeper = this.calculateTimekeeperRealization(billingData);
    const byMatter = this.calculateMatterRealization(billingData);
    const byClient = this.calculateClientRealization(billingData);
    const byPracticeArea = this.calculatePracticeAreaRealization(billingData);

    // Calculate trends
    const trends = await this.calculateRealizationTrends(startDate, endDate);

    const report: RealizationReport = {
      reportDate: new Date(),
      periodStart: startDate,
      periodEnd: endDate,
      overallRealization,
      byTimekeeper,
      byMatter,
      byClient,
      byPracticeArea,
      trends,
    };

    this.logger.log(
      `Realization report complete: Overall rate ${overallRealization.overallRealizationRate.toFixed(1)}%, ` +
      `Billing rate ${overallRealization.billingRealizationRate.toFixed(1)}%, ` +
      `Collection rate ${overallRealization.collectionRealizationRate.toFixed(1)}%`,
    );

    return report;
  }

  /**
   * Calculate overall realization metrics
   */
  private calculateOverallRealization(billingData: any[]): RealizationMetrics {
    const standardValue = billingData.reduce((sum, item) => sum + item.standardValue, 0);
    const billedValue = billingData.reduce((sum, item) => sum + item.billedValue, 0);
    const collectedValue = billingData.reduce((sum, item) => sum + item.collectedValue, 0);
    const writeDowns = standardValue - billedValue;
    const writeOffs = billedValue - collectedValue;
    const hoursStandard = billingData.reduce((sum, item) => sum + (item.hours || 0), 0);
    const hoursBilled = billingData.reduce((sum, item) => sum + (item.hoursBilled || item.hours || 0), 0);

    const billingRealizationRate = standardValue > 0 ? (billedValue / standardValue) * 100 : 0;
    const collectionRealizationRate = billedValue > 0 ? (collectedValue / billedValue) * 100 : 0;
    const overallRealizationRate = standardValue > 0 ? (collectedValue / standardValue) * 100 : 0;

    return {
      standardValue,
      billedValue,
      collectedValue,
      writeDowns,
      writeOffs,
      billingRealizationRate,
      collectionRealizationRate,
      overallRealizationRate,
      hoursBilled,
      hoursStandard,
    };
  }

  /**
   * Calculate realization by timekeeper
   */
  private calculateTimekeeperRealization(billingData: any[]): TimekeeperRealization[] {
    const timekeeperMap = new Map<string, any[]>();

    // Group by timekeeper
    for (const item of billingData) {
      if (!item.timekeeperId) continue;
      const items = timekeeperMap.get(item.timekeeperId) || [];
      items.push(item);
      timekeeperMap.set(item.timekeeperId, items);
    }

    const result: TimekeeperRealization[] = [];

    for (const [timekeeperId, items] of timekeeperMap.entries()) {
      const standardValue = items.reduce((sum, item) => sum + item.standardValue, 0);
      const billedValue = items.reduce((sum, item) => sum + item.billedValue, 0);
      const collectedValue = items.reduce((sum, item) => sum + item.collectedValue, 0);
      const hoursWorked = items.reduce((sum, item) => sum + (item.hours || 0), 0);
      const hoursBilled = items.reduce((sum, item) => sum + (item.hoursBilled || item.hours || 0), 0);

      const billingRealizationRate = standardValue > 0 ? (billedValue / standardValue) * 100 : 0;
      const collectionRealizationRate = billedValue > 0 ? (collectedValue / billedValue) * 100 : 0;
      const overallRealizationRate = standardValue > 0 ? (collectedValue / standardValue) * 100 : 0;

      result.push({
        timekeeperId,
        timekeeperName: items[0].timekeeperName || '',
        classification: items[0].classification || '',
        standardRate: items[0].standardRate || 0,
        averageBilledRate: hoursWorked > 0 ? billedValue / hoursWorked : 0,
        hoursWorked,
        hoursBilled,
        standardValue,
        billedValue,
        collectedValue,
        billingRealizationRate,
        collectionRealizationRate,
        overallRealizationRate,
        writeDownAmount: standardValue - billedValue,
      });
    }

    return result.sort((a, b) => b.standardValue - a.standardValue);
  }

  /**
   * Calculate realization by matter
   */
  private calculateMatterRealization(billingData: any[]): MatterRealization[] {
    const matterMap = new Map<string, any[]>();

    for (const item of billingData) {
      const items = matterMap.get(item.matterId) || [];
      items.push(item);
      matterMap.set(item.matterId, items);
    }

    const result: MatterRealization[] = [];

    for (const [matterId, items] of matterMap.entries()) {
      const standardValue = items.reduce((sum, item) => sum + item.standardValue, 0);
      const billedValue = items.reduce((sum, item) => sum + item.billedValue, 0);
      const collectedValue = items.reduce((sum, item) => sum + item.collectedValue, 0);

      const billingRealizationRate = standardValue > 0 ? (billedValue / standardValue) * 100 : 0;
      const collectionRealizationRate = billedValue > 0 ? (collectedValue / billedValue) * 100 : 0;
      const overallRealizationRate = standardValue > 0 ? (collectedValue / standardValue) * 100 : 0;

      result.push({
        matterId,
        matterName: items[0].matterName || '',
        clientId: items[0].clientId || '',
        clientName: items[0].clientName || '',
        standardValue,
        billedValue,
        collectedValue,
        billingRealizationRate,
        collectionRealizationRate,
        overallRealizationRate,
        feeArrangement: items[0].feeArrangement || 'Hourly',
        writeDownReason: items[0].writeDownReason,
      });
    }

    return result.sort((a, b) => b.standardValue - a.standardValue);
  }

  /**
   * Calculate realization by client
   */
  private calculateClientRealization(billingData: any[]): ClientRealization[] {
    const clientMap = new Map<string, any[]>();

    for (const item of billingData) {
      const items = clientMap.get(item.clientId) || [];
      items.push(item);
      clientMap.set(item.clientId, items);
    }

    const result: ClientRealization[] = [];

    for (const [clientId, items] of clientMap.entries()) {
      const standardValue = items.reduce((sum, item) => sum + item.standardValue, 0);
      const billedValue = items.reduce((sum, item) => sum + item.billedValue, 0);
      const collectedValue = items.reduce((sum, item) => sum + item.collectedValue, 0);
      const matterCount = new Set(items.map(item => item.matterId)).size;

      const billingRealizationRate = standardValue > 0 ? (billedValue / standardValue) * 100 : 0;
      const collectionRealizationRate = billedValue > 0 ? (collectedValue / billedValue) * 100 : 0;
      const overallRealizationRate = standardValue > 0 ? (collectedValue / standardValue) * 100 : 0;

      result.push({
        clientId,
        clientName: items[0].clientName || '',
        standardValue,
        billedValue,
        collectedValue,
        billingRealizationRate,
        collectionRealizationRate,
        overallRealizationRate,
        matterCount,
        averageRealization: overallRealizationRate,
      });
    }

    return result.sort((a, b) => b.standardValue - a.standardValue);
  }

  /**
   * Calculate realization by practice area
   */
  private calculatePracticeAreaRealization(billingData: any[]): PracticeAreaRealization[] {
    const areaMap = new Map<string, any[]>();

    for (const item of billingData) {
      const area = item.practiceArea || 'General';
      const items = areaMap.get(area) || [];
      items.push(item);
      areaMap.set(area, items);
    }

    const result: PracticeAreaRealization[] = [];

    for (const [practiceArea, items] of areaMap.entries()) {
      const standardValue = items.reduce((sum, item) => sum + item.standardValue, 0);
      const billedValue = items.reduce((sum, item) => sum + item.billedValue, 0);
      const collectedValue = items.reduce((sum, item) => sum + item.collectedValue, 0);
      const matterCount = new Set(items.map(item => item.matterId)).size;
      const timekeeperCount = new Set(items.map(item => item.timekeeperId).filter(Boolean)).size;

      const billingRealizationRate = standardValue > 0 ? (billedValue / standardValue) * 100 : 0;
      const collectionRealizationRate = billedValue > 0 ? (collectedValue / billedValue) * 100 : 0;

      result.push({
        practiceArea,
        standardValue,
        billedValue,
        collectedValue,
        billingRealizationRate,
        collectionRealizationRate,
        matterCount,
        timekeeperCount,
      });
    }

    return result.sort((a, b) => b.standardValue - a.standardValue);
  }

  /**
   * Calculate realization trends over time
   */
  private async calculateRealizationTrends(
    startDate: Date,
    endDate: Date,
  ): Promise<RealizationTrend[]> {
    const trends: RealizationTrend[] = [];
    const months = this.getMonthsBetween(startDate, endDate);

    for (const month of months) {
      const monthData = await this.getBillingData(month.start, month.end);
      const metrics = this.calculateOverallRealization(monthData);

      trends.push({
        period: month.period,
        billingRealizationRate: metrics.billingRealizationRate,
        collectionRealizationRate: metrics.collectionRealizationRate,
        overallRealizationRate: metrics.overallRealizationRate,
        totalBilled: metrics.billedValue,
        totalCollected: metrics.collectedValue,
      });
    }

    return trends;
  }

  /**
   * Analyze write-downs
   */
  async analyzeWriteDowns(
    startDate: Date,
    endDate: Date,
  ): Promise<WriteDownAnalysis> {
    const billingData = await this.getBillingData(startDate, endDate);

    const totalWriteDowns = billingData.reduce(
      (sum, item) => sum + (item.standardValue - item.billedValue),
      0,
    );
    const totalStandard = billingData.reduce((sum, item) => sum + item.standardValue, 0);
    const writeDownRate = totalStandard > 0 ? (totalWriteDowns / totalStandard) * 100 : 0;

    // Group by reason
    const reasonMap = new Map<string, { amount: number; count: number }>();
    for (const item of billingData) {
      if (item.writeDownReason && item.standardValue > item.billedValue) {
        const existing = reasonMap.get(item.writeDownReason) || { amount: 0, count: 0 };
        existing.amount += item.standardValue - item.billedValue;
        existing.count++;
        reasonMap.set(item.writeDownReason, existing);
      }
    }

    const byReason: WriteDownByReason[] = Array.from(reasonMap.entries()).map(([reason, data]) => ({
      reason,
      amount: data.amount,
      count: data.count,
      percentage: totalWriteDowns > 0 ? (data.amount / totalWriteDowns) * 100 : 0,
    }));

    // By timekeeper (simplified)
    const byTimekeeper: WriteDownByTimekeeper[] = [];

    // By client (simplified)
    const byClient: WriteDownByClient[] = [];

    return {
      totalWriteDowns,
      writeDownRate,
      byReason: byReason.sort((a, b) => b.amount - a.amount),
      byTimekeeper,
      byClient,
    };
  }

  /**
   * Get realization benchmarks
   */
  async getRealizationBenchmarks(): Promise<any> {
    return {
      industryAverage: {
        billingRealization: 92,
        collectionRealization: 95,
        overallRealization: 87,
      },
      byClassification: {
        PARTNER: { billingRealization: 95, collectionRealization: 96, overallRealization: 91 },
        ASSOCIATE: { billingRealization: 90, collectionRealization: 94, overallRealization: 85 },
        PARALEGAL: { billingRealization: 88, collectionRealization: 95, overallRealization: 84 },
      },
      goals: {
        billingRealization: 93,
        collectionRealization: 96,
        overallRealization: 89,
      },
    };
  }

  /**
   * Identify low realization matters
   */
  async identifyLowRealizationMatters(
    threshold: number = 80,
  ): Promise<MatterRealization[]> {
    const billingData = await this.getBillingData(
      new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      new Date(),
    );

    const matterRealization = this.calculateMatterRealization(billingData);

    return matterRealization
      .filter(matter => matter.overallRealizationRate < threshold)
      .sort((a, b) => a.overallRealizationRate - b.overallRealizationRate);
  }

  /**
   * Helper methods
   */
  private getMonthsBetween(
    startDate: Date,
    endDate: Date,
  ): Array<{ period: string; start: Date; end: Date }> {
    const months: Array<{ period: string; start: Date; end: Date }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      months.push({
        period: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        start: monthStart,
        end: monthEnd > endDate ? endDate : monthEnd,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  private async getBillingData(
    startDate: Date,
    endDate: Date,
    options: any = {},
  ): Promise<any[]> {
    // Mock implementation - would query database
    return [];
  }
}
