import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { KPIMetric, Period, TrendDirection } from './entities/kpi-metric.entity';

export interface KPICalculationParams {
  organizationId?: string;
  startDate: Date;
  endDate: Date;
  compareWithPrevious?: boolean;
}

export interface CalculatedKPI {
  name: string;
  value: number;
  target?: number;
  trend?: TrendDirection;
  trendPercentage?: number;
  unit?: string;
}

@Injectable()
export class KPICalculatorService {
  private readonly logger = new Logger(KPICalculatorService.name);

  constructor(
    @InjectRepository(KPIMetric)
    private kpiMetricRepository: Repository<KPIMetric>,
  ) {}

  /**
   * Calculate utilization rate (billable hours / total hours)
   */
  async calculateUtilizationRate(
    billableHours: number,
    totalHours: number,
    target = 80,
  ): Promise<CalculatedKPI> {
    const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    return {
      name: 'Utilization Rate',
      value: Number(utilizationRate.toFixed(2)),
      target,
      unit: '%',
    };
  }

  /**
   * Calculate realization rate (collected / billed)
   */
  async calculateRealizationRate(
    collected: number,
    billed: number,
    target = 95,
  ): Promise<CalculatedKPI> {
    const realizationRate = billed > 0 ? (collected / billed) * 100 : 0;

    return {
      name: 'Realization Rate',
      value: Number(realizationRate.toFixed(2)),
      target,
      unit: '%',
    };
  }

  /**
   * Calculate collection effectiveness
   */
  async calculateCollectionEffectiveness(
    collected: number,
    receivables: number,
  ): Promise<CalculatedKPI> {
    const total = collected + receivables;
    const effectiveness = total > 0 ? (collected / total) * 100 : 0;

    return {
      name: 'Collection Effectiveness',
      value: Number(effectiveness.toFixed(2)),
      target: 90,
      unit: '%',
    };
  }

  /**
   * Calculate profit margin
   */
  async calculateProfitMargin(
    revenue: number,
    expenses: number,
  ): Promise<CalculatedKPI> {
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      name: 'Profit Margin',
      value: Number(margin.toFixed(2)),
      target: 30,
      unit: '%',
    };
  }

  /**
   * Calculate average case duration
   */
  async calculateAverageCaseDuration(
    totalDays: number,
    caseCount: number,
  ): Promise<CalculatedKPI> {
    const avgDuration = caseCount > 0 ? totalDays / caseCount : 0;

    return {
      name: 'Average Case Duration',
      value: Number(avgDuration.toFixed(1)),
      unit: 'days',
    };
  }

  /**
   * Calculate client retention rate
   */
  async calculateClientRetentionRate(
    startingClients: number,
    endingClients: number,
    newClients: number,
  ): Promise<CalculatedKPI> {
    const retainedClients = endingClients - newClients;
    const retentionRate = startingClients > 0 ? (retainedClients / startingClients) * 100 : 0;

    return {
      name: 'Client Retention Rate',
      value: Number(Math.max(0, retentionRate).toFixed(2)),
      target: 85,
      unit: '%',
    };
  }

  /**
   * Calculate trend direction and percentage
   */
  calculateTrend(currentValue: number, previousValue: number): {
    direction: TrendDirection;
    percentage: number;
  } {
    if (previousValue === 0) {
      return {
        direction: 'stable',
        percentage: 0,
      };
    }

    const change = ((currentValue - previousValue) / previousValue) * 100;
    const percentage = Number(Math.abs(change).toFixed(2));

    let direction: TrendDirection = 'stable';
    if (Math.abs(change) > 1) { // Only consider significant changes (>1%)
      direction = change > 0 ? 'up' : 'down';
    }

    return { direction, percentage };
  }

  /**
   * Save KPI metric to database
   */
  async saveKPIMetric(
    name: string,
    value: number,
    category: string,
    period: Period,
    organizationId?: string,
    additionalData?: Partial<KPIMetric>,
  ): Promise<KPIMetric> {
    const metric = this.kpiMetricRepository.create({
      name,
      value,
      category: category as any,
      period,
      organizationId,
      recordedAt: new Date(),
      ...additionalData,
    });

    return this.kpiMetricRepository.save(metric);
  }

  /**
   * Get historical KPI data for trend analysis
   */
  async getHistoricalKPI(
    name: string,
    startDate: Date,
    endDate: Date,
    organizationId?: string,
  ): Promise<KPIMetric[]> {
    const query = this.kpiMetricRepository
      .createQueryBuilder('kpi')
      .where('kpi.name = :name', { name })
      .andWhere('kpi.recordedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (organizationId) {
      query.andWhere('kpi.organizationId = :organizationId', { organizationId });
    }

    return query
      .orderBy('kpi.recordedAt', 'ASC')
      .getMany();
  }

  /**
   * Calculate KPI variance from target
   */
  calculateVariance(actual: number, target: number): {
    variance: number;
    percentage: number;
    status: 'above' | 'below' | 'on_target';
  } {
    const variance = actual - target;
    const percentage = target !== 0 ? (variance / target) * 100 : 0;

    let status: 'above' | 'below' | 'on_target' = 'on_target';
    if (Math.abs(percentage) > 5) { // 5% threshold
      status = variance > 0 ? 'above' : 'below';
    }

    return {
      variance: Number(variance.toFixed(2)),
      percentage: Number(percentage.toFixed(2)),
      status,
    };
  }

  /**
   * Get period-over-period comparison
   */
  async getPeriodComparison(
    name: string,
    currentPeriod: { start: Date; end: Date },
    previousPeriod: { start: Date; end: Date },
    organizationId?: string,
  ): Promise<{
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    trend: TrendDirection;
  }> {
    const [currentMetrics, previousMetrics] = await Promise.all([
      this.getHistoricalKPI(name, currentPeriod.start, currentPeriod.end, organizationId),
      this.getHistoricalKPI(name, previousPeriod.start, previousPeriod.end, organizationId),
    ]);

    const currentValue = currentMetrics.reduce((sum, m) => sum + Number(m.value), 0) / (currentMetrics.length || 1);
    const previousValue = previousMetrics.reduce((sum, m) => sum + Number(m.value), 0) / (previousMetrics.length || 1);

    const change = currentValue - previousValue;
    const trend = this.calculateTrend(currentValue, previousValue);

    return {
      current: Number(currentValue.toFixed(2)),
      previous: Number(previousValue.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercentage: trend.percentage,
      trend: trend.direction,
    };
  }
}
