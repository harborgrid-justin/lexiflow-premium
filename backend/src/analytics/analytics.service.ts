import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { AnalyticsGenerateReportDto, GenerateReportResponseDto, ReportFormat } from './dto/generate-report.dto';
import {
  AnalyticsCaseMetricsDto,
  UserActivityMetricsDto,
  AnalyticsBillingMetricsDto,
  TimeSeriesDataPointDto,
} from './dto/metrics-response.dto';

interface UpdateDashboardData {
  name?: string;
  description?: string;
  widgets?: Widget[];
  isPublic?: boolean;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

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
    const result = Array.isArray(saved) ? saved[0] : saved;
    if (!result) {
      throw new Error('Failed to save analytics event');
    }
    return result;
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
    const events = await this.analyticsEventRepository.find({
      where: { eventType: 'case_created' },
    });

    const casesByStatus = events.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
      const metadata = event.metadata as Record<string, unknown> | undefined;
      const status = (metadata?.status as string) || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCases = events.length;
    const activeCases = casesByStatus['active'] || 0;
    const closedCases = casesByStatus['closed'] || 0;

    return {
      totalCases,
      activeCases,
      closedCases,
      casesByStatus,
    };
  }

  async getUserActivityMetrics(): Promise<UserActivityMetricsDto> {
    const events = await this.analyticsEventRepository.find({
      order: { timestamp: 'DESC' },
      take: 1000,
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
  }

  async getTimeSeriesData(eventType: string, _granularity: string, startDate: Date, endDate: Date): Promise<TimeSeriesDataPointDto[]> {
    const events = await this.analyticsEventRepository.find({
      where: {
        eventType,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'ASC' },
    });

    const timeSeries = events.map((event: AnalyticsEvent) => ({
      timestamp: event.timestamp.toISOString(),
      value: 1,
      label: event.eventType,
      metadata: event.metadata || undefined,
    }));

    return timeSeries;
  }

  async getBillingMetrics(): Promise<AnalyticsBillingMetricsDto> {
    const billingEvents = await this.analyticsEventRepository.find({
      where: { eventType: 'time_logged' },
    });

    const totalBilled = billingEvents.reduce((sum: number, event: AnalyticsEvent) => {
      const metadata = event.metadata as Record<string, unknown> | undefined;
      return sum + ((metadata?.amount as number) || 0);
    }, 0);

    const invoiceEvents = await this.analyticsEventRepository.find({
      where: { eventType: 'invoice_created' },
    });

    let paidInvoices = 0;
    let pendingInvoices = 0;
    let outstandingBalance = 0;

    invoiceEvents.forEach((event: AnalyticsEvent) => {
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

    return {
      totalRevenue: totalBilled,
      outstandingBalance,
      paidInvoices,
      pendingInvoices,
    };
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
    const result = Array.isArray(saved) ? saved[0] : saved;
    if (!result) {
      throw new Error('Failed to save dashboard');
    }
    return result;
  }

  async updateDashboard(id: string, data: UpdateDashboardData): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(id);
    Object.assign(dashboard, data);
    const saved = await this.dashboardRepository.save(dashboard);
    return Array.isArray(saved) ? saved[0] : saved;
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
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async removeWidgetFromDashboard(dashboardId: string, widgetIndex: number): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    dashboard.widgets.splice(widgetIndex, 1);
    const saved = await this.dashboardRepository.save(dashboard);
    return Array.isArray(saved) ? saved[0] : saved;
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
