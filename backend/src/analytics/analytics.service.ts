import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Dashboard } from './entities/dashboard.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async trackEvent(data: any): Promise<AnalyticsEvent> {
    const event = this.analyticsEventRepository.create({
      ...data,
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

  async getCaseMetrics(): Promise<any> {
    const events = await this.analyticsEventRepository.find({
      where: { eventType: 'case_created' },
    });

    const byStatus = events.reduce((acc: Array<{status: string; count: number}>, event: AnalyticsEvent) => {
      const status = event.metadata?.status || 'Unknown';
      const existing = acc.find(item => item.status === status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status, count: 1 });
      }
      return acc;
    }, []);

    return { byStatus };
  }

  async getUserActivityMetrics(): Promise<any[]> {
    const events = await this.analyticsEventRepository.find({
      order: { timestamp: 'DESC' },
      take: 1000,
    });

    const userActivity = events.reduce((acc: Array<{userId: string; count: number}>, event: AnalyticsEvent) => {
      const existing = acc.find(item => item.userId === event.userId);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ userId: event.userId, count: 1 });
      }
      return acc;
    }, []);

    return userActivity;
  }

  async getTimeSeriesData(eventType: string, _granularity: string, startDate: Date, endDate: Date): Promise<any[]> {
    const events = await this.analyticsEventRepository.find({
      where: {
        eventType,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'ASC' },
    });

    const timeSeries = events.map((event: AnalyticsEvent) => ({
      timestamp: event.timestamp,
      count: 1,
    }));

    return timeSeries;
  }

  async getBillingMetrics(): Promise<any> {
    const billingEvents = await this.analyticsEventRepository.find({
      where: { eventType: 'time_logged' },
    });

    const totalHours = billingEvents.reduce((sum: number, event: AnalyticsEvent) => {
      return sum + (event.metadata?.hours || 0);
    }, 0);

    const totalBilled = billingEvents.reduce((sum: number, event: AnalyticsEvent) => {
      return sum + (event.metadata?.amount || 0);
    }, 0);

    return { totalBilled, totalHours };
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

  async createDashboard(data: any): Promise<Dashboard> {
    const dashboard = this.dashboardRepository.create(data);
    const saved = await this.dashboardRepository.save(dashboard);
    const result = Array.isArray(saved) ? saved[0] : saved;
    if (!result) {
      throw new Error('Failed to save dashboard');
    }
    return result;
  }

  async updateDashboard(id: string, data: any): Promise<Dashboard> {
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

  async addWidgetToDashboard(dashboardId: string, widget: any): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    dashboard.widgets.push(widget);
    const saved = await this.dashboardRepository.save(dashboard);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async removeWidgetFromDashboard(dashboardId: string, widgetIndex: number): Promise<Dashboard> {
    const dashboard = await this.getDashboardById(dashboardId);
    dashboard.widgets.splice(widgetIndex, 1);
    const saved = await this.dashboardRepository.save(dashboard);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async generateReport(params: any): Promise<any> {
    const { type, startDate, endDate } = params;

    let data: any;
    if (type === 'activity') {
      data = await this.getEventsByDateRange(startDate, endDate);
    } else if (type === 'billing') {
      data = await this.getBillingMetrics();
    } else {
      data = [];
    }

    return {
      type,
      data,
      generatedAt: new Date(),
    };
  }
}
