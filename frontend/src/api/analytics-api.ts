/**
 * Analytics API Service
 * Provides analytics tracking, metrics, and dashboard management
 */

import { apiClient } from '../infrastructure/apiClient';

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  widgets: unknown[];
  layout?: unknown;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  timestamp: string;
  count: number;
}

export class AnalyticsApiService {
  private readonly baseUrl = '/analytics';

  // Event Tracking
  async trackEvent(eventData: Partial<AnalyticsEvent>): Promise<AnalyticsEvent> {
    return apiClient.post<AnalyticsEvent>(`${this.baseUrl}/events`, eventData);
  }

  async getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
    return apiClient.get<AnalyticsEvent[]>(`${this.baseUrl}/events/type/${eventType}`);
  }

  async getEventsByEntity(entityType: string, entityId: string): Promise<AnalyticsEvent[]> {
    return apiClient.get<AnalyticsEvent[]>(`${this.baseUrl}/events/entity/${entityType}/${entityId}`);
  }

  async getEventsByUser(userId: string): Promise<AnalyticsEvent[]> {
    return apiClient.get<AnalyticsEvent[]>(`${this.baseUrl}/events/user/${userId}`);
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<AnalyticsEvent[]> {
    return apiClient.get<AnalyticsEvent[]>(`${this.baseUrl}/events?startDate=${startDate}&endDate=${endDate}`);
  }

  // Metrics
  async getCaseMetrics(): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/metrics/case`);
  }

  async getUserActivityMetrics(): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/metrics/user-activity`);
  }

  async getBillingMetrics(): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/metrics/billing`);
  }

  async getTimeSeriesData(
    eventType: string,
    startDate: string,
    endDate: string,
    granularity?: string
  ): Promise<TimeSeriesData[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(granularity && { granularity }),
    });
    return apiClient.get<TimeSeriesData[]>(`${this.baseUrl}/timeseries/${eventType}?${params}`);
  }

  // Dashboards
  async getDashboards(userId: string): Promise<Dashboard[]> {
    return apiClient.get<Dashboard[]>(`${this.baseUrl}/dashboards?userId=${userId}`);
  }

  async getPublicDashboards(): Promise<Dashboard[]> {
    return apiClient.get<Dashboard[]>(`${this.baseUrl}/dashboards/public`);
  }

  async getDashboardById(id: string): Promise<Dashboard> {
    return apiClient.get<Dashboard>(`${this.baseUrl}/dashboards/${id}`);
  }

  async createDashboard(data: Partial<Dashboard>): Promise<Dashboard> {
    return apiClient.post<Dashboard>(`${this.baseUrl}/dashboards`, data);
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<Dashboard> {
    return apiClient.put<Dashboard>(`${this.baseUrl}/dashboards/${id}`, data);
  }

  async deleteDashboard(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/dashboards/${id}`);
  }

  // Reports
  async generateReport(params: { type: string; startDate: string; endDate: string }): Promise<unknown> {
    return apiClient.post(`${this.baseUrl}/reports/generate`, params);
  }
}
