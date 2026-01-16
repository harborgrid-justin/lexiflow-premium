/**
 * Billing Analytics API Service
 * Billing and revenue analytics
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

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
    return apiClient.get<BillingAnalytics>(
      `${this.baseUrl}/metrics?start=${startDate}&end=${endDate}`
    );
  }

  async getByAttorney(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/realization?userId=${userId}&start=${startDate}&end=${endDate}`
    );
  }

  async getByClient(
    clientId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/operating-summary?clientId=${clientId}&start=${startDate}&end=${endDate}`
    );
  }

  async getForecast(months: number): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/ar-aging?months=${months}`);
  }
}
