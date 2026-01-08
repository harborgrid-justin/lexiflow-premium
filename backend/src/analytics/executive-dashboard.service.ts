import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';
import { KPIMetric } from './entities/kpi-metric.entity';
import { KPICalculatorService } from './kpi-calculator.service';

export interface ExecutiveDashboardData {
  kpis: {
    revenue: { value: number; trend: string; change: number };
    profitMargin: { value: number; trend: string; change: number };
    utilizationRate: { value: number; trend: string; change: number };
    realizationRate: { value: number; trend: string; change: number };
    activeCases: { value: number; trend: string; change: number };
    activeClients: { value: number; trend: string; change: number };
    billableHours: { value: number; trend: string; change: number };
    collectionRate: { value: number; trend: string; change: number };
  };
  charts: {
    revenueByMonth: Array<{ month: string; revenue: number; target: number }>;
    casesByStatus: Array<{ status: string; count: number }>;
    topPracticeGroups: Array<{ name: string; revenue: number; cases: number }>;
    attorneyUtilization: Array<{ name: string; utilization: number; target: number }>;
  };
  snapshot: {
    date: string;
    organizationId?: string;
    lastUpdated: Date;
  };
}

export interface DashboardFilters {
  organizationId?: string;
  startDate: Date;
  endDate: Date;
  practiceGroupIds?: string[];
  departmentIds?: string[];
}

@Injectable()
export class ExecutiveDashboardService {
  private readonly logger = new Logger(ExecutiveDashboardService.name);

  constructor(
    @InjectRepository(DashboardWidget)
    private widgetRepository: Repository<DashboardWidget>,
    @InjectRepository(AnalyticsSnapshot)
    private snapshotRepository: Repository<AnalyticsSnapshot>,
    @InjectRepository(KPIMetric)
    private kpiRepository: Repository<KPIMetric>,
    private kpiCalculatorService: KPICalculatorService,
  ) {}

  /**
   * Get executive dashboard overview
   */
  async getExecutiveOverview(filters: DashboardFilters): Promise<ExecutiveDashboardData> {
    this.logger.log(`Generating executive overview for organization: ${filters.organizationId}`);

    const [kpis, charts, latestSnapshot] = await Promise.all([
      this.getExecutiveKPIs(filters),
      this.getExecutiveCharts(filters),
      this.getLatestSnapshot('executive_summary', filters.organizationId),
    ]);

    return {
      kpis,
      charts,
      snapshot: {
        date: latestSnapshot?.snapshotDate || new Date().toISOString().split('T')[0],
        organizationId: filters.organizationId,
        lastUpdated: latestSnapshot?.updatedAt || new Date(),
      },
    };
  }

  /**
   * Get executive KPIs
   */
  private async getExecutiveKPIs(filters: DashboardFilters) {
    // Calculate date range for previous period comparison
    const periodDays = Math.ceil((filters.endDate.getTime() - filters.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(filters.startDate);
    previousStart.setDate(previousStart.getDate() - periodDays);
    const previousEnd = new Date(filters.startDate);

    // Get current and previous period metrics
    const [currentMetrics, previousMetrics] = await Promise.all([
      this.getAggregatedMetrics(filters.startDate, filters.endDate, filters.organizationId),
      this.getAggregatedMetrics(previousStart, previousEnd, filters.organizationId),
    ]);

    // Calculate KPIs with trends
    return {
      revenue: this.calculateKPIWithTrend(
        currentMetrics.revenue || 0,
        previousMetrics.revenue || 0,
      ),
      profitMargin: this.calculateKPIWithTrend(
        currentMetrics.profitMargin || 0,
        previousMetrics.profitMargin || 0,
      ),
      utilizationRate: this.calculateKPIWithTrend(
        currentMetrics.utilizationRate || 0,
        previousMetrics.utilizationRate || 0,
      ),
      realizationRate: this.calculateKPIWithTrend(
        currentMetrics.realizationRate || 0,
        previousMetrics.realizationRate || 0,
      ),
      activeCases: this.calculateKPIWithTrend(
        currentMetrics.activeCases || 0,
        previousMetrics.activeCases || 0,
      ),
      activeClients: this.calculateKPIWithTrend(
        currentMetrics.activeClients || 0,
        previousMetrics.activeClients || 0,
      ),
      billableHours: this.calculateKPIWithTrend(
        currentMetrics.billableHours || 0,
        previousMetrics.billableHours || 0,
      ),
      collectionRate: this.calculateKPIWithTrend(
        currentMetrics.collectionRealization || 0,
        previousMetrics.collectionRealization || 0,
      ),
    };
  }

  /**
   * Get executive charts data
   */
  private async getExecutiveCharts(filters: DashboardFilters) {
    const [revenueByMonth, casesByStatus, topPracticeGroups, attorneyUtilization] = await Promise.all([
      this.getRevenueByMonth(filters),
      this.getCasesByStatus(filters),
      this.getTopPracticeGroups(filters),
      this.getAttorneyUtilization(filters),
    ]);

    return {
      revenueByMonth,
      casesByStatus,
      topPracticeGroups,
      attorneyUtilization,
    };
  }

  /**
   * Get aggregated metrics from snapshots
   */
  private async getAggregatedMetrics(
    startDate: Date,
    endDate: Date,
    organizationId?: string,
  ): Promise<any> {
    const snapshot = await this.snapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.snapshotDate BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      .andWhere("snapshot.snapshotType = 'executive_summary'")
      .andWhere(organizationId ? 'snapshot.organizationId = :organizationId' : '1=1', { organizationId })
      .orderBy('snapshot.snapshotDate', 'DESC')
      .getOne();

    return snapshot?.metrics || {};
  }

  /**
   * Calculate KPI with trend
   */
  private calculateKPIWithTrend(currentValue: number, previousValue: number) {
    const change = currentValue - previousValue;
    const changePercentage = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    const trend = changePercentage > 1 ? 'up' : changePercentage < -1 ? 'down' : 'stable';

    return {
      value: Number(currentValue.toFixed(2)),
      trend,
      change: Number(changePercentage.toFixed(2)),
    };
  }

  /**
   * Get revenue by month
   */
  private async getRevenueByMonth(filters: DashboardFilters) {
    // Mock data - in production, this would query actual financial data
    const months = [];
    const currentDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    while (currentDate <= endDate) {
      const monthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({
        month: monthName,
        revenue: Math.floor(Math.random() * 500000) + 300000,
        target: 400000,
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  /**
   * Get cases by status
   */
  private async getCasesByStatus(filters: DashboardFilters) {
    // Mock data - in production, this would query actual case data
    return [
      { status: 'Active', count: 145 },
      { status: 'Pending', count: 42 },
      { status: 'Closed', count: 89 },
      { status: 'On Hold', count: 18 },
    ];
  }

  /**
   * Get top practice groups
   */
  private async getTopPracticeGroups(filters: DashboardFilters) {
    // Mock data - in production, this would query actual practice group data
    return [
      { name: 'Corporate Law', revenue: 1250000, cases: 45 },
      { name: 'Litigation', revenue: 980000, cases: 67 },
      { name: 'Real Estate', revenue: 750000, cases: 28 },
      { name: 'Intellectual Property', revenue: 620000, cases: 34 },
      { name: 'Employment Law', revenue: 450000, cases: 41 },
    ];
  }

  /**
   * Get attorney utilization
   */
  private async getAttorneyUtilization(filters: DashboardFilters) {
    // Mock data - in production, this would query actual attorney time data
    return [
      { name: 'Partners', utilization: 85, target: 80 },
      { name: 'Senior Associates', utilization: 92, target: 85 },
      { name: 'Associates', utilization: 88, target: 90 },
      { name: 'Of Counsel', utilization: 75, target: 70 },
    ];
  }

  /**
   * Get user's dashboard widgets
   */
  async getUserWidgets(userId: string, dashboardId?: string): Promise<DashboardWidget[]> {
    const query = this.widgetRepository
      .createQueryBuilder('widget')
      .where('widget.userId = :userId', { userId })
      .andWhere('widget.isActive = :isActive', { isActive: true });

    if (dashboardId) {
      query.andWhere('widget.dashboardId = :dashboardId', { dashboardId });
    }

    return query.orderBy('widget.order', 'ASC').getMany();
  }

  /**
   * Create or update widget
   */
  async saveWidget(userId: string, widgetData: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const widget = this.widgetRepository.create({
      ...widgetData,
      userId,
      createdBy: userId,
    });

    return this.widgetRepository.save(widget);
  }

  /**
   * Delete widget
   */
  async deleteWidget(widgetId: string, userId: string): Promise<void> {
    await this.widgetRepository.softDelete({
      id: widgetId,
      userId,
    });
  }

  /**
   * Get latest snapshot by type
   */
  private async getLatestSnapshot(type: string, organizationId?: string): Promise<AnalyticsSnapshot | null> {
    const query = this.snapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.snapshotType = :type', { type });

    if (organizationId) {
      query.andWhere('snapshot.organizationId = :organizationId', { organizationId });
    }

    return query.orderBy('snapshot.snapshotDate', 'DESC').getOne();
  }

  /**
   * Create executive snapshot
   */
  async createExecutiveSnapshot(
    organizationId: string,
    metrics: any,
    period: 'daily' | 'weekly' | 'monthly',
  ): Promise<AnalyticsSnapshot> {
    const snapshot = this.snapshotRepository.create({
      snapshotType: 'executive_summary',
      snapshotDate: new Date().toISOString().split('T')[0],
      period,
      metrics,
      organizationId,
      isFinalized: true,
    });

    return this.snapshotRepository.save(snapshot);
  }
}
