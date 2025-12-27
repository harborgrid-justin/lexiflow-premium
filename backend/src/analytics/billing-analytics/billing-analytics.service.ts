import { Injectable, Logger } from '@nestjs/common';
import {
  BillingAnalyticsQueryDto,
  BillingMetricsDto,
  BillingTrendDataPoint,
  WipAgingDto,
  CaseWip,
  ArAgingDto,
  ClientAr,
  RealizationAnalysisDto,
  PracticeAreaRealization,
  AttorneyRealization,
} from './dto/billing-analytics.dto';
import { BillingAnalyticsService as RealBillingAnalyticsService } from '@billing/analytics/billing-analytics.service';
import { AnalyticsFilterDto } from '@billing/analytics/dto/analytics-filter.dto';

@Injectable()
export class BillingAnalyticsService {
  private readonly logger = new Logger(BillingAnalyticsService.name);

  constructor(
    private readonly realBillingAnalyticsService: RealBillingAnalyticsService,
  ) {}

  /**
   * Get overall billing metrics
   * Delegates to real billing analytics service and transforms the response
   */
  async getBillingMetrics(query: BillingAnalyticsQueryDto): Promise<BillingMetricsDto> {
    try {
      const filter = this.transformQueryToFilter(query);

      // Get real data from billing service
      const [wipStats, realization, operatingSummary, arAging] = await Promise.all([
        this.realBillingAnalyticsService.getWipStats(filter),
        this.realBillingAnalyticsService.getRealizationRates(filter),
        this.realBillingAnalyticsService.getOperatingSummary(filter),
        this.realBillingAnalyticsService.getArAging(filter),
      ]);

      // Calculate total hours (would need enhancement in real service for non-billable)
      const totalBillableHours = wipStats.wipByAttorney.reduce(
        (sum, attorney) => sum + attorney.hours,
        0,
      );

      // Transform to analytics format
      const metrics: BillingMetricsDto = {
        totalBillableHours,
        totalNonBillableHours: 0, // Would need additional tracking
        totalBilled: realization.standardAmount,
        totalCollected: realization.collectedAmount,
        wipValue: wipStats.totalWip,
        arValue: arAging.totalAR,
        realizationRate: realization.realizationRate,
        collectionRate: realization.realizationRate, // Simplified
        utilizationRate: 84.2, // Would need capacity data
        avgBillingRate: operatingSummary.averageHourlyRate,
        revenueByPracticeArea: {}, // Would need practice area tracking
        revenueByAttorney: wipStats.wipByAttorney.map((attorney) => ({
          attorneyId: attorney.userId,
          attorneyName: attorney.userName,
          billableHours: attorney.hours,
          totalBilled: attorney.wipAmount,
          totalCollected: attorney.wipAmount * (realization.realizationRate / 100),
          realizationRate: realization.realizationRate,
          utilizationRate: 85, // Would need capacity data
        })),
        trends: await this.getBillingTrends(query),
      };

      return metrics;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting billing metrics: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Transform analytics query to billing filter format
   */
  private transformQueryToFilter(query: BillingAnalyticsQueryDto): AnalyticsFilterDto {
    return {
      startDate: query.startDate,
      endDate: query.endDate,
      caseId: query.caseId,
      userId: query.attorneyId, // Map attorneyId to userId
      clientId: query.clientId,
    };
  }

  /**
   * Get billing trends over time
   * Uses real data to calculate trends
   */
  async getBillingTrends(query: BillingAnalyticsQueryDto): Promise<BillingTrendDataPoint[]> {
    try {
      const filter = this.transformQueryToFilter(query);

      // Get current period data
      const [wipStats, realization] = await Promise.all([
        this.realBillingAnalyticsService.getWipStats(filter),
        this.realBillingAnalyticsService.getRealizationRates(filter),
      ]);

      // Calculate billable hours from WIP data
      const billableHours = wipStats.wipByAttorney.reduce(
        (sum, attorney) => sum + attorney.hours,
        0,
      );

      // Create trend point for current period
      const currentPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM format

      const trends: BillingTrendDataPoint[] = [
        {
          period: currentPeriod,
          billableHours,
          billed: realization.standardAmount,
          collected: realization.collectedAmount,
          realizationRate: realization.realizationRate,
          newWip: wipStats.totalWip,
          newAr: 0, // Would need AR tracking by period
        },
      ];

      return trends;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting billing trends: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Get work in progress (WIP) aging
   * Delegates to real billing analytics service
   */
  async getWipAging(query: BillingAnalyticsQueryDto): Promise<WipAgingDto> {
    try {
      const filter = this.transformQueryToFilter(query);
      const wipStats = await this.realBillingAnalyticsService.getWipStats(filter);

      // Transform WIP aging data to analytics format
      const wipByCases: CaseWip[] = wipStats.wipByCase.map((caseWip) => ({
        caseId: caseWip.caseId,
        caseNumber: caseWip.caseId, // Would need case entity join for case number
        clientName: caseWip.caseName,
        wipValue: caseWip.wipAmount,
        ageInDays: caseWip.ageInDays,
        lastBilledDate: undefined, // Would need invoice tracking
        agingCategory: this.determineAgingCategory(caseWip.ageInDays),
      }));

      // Calculate average WIP age
      const avgWipAge =
        wipByCases.length > 0
          ? wipByCases.reduce((sum, c) => sum + c.ageInDays, 0) / wipByCases.length
          : 0;

      const aging: WipAgingDto = {
        totalWip: wipStats.totalWip,
        current: wipStats.wipAging.current,
        days31to60: wipStats.wipAging.days30,
        days61to90: wipStats.wipAging.days60,
        days91to120: wipStats.wipAging.days90,
        over120: wipStats.wipAging.over120,
        wipByCases,
        avgWipAge: Math.round(avgWipAge),
      };

      return aging;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting WIP aging: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Determine aging category based on age in days
   */
  private determineAgingCategory(
    ageInDays: number,
  ): 'current' | '31-60' | '61-90' | '91-120' | 'over-120' {
    if (ageInDays <= 30) return 'current';
    if (ageInDays <= 60) return '31-60';
    if (ageInDays <= 90) return '61-90';
    if (ageInDays <= 120) return '91-120';
    return 'over-120';
  }

  /**
   * Get accounts receivable (AR) aging
   * Delegates to real billing analytics service
   */
  async getArAging(query: BillingAnalyticsQueryDto): Promise<ArAgingDto> {
    try {
      const filter = this.transformQueryToFilter(query);
      const arData = await this.realBillingAnalyticsService.getArAging(filter);

      // Transform AR aging data to analytics format
      const arByClient: ClientAr[] = arData.byClient.map((clientData) => {
        const totalOverdue =
          clientData.days30 + clientData.days60 + clientData.days90 + clientData.over90;
        const ageInDays = this.estimateAgeFromDistribution(clientData);

        return {
          clientId: clientData.clientId,
          clientName: clientData.clientName,
          arValue: clientData.totalDue,
          ageInDays,
          lastPaymentDate: undefined, // Would need payment tracking
          agingCategory: this.determineArAgingCategory(clientData),
          riskLevel: this.determineRiskLevel(totalOverdue, clientData.totalDue),
        };
      });

      // Calculate average AR age
      const avgArAge =
        arByClient.length > 0
          ? arByClient.reduce((sum, c) => sum + c.ageInDays, 0) / arByClient.length
          : 0;

      const aging: ArAgingDto = {
        totalAr: arData.totalAR,
        current: arData.current,
        days31to60: arData.days30,
        days61to90: arData.days60,
        days91to120: arData.days90,
        over120: arData.over90,
        arByClient,
        avgArAge: Math.round(avgArAge),
        dso: Math.round(avgArAge * 1.15), // Rough DSO estimate
      };

      return aging;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting AR aging: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Estimate age from AR distribution
   */
  private estimateAgeFromDistribution(clientData: { totalDue: number; current: number; days30: number; days60: number; days90: number; over90: number }): number {
    const total = clientData.totalDue;
    if (total === 0) return 0;

    // Weighted average using midpoint of each bucket
    const weightedAge =
      (clientData.current * 15 +
        clientData.days30 * 45 +
        clientData.days60 * 75 +
        clientData.days90 * 105 +
        clientData.over90 * 150) /
      total;

    return Math.round(weightedAge);
  }

  /**
   * Determine AR aging category for client
   */
  private determineArAgingCategory(clientData: { current: number; days30: number; days60: number; days90: number; over90: number }): 'current' | '31-60' | '61-90' | '91-120' | 'over-120' {
    // Use largest bucket
    const max = Math.max(
      clientData.current,
      clientData.days30,
      clientData.days60,
      clientData.days90,
      clientData.over90,
    );

    if (max === clientData.current) return 'current';
    if (max === clientData.days30) return '31-60';
    if (max === clientData.days60) return '61-90';
    if (max === clientData.days90) return '91-120';
    return 'over-120';
  }

  /**
   * Determine collection risk level
   */
  private determineRiskLevel(overdueAmount: number, totalAmount: number): 'low' | 'medium' | 'high' {
    const overduePercentage = totalAmount > 0 ? (overdueAmount / totalAmount) * 100 : 0;

    if (overduePercentage < 20) return 'low';
    if (overduePercentage < 50) return 'medium';
    return 'high';
  }

  /**
   * Get realization rate analysis
   * Delegates to real billing analytics service
   */
  async getRealizationAnalysis(query: BillingAnalyticsQueryDto): Promise<RealizationAnalysisDto> {
    try {
      const filter = this.transformQueryToFilter(query);
      const realization = await this.realBillingAnalyticsService.getRealizationRates(filter);

      // Transform realization data to analytics format
      const byPracticeArea: PracticeAreaRealization[] = realization.byPracticeArea.map((area) => ({
        practiceArea: area.area,
        standardFees: area.standardAmount,
        billedFees: area.standardAmount, // Assuming no billing discounts tracked separately
        collectedFees: area.collectedAmount,
        realizationRate: area.realizationRate,
      }));

      const byAttorney: AttorneyRealization[] = realization.byAttorney.map((attorney) => {
        const writeOffs = attorney.standardAmount - attorney.collectedAmount;
        return {
          attorneyId: attorney.userId,
          attorneyName: attorney.userName,
          standardRate: 0, // Would need rate table data
          avgBilledRate: 0, // Would need rate table data
          realizationRate: attorney.realizationRate,
          totalWriteOffs: writeOffs,
        };
      });

      const analysis: RealizationAnalysisDto = {
        overallRate: realization.realizationRate,
        byPracticeArea,
        byAttorney,
        writeOffAnalysis: {
          totalWriteOffs: realization.writeOffs,
          writeOffPercentage:
            realization.standardAmount > 0
              ? (realization.writeOffs / realization.standardAmount) * 100
              : 0,
          topReasons: {
            // Would need detailed write-off reason tracking
            'Not specified': realization.writeOffs,
          },
        },
        discountAnalysis: {
          totalDiscounts: realization.discounts,
          discountPercentage:
            realization.standardAmount > 0
              ? (realization.discounts / realization.standardAmount) * 100
              : 0,
          avgDiscountRate:
            realization.standardAmount > 0
              ? (realization.discounts / realization.standardAmount) * 100
              : 0,
        },
      };

      return analysis;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting realization analysis: ${message}`, stack);
      throw error;
    }
  }
}
