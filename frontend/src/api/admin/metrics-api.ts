/**
 * Metrics API Service
 * System metrics and health monitoring
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

export interface SystemMetrics {
  timestamp: string;
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
  application: {
    activeUsers: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
    cacheHitRate: number;
  };
  queues?: {
    name: string;
    pending: number;
    active: number;
    completed: number;
    failed: number;
  }[];
}

export class MetricsApiService {
  private readonly baseUrl = "/metrics";

  async getCurrent(): Promise<SystemMetrics> {
    return apiClient.get<SystemMetrics>(`${this.baseUrl}/system`);
  }

  getHistory(
    _startDate: string,
    _endDate: string,
    _interval: "1m" | "5m" | "15m" | "1h" | "1d" = "5m",
  ): Promise<SystemMetrics[]> {
    // History endpoint not yet implemented in backend
    console.warn(
      "Metrics history not implemented in backend - returning empty set",
    );
    return Promise.resolve([]);
    // return apiClient.get<SystemMetrics[]>(`${this.baseUrl}/history?start=${startDate}&end=${endDate}&interval=${interval}`);
  }

  async getAlerts(): Promise<unknown[]> {
    return apiClient.get<unknown[]>(`${this.baseUrl}/alerts`);
  }
}
