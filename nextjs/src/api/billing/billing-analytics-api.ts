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
  private readonly baseUrl = "/billing-analytics";

  async getOverview(
    startDate: string,
    endDate: string
  ): Promise<BillingAnalytics> {
    return apiClient.get<BillingAnalytics>(
      `${this.baseUrl}/overview?start=${startDate}&end=${endDate}`
    );
  }

  async getByAttorney(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/attorney/${userId}?start=${startDate}&end=${endDate}`
    );
  }

  async getByClient(
    clientId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/client/${clientId}?start=${startDate}&end=${endDate}`
    );
  }

  async getForecast(months: number): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/forecast?months=${months}`);
  }

  async getWIP(): Promise<unknown[]> {
    return apiClient.get("/analytics/billing/wip");
  }

  async getRealization(): Promise<unknown> {
    return apiClient.get("/analytics/billing/realization");
  }
}
