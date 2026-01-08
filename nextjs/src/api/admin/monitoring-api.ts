/**
 * Monitoring API Service
 * System health monitoring and metrics
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import { ApiServiceSpec } from "@/types";

export interface AdminSystemHealth {
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  services: {
    name: string;
    status: "up" | "down" | "degraded";
    responseTime?: number;
    lastCheck: string;
  }[];
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export interface AdminPerformanceMetric {
  id: string;
  metricName: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export class MonitoringApiService {
  private readonly baseUrl = "/monitoring";

  async getHealth(): Promise<AdminSystemHealth> {
    return apiClient.get<AdminSystemHealth>(`${this.baseUrl}/health`);
  }

  async getMetrics(filters?: {
    metricName?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<AdminPerformanceMetric[]> {
    const params = new URLSearchParams();
    if (filters?.metricName) params.append("metricName", filters.metricName);
    if (filters?.startTime) params.append("startTime", filters.startTime);
    if (filters?.endTime) params.append("endTime", filters.endTime);
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/metrics?${queryString}`
      : `${this.baseUrl}/metrics`;
    return apiClient.get<AdminPerformanceMetric[]>(url);
  }

  async ping(): Promise<{ status: string; timestamp: string }> {
    return apiClient.get(`${this.baseUrl}/ping`);
  }

  async getApiSpecs(): Promise<ApiServiceSpec[]> {
    return apiClient.get<ApiServiceSpec[]>(`${this.baseUrl}/api-specs`);
  }
}
