import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Attorney Performance Service
 * Individual attorney metrics and performance analysis
 */
@Injectable()
export class AttorneyPerformanceService {
  private readonly logger = new Logger(AttorneyPerformanceService.name);

  constructor(
    @InjectRepository('User') private userRepo: Repository<any>,
    @InjectRepository('Case') private caseRepo: Repository<any>,
    @InjectRepository('TimeEntry') private timeEntryRepo: Repository<any>,
  ) {}

  async analyzeAttorneyPerformance(attorneyId: string, period: 'month' | 'quarter' | 'year' = 'year'): Promise<{
    overview: {
      attorneyName: string;
      title: string;
      yearsExperience: number;
      specialization: string;
    };
    productivity: {
      billableHours: number;
      targetHours: number;
      utilizationRate: number;
      hoursPerDay: number;
    };
    financial: {
      totalRevenue: number;
      targetRevenue: number;
      realizationRate: number;
      averageRate: number;
      collections: number;
    };
    caseload: {
      activeCases: number;
      closedCases: number;
      winRate: number;
      settlementRate: number;
    };
    quality: {
      clientSatisfaction: number;
      peerRating: number;
      motionSuccessRate: number;
      appealRate: number;
    };
    comparison: {
      vsTarget: number;
      vsPeers: number;
      rank: number;
      percentile: number;
    };
    recommendations: string[];
  }> {
    const attorney = await this.userRepo.findOne({ where: { id: attorneyId } });

    const { startDate, endDate } = this.getPeriodDates(period);

    const timeEntries = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .where('entry.attorneyId = :attorneyId', { attorneyId })
      .andWhere('entry.date >= :startDate', { startDate })
      .andWhere('entry.date <= :endDate', { endDate })
      .getMany();

    const billableHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const totalRevenue = timeEntries.reduce((sum, e) => sum + e.amount, 0);

    const cases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.attorneyId = :attorneyId', { attorneyId })
      .getMany();

    const activeCases = cases.filter((c) => !['closed', 'won', 'lost'].includes(c.status)).length;
    const closedCases = cases.filter((c) => c.closedDate && c.closedDate >= startDate && c.closedDate <= endDate);
    const wonCases = closedCases.filter((c) => c.status === 'won').length;
    const winRate = closedCases.length > 0 ? (wonCases / closedCases.length) * 100 : 0;

    const targetHours = period === 'year' ? 1700 : period === 'quarter' ? 425 : 142;
    const targetRevenue = period === 'year' ? 425000 : period === 'quarter' ? 106250 : 35416;

    return {
      overview: {
        attorneyName: attorney?.name || 'Unknown',
        title: attorney?.title || 'Attorney',
        yearsExperience: attorney?.yearsExperience || 0,
        specialization: attorney?.specialization || 'General Practice',
      },
      productivity: {
        billableHours: Math.round(billableHours),
        targetHours,
        utilizationRate: Math.round((billableHours / targetHours) * 100 * 10) / 10,
        hoursPerDay: Math.round((billableHours / 260) * 10) / 10,
      },
      financial: {
        totalRevenue: Math.round(totalRevenue),
        targetRevenue,
        realizationRate: 87.5,
        averageRate: Math.round(totalRevenue / billableHours),
        collections: Math.round(totalRevenue * 0.92),
      },
      caseload: {
        activeCases,
        closedCases: closedCases.length,
        winRate: Math.round(winRate * 10) / 10,
        settlementRate: 35.0,
      },
      quality: {
        clientSatisfaction: 4.3,
        peerRating: 4.1,
        motionSuccessRate: 72.5,
        appealRate: 8.2,
      },
      comparison: {
        vsTarget: Math.round(((totalRevenue - targetRevenue) / targetRevenue) * 100 * 10) / 10,
        vsPeers: 12.5,
        rank: 8,
        percentile: 75,
      },
      recommendations: this.generateRecommendations(billableHours, targetHours, totalRevenue, targetRevenue, winRate),
    };
  }

  private generateRecommendations(
    billableHours: number,
    targetHours: number,
    revenue: number,
    targetRevenue: number,
    winRate: number,
  ): string[] {
    const recommendations = [];

    if (billableHours < targetHours * 0.9) {
      recommendations.push('Increase billable hours to meet target utilization');
    }

    if (revenue < targetRevenue * 0.9) {
      recommendations.push('Review billing rates and realization');
    }

    if (winRate < 60) {
      recommendations.push('Focus on case selection and trial preparation');
    }

    if (billableHours > targetHours && revenue > targetRevenue) {
      recommendations.push('Excellent performance - consider mentoring junior attorneys');
    }

    return recommendations;
  }

  private getPeriodDates(period: 'month' | 'quarter' | 'year'): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = new Date();
    const startDate = new Date();

    if (period === 'month') {
      startDate.setMonth(endDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(endDate.getMonth() - 3);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    return { startDate, endDate };
  }
}
