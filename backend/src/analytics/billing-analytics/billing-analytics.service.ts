import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BillingAnalyticsQueryDto,
  BillingMetricsDto,
  AttorneyRevenue,
  BillingTrendDataPoint,
  WipAgingDto,
  CaseWip,
  ArAgingDto,
  ClientAr,
  RealizationAnalysisDto,
  PracticeAreaRealization,
  AttorneyRealization,
} from './dto/billing-analytics.dto';

@Injectable()
export class BillingAnalyticsService {
  private readonly logger = new Logger(BillingAnalyticsService.name);

  constructor(
    // @InjectRepository(TimeEntry) private timeEntryRepository: Repository<any>,
    // @InjectRepository(Invoice) private invoiceRepository: Repository<any>,
    // Inject repositories when entities are available
  ) {}

  /**
   * Get overall billing metrics
   */
  async getBillingMetrics(query: BillingAnalyticsQueryDto): Promise<BillingMetricsDto> {
    try {
      // Mock implementation
      /*
      const qb = this.timeEntryRepository.createQueryBuilder('entry');

      if (query.startDate) {
        qb.andWhere('entry.date >= :startDate', { startDate: query.startDate });
      }
      if (query.endDate) {
        qb.andWhere('entry.date <= :endDate', { endDate: query.endDate });
      }
      if (query.caseId) {
        qb.andWhere('entry.caseId = :caseId', { caseId: query.caseId });
      }

      const entries = await qb.getMany();
      const totalBillableHours = entries
        .filter(e => e.billable)
        .reduce((sum, e) => sum + e.hours, 0);
      */

      const metrics: BillingMetricsDto = {
        totalBillableHours: 12450,
        totalNonBillableHours: 2340,
        totalBilled: 4980000,
        totalCollected: 4380000,
        wipValue: 856000,
        arValue: 1245000,
        realizationRate: 87.9,
        collectionRate: 87.9,
        utilizationRate: 84.2,
        avgBillingRate: 400,
        revenueByPracticeArea: {
          'Corporate Law': 1875000,
          'Civil Litigation': 1494000,
          'Intellectual Property': 996000,
          'Employment Law': 415800,
          'Real Estate': 199200,
        },
        revenueByAttorney: [
          {
            attorneyId: '1',
            attorneyName: 'Sarah Johnson',
            billableHours: 1850,
            totalBilled: 925000,
            totalCollected: 832500,
            realizationRate: 90,
            utilizationRate: 88,
          },
          {
            attorneyId: '2',
            attorneyName: 'Michael Chen',
            billableHours: 1680,
            totalBilled: 756000,
            totalCollected: 680400,
            realizationRate: 90,
            utilizationRate: 85,
          },
          {
            attorneyId: '3',
            attorneyName: 'Patricia Williams',
            billableHours: 1920,
            totalBilled: 672000,
            totalCollected: 604800,
            realizationRate: 90,
            utilizationRate: 92,
          },
        ],
        trends: await this.getBillingTrends(query),
      };

      return metrics;
    } catch (error) {
      this.logger.error(`Error getting billing metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get billing trends over time
   */
  async getBillingTrends(query: BillingAnalyticsQueryDto): Promise<BillingTrendDataPoint[]> {
    const trends: BillingTrendDataPoint[] = [
      {
        period: '2024-12',
        billableHours: 1245,
        billed: 498000,
        collected: 438000,
        realizationRate: 87.9,
        newWip: 85600,
        newAr: 124500,
      },
      {
        period: '2024-11',
        billableHours: 1180,
        billed: 472000,
        collected: 424800,
        realizationRate: 90,
        newWip: 78000,
        newAr: 118000,
      },
      {
        period: '2024-10',
        billableHours: 1320,
        billed: 528000,
        collected: 475200,
        realizationRate: 90,
        newWip: 92000,
        newAr: 132000,
      },
    ];

    return trends;
  }

  /**
   * Get work in progress (WIP) aging
   */
  async getWipAging(query: BillingAnalyticsQueryDto): Promise<WipAgingDto> {
    try {
      // Mock implementation
      /*
      const wipEntries = await this.timeEntryRepository
        .createQueryBuilder('entry')
        .where('entry.invoiceId IS NULL')
        .andWhere('entry.billable = true')
        .getMany();

      const totalWip = wipEntries.reduce((sum, e) => sum + e.amount, 0);

      const calculateAge = (entry) => {
        const now = new Date();
        return Math.floor((now.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24));
      };

      const current = wipEntries.filter(e => calculateAge(e) <= 30);
      const days31to60 = wipEntries.filter(e => calculateAge(e) > 30 && calculateAge(e) <= 60);
      */

      const aging: WipAgingDto = {
        totalWip: 856000,
        current: 485000,
        days31to60: 198000,
        days61to90: 98000,
        days91to120: 45000,
        over120: 30000,
        wipByCases: [
          {
            caseId: '1',
            caseNumber: 'CV-2024-001',
            clientName: 'Acme Corporation',
            wipValue: 125000,
            ageInDays: 45,
            lastBilledDate: new Date('2024-10-28'),
            agingCategory: '31-60',
          },
          {
            caseId: '2',
            caseNumber: 'CV-2024-002',
            clientName: 'Tech Innovations Inc',
            wipValue: 98000,
            ageInDays: 22,
            lastBilledDate: new Date('2024-11-20'),
            agingCategory: 'current',
          },
        ],
        avgWipAge: 42,
      };

      return aging;
    } catch (error) {
      this.logger.error(`Error getting WIP aging: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get accounts receivable (AR) aging
   */
  async getArAging(query: BillingAnalyticsQueryDto): Promise<ArAgingDto> {
    try {
      // Mock implementation
      /*
      const unpaidInvoices = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .where('invoice.status = :status', { status: 'outstanding' })
        .getMany();

      const totalAr = unpaidInvoices.reduce((sum, i) => sum + i.amount - i.paidAmount, 0);
      */

      const aging: ArAgingDto = {
        totalAr: 1245000,
        current: 685000,
        days31to60: 298000,
        days61to90: 145000,
        days91to120: 78000,
        over120: 39000,
        arByClient: [
          {
            clientId: '1',
            clientName: 'Acme Corporation',
            arValue: 185000,
            ageInDays: 55,
            lastPaymentDate: new Date('2024-10-18'),
            agingCategory: '31-60',
            riskLevel: 'medium',
          },
          {
            clientId: '2',
            clientName: 'Tech Innovations Inc',
            arValue: 142000,
            ageInDays: 28,
            lastPaymentDate: new Date('2024-11-14'),
            agingCategory: 'current',
            riskLevel: 'low',
          },
          {
            clientId: '3',
            clientName: 'Global Services LLC',
            arValue: 98000,
            ageInDays: 125,
            lastPaymentDate: new Date('2024-08-08'),
            agingCategory: 'over-120',
            riskLevel: 'high',
          },
        ],
        avgArAge: 48,
        dso: 52, // Days Sales Outstanding
      };

      return aging;
    } catch (error) {
      this.logger.error(`Error getting AR aging: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get realization rate analysis
   */
  async getRealizationAnalysis(query: BillingAnalyticsQueryDto): Promise<RealizationAnalysisDto> {
    try {
      const analysis: RealizationAnalysisDto = {
        overallRate: 87.9,
        byPracticeArea: [
          {
            practiceArea: 'Corporate Law',
            standardFees: 2100000,
            billedFees: 1875000,
            collectedFees: 1687500,
            realizationRate: 89.3,
          },
          {
            practiceArea: 'Civil Litigation',
            standardFees: 1680000,
            billedFees: 1494000,
            collectedFees: 1344600,
            realizationRate: 88.9,
          },
          {
            practiceArea: 'Intellectual Property',
            standardFees: 1140000,
            billedFees: 996000,
            collectedFees: 896400,
            realizationRate: 87.4,
          },
        ],
        byAttorney: [
          {
            attorneyId: '1',
            attorneyName: 'Sarah Johnson',
            standardRate: 500,
            avgBilledRate: 500,
            realizationRate: 90,
            totalWriteOffs: 92500,
          },
          {
            attorneyId: '2',
            attorneyName: 'Michael Chen',
            standardRate: 450,
            avgBilledRate: 450,
            realizationRate: 90,
            totalWriteOffs: 75600,
          },
        ],
        writeOffAnalysis: {
          totalWriteOffs: 345000,
          writeOffPercentage: 6.5,
          topReasons: {
            'Client discount': 178000,
            'Duplicate work': 89000,
            'Efficiency adjustment': 45000,
            'Collection issue': 33000,
          },
        },
        discountAnalysis: {
          totalDiscounts: 256000,
          discountPercentage: 4.8,
          avgDiscountRate: 5.2,
        },
      };

      return analysis;
    } catch (error) {
      this.logger.error(`Error getting realization analysis: ${error.message}`, error.stack);
      throw error;
    }
  }
}
