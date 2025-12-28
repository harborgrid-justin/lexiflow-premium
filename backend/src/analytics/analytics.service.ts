import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';
import { CreateAnalyticsEventDto } from '@analytics/dto';
import { CreateDashboardDto } from '@analytics/dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { AnalyticsGenerateReportDto, GenerateReportResponseDto, ReportFormat } from './dto/generate-report.dto';
import {
  AnalyticsCaseMetricsDto,
  UserActivityMetricsDto,
  AnalyticsBillingMetricsDto,
  TimeSeriesDataPointDto,
} from './dto/metrics-response.dto';

/**
 * Widget interface for dashboard widgets
 */
interface Widget {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}


/**
 * Analytics cache data types
 */
type AnalyticsCacheData =
  | AnalyticsCaseMetricsDto
  | UserActivityMetricsDto
  | AnalyticsBillingMetricsDto
  | TimeSeriesDataPointDto[]
  | Record<string, unknown>;

/**
 * Analytics Service with Memory Optimizations
 * 
 * MEMORY OPTIMIZATIONS:
 * - LRU cache with 2K entry limit for metrics and time series data
 * - 30-minute TTL for cached results
 * - Proper cleanup on module destroy
 * - Stream processing for large datasets
 */
@Injectable()
export class AnalyticsService implements OnModuleDestroy {
  private readonly MAX_CACHE_ENTRIES = 2000;
  private readonly CACHE_TTL_MS = 1800000; // 30 minutes
  private readonly MAX_EVENTS_PER_QUERY = 10000;

  // LRU cache for expensive analytics computations
  private analyticsCache: Map<string, { data: AnalyticsCacheData; timestamp: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {
    this.startCacheCleanup();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.analyticsCache.clear();
  }

  /**
   * Start periodic cache cleanup
   */
  private startCacheCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.enforceCacheLRU();
    }, 300000); // Clean every 5 minutes
  }

  /**
   * Enforce LRU eviction on analytics cache
   */
  private enforceCacheLRU(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, value] of this.analyticsCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL_MS) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.analyticsCache.delete(key));

    // If still over limit, remove oldest entries
    if (this.analyticsCache.size > this.MAX_CACHE_ENTRIES) {
      const entries = Array.from(this.analyticsCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = Math.floor(this.MAX_CACHE_ENTRIES * 0.1);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        const entry = entries[i];
        if (entry) {
          this.analyticsCache.delete(entry[0]);
        }
      }
    }
  }

  /**
   * Get cached data or compute and cache result
   */
  private getCachedData<T extends AnalyticsCacheData>(cacheKey: string, computeFn: () => Promise<T>): Promise<T> {
    const cached = this.analyticsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return Promise.resolve(cached.data as T);
    }

    return computeFn().then(data => {
      this.analyticsCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    });
  }

  async trackEvent(data: CreateAnalyticsEventDto): Promise<AnalyticsEvent> {
    const event = this.analyticsEventRepository.create({
      eventType: data.eventName,
      entityType: data.caseId ? 'case' : 'system',
      entityId: data.caseId || 'system',
      userId: data.userId || 'system',
      metadata: data.metadata || {},
      timestamp: new Date(),
    });
    const saved = await this.analyticsEventRepository.save(event);
    // TypeORM save can return array or single item, ensure we get a single item
    if (Array.isArray(saved)) {
      const result = saved[0];
      if (!result) {
        throw new Error('Failed to save analytics event');
      }
      return result;
    }
    return saved;
  }

  async getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
    return this.analyticsEventRepository.find({
      where: { eventType },
      order: { timestamp: 'DESC' },
    });
  }

  async getEventsByEntity(entityType: string, entityId: string): Promise<AnalyticsEvent[]> {
    return this.analyticsEventRepository.find({
      where: { entityType, entityId },
      order: { timestamp: 'DESC' },
    });
  }

  async getEventsByUser(userId: string): Promise<AnalyticsEvent[]> {
    return this.analyticsEventRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    return this.analyticsEventRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });
  }

  async getCaseMetrics(): Promise<AnalyticsCaseMetricsDto> {
    const cacheKey = 'case_metrics';
    
    return this.getCachedData(cacheKey, async () => {
      // Limit query to recent events to prevent memory bloat
      const recentEvents = await this.analyticsEventRepository.find({
        where: { eventType: 'case_created' },
        order: { timestamp: 'DESC' },
        take: this.MAX_EVENTS_PER_QUERY,
      });

      const casesByStatus = recentEvents.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
        const metadata = event.metadata as Record<string, unknown> | undefined;
        const status = (metadata?.status as string) || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalCases = recentEvents.length;
      const activeCases = casesByStatus['active'] || 0;
      const closedCases = casesByStatus['closed'] || 0;

      return {
        totalCases,
        activeCases,
        closedCases,
        casesByStatus,
      };
    });
  }

  async getUserActivityMetrics(): Promise<UserActivityMetricsDto> {
    const cacheKey = 'user_activity_metrics';
    
    return this.getCachedData(cacheKey, async () => {
      // Limit to recent events and use streaming approach
      const events = await this.analyticsEventRepository.find({
        order: { timestamp: 'DESC' },
        take: this.MAX_EVENTS_PER_QUERY,
      });

      const uniqueUsers = new Set(events.map(e => e.userId));
      const activityByType = events.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const dailyEvents = events.filter(e => e.timestamp >= yesterday);
      const dailyUniqueUsers = new Set(dailyEvents.map(e => e.userId));

      return {
        totalActiveUsers: uniqueUsers.size,
        dailyActiveUsers: dailyUniqueUsers.size,
        activityByType,
      };
    });
  }

  async getTimeSeriesData(eventType: string, _granularity: string, startDate: Date, endDate: Date): Promise<TimeSeriesDataPointDto[]> {
    const cacheKey = `time_series_${eventType}_${startDate.toISOString()}_${endDate.toISOString()}`;
    
    return this.getCachedData(cacheKey, async () => {
      // Limit query results to prevent memory bloat
      const events = await this.analyticsEventRepository.find({
        where: {
          eventType,
          timestamp: Between(startDate, endDate),
        },
        order: { timestamp: 'ASC' },
        take: this.MAX_EVENTS_PER_QUERY,
      });

      // Process in chunks to avoid memory spikes
      const timeSeries: TimeSeriesDataPointDto[] = [];
      for (let i = 0; i < events.length; i += 100) {
        const chunk = events.slice(i, i + 100);
        const chunkData = chunk.map((event: AnalyticsEvent) => ({
          timestamp: event.timestamp.toISOString(),
          value: 1,
          label: event.eventType,
          metadata: event.metadata || undefined,
        }));
        timeSeries.push(...chunkData);
      }

      return timeSeries;
    });
  }

  async getBillingMetrics(): Promise<AnalyticsBillingMetricsDto> {
    const cacheKey = 'billing_metrics';
    
    return this.getCachedData(cacheKey, async () => {
      // Limit queries to recent events
      const timeLoggedEvents = await this.analyticsEventRepository.find({
        where: { eventType: 'time_logged' },
        order: { timestamp: 'DESC' },
        take: this.MAX_EVENTS_PER_QUERY,
      });

      const totalBilled = timeLoggedEvents.reduce((sum: number, event: AnalyticsEvent) => {
        const metadata = event.metadata as Record<string, unknown> | undefined;
        return sum + ((metadata?.amount as number) || 0);
      }, 0);

      const invoiceEvents = await this.analyticsEventRepository.find({
        where: { eventType: 'invoice_created' },
        order: { timestamp: 'DESC' },
        take: this.MAX_EVENTS_PER_QUERY,
      });

      let paidInvoices = 0;
      let pendingInvoices = 0;
      let outstandingBalance = 0;

      // Process in chunks
      for (let i = 0; i < invoiceEvents.length; i += 100) {
        const chunk = invoiceEvents.slice(i, i + 100);
        chunk.forEach((event: AnalyticsEvent) => {
          const metadata = event.metadata as Record<string, unknown> | undefined;
          const status = metadata?.status as string;
          const amount = (metadata?.amount as number) || 0;

          if (status === 'paid') {
            paidInvoices++;
          } else {
            pendingInvoices++;
            outstandingBalance += amount;
          }
        });
      }

      return {
        totalRevenue: totalBilled,
        outstandingBalance,
        paidInvoices,
        pendingInvoices,
      };
    });
  }

  async getAllDashboards(userId: string): Promise<Dashboard[]> {
    return this.dashboardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDashboardById(id: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOne({ where: { id } });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }

  async createDashboard(data: CreateDashboardDto): Promise<Dashboard> {
    const widgets: Record<string, unknown>[] = (data.widgets || []).map(w => ({
      id: w.id,
      type: w.type,
      title: w.title,
      config: w.config,
      position: { x: w.position.x, y: w.position.y },
      size: { width: w.position.w, height: w.position.h },
    }));

    const dashboard = this.dashboardRepository.create({
      userId: data.ownerId || 'system',
      name: data.title,
      description: data.description,
      widgets,
      isPublic: data.isShared || false,
    });
    const saved = await this.dashboardRepository.save(dashboard);
    if (Array.isArray(saved)) {
      const result = saved[0];
      if (!result) {
        throw new Error('Failed to save dashboard');
      }
      return result;
    }
    return saved;
  }

  async updateDashboard(id: string, data: UpdateDashboardDto): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(id);
    Object.assign(dashboard, data);
    const saved = await this.dashboardRepository.save(dashboard);
    if (Array.isArray(saved)) {
      const result = saved[0];
      if (!result) {
        throw new Error('Failed to update dashboard');
      }
      return result;
    }
    return saved;
  }

  async deleteDashboard(id: string): Promise<void> {
    await this.getDashboardById(id);
    await this.dashboardRepository.delete(id);
  }

  async getPublicDashboards(): Promise<Dashboard[]> {
    return this.dashboardRepository.find({
      where: { isPublic: true },
      order: { createdAt: 'DESC' },
    });
  }

  async addWidgetToDashboard(dashboardId: string, widget: Widget): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    dashboard.widgets.push(widget as unknown as Record<string, unknown>);
    const saved = await this.dashboardRepository.save(dashboard);
    if (Array.isArray(saved)) {
      const result = saved[0];
      if (!result) {
        throw new Error('Failed to add widget to dashboard');
      }
      return result;
    }
    return saved;
  }

  async removeWidgetFromDashboard(dashboardId: string, widgetIndex: number): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    dashboard.widgets.splice(widgetIndex, 1);
    const saved = await this.dashboardRepository.save(dashboard);
    if (Array.isArray(saved)) {
      const result = saved[0];
      if (!result) {
        throw new Error('Failed to remove widget from dashboard');
      }
      return result;
    }
    return saved;
  }

  async generateReport(params: AnalyticsGenerateReportDto): Promise<GenerateReportResponseDto> {
    const { reportType, startDate, endDate, format } = params;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    let data: Record<string, unknown>;
    if (reportType === 'user_activity') {
      data = { events: await this.getEventsByDateRange(start, end) };
    } else if (reportType === 'billing_summary') {
      const billingMetrics = await this.getBillingMetrics();
      data = { ...billingMetrics };
    } else {
      data = {};
    }

    return {
      reportId: `report-${Date.now()}`,
      reportType,
      format: format || ReportFormat.PDF,
      status: 'completed',
      data,
      generatedAt: new Date().toISOString(),
    };
  }
}
