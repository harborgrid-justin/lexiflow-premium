/**
 * Billing Analytics API Service
 * Billing and revenue analytics
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface BillingAnalytics {
  period: { start: string; end: string };
  totalRevenue: number;
  collectedRevenue: number;
  outstandingAR: number;
  writeOffs: number;
  realization: {
    rate: number;
    billed: number;
    collected: number;
  };
  byAttorney: {
    userId: string;
    userName: string;
    hoursBilled: number;
    revenue: number;
    realizationRate: number;
  }[];
  byClient: {
    clientId: string;
    clientName: string;
    revenue: number;
    outstanding: number;
  }[];
  byPracticeArea: {
    area: string;
    revenue: number;
    hours: number;
  }[];
  trend: {
    month: string;
    revenue: number;
    collected: number;
  }[];
}

export class BillingAnalyticsApiService {
  private readonly baseUrl = "/billing/analytics";

  async getOverview(
    startDate: string,
    endDate: string
  ): Promise<BillingAnalytics> {
    // The backend returns aggregated metrics from the /metrics endpoint
    const _result = await apiClient.get<{
      wip: unknown;
      realization: unknown;
      operatingSummary: unknown;
      arAging: unknown;
    }>(`${this.baseUrl}/metrics?start=${startDate}&end=${endDate}`);
    // Return a placeholder BillingAnalytics structure
    return {
      period: { start: startDate, end: endDate },
      totalRevenue: 0,
      collectedRevenue: 0,
      outstandingAR: 0,
      writeOffs: 0,
      realization: { rate: 0, billed: 0, collected: 0 },
      byAttorney: [],
      byClient: [],
      byPracticeArea: [],
      trend: [],
    };
  }

  async getByAttorney(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/realization?start=${startDate}&end=${endDate}`
    );
  }

  async getByClient(
    clientId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/operating-summary?start=${startDate}&end=${endDate}`
    );
  }

  async getForecast(months: number): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/ar-aging?months=${months}`);
  }
}
