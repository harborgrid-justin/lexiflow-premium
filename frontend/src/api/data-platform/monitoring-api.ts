/**
 * @module services/api/data-platform/monitoring-api
 * @description System monitoring API service
 * Handles performance metrics, alerts, and health monitoring
 * 
 * @responsibility Monitor system health and performance
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  id: string;
  metricName: string;
  value: number;
  unit?: string;
  tags?: Record<string, unknown>;
  timestamp: string;
}

/**
 * System alert interface
 */
export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  createdAt: string;
}

/**
 * System health interface
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded';
  cpuUsage: number;
  memoryUsage: number;
  activeAlerts: number;
  timestamp: string;
}

/**
 * Monitoring API service class
 * Provides methods for system monitoring and alerting
 */
export class MonitoringApiService {
  /**
   * Get current system health status
   */
  async getHealth(): Promise<SystemHealth> {
    try {
      return await apiClient.get<SystemHealth>('/monitoring/health');
    } catch (error) {
      return {
        status: 'degraded',
        cpuUsage: 0,
        memoryUsage: 0,
        activeAlerts: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get performance metrics
   */
  async getMetrics(filters?: {
    metricName?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): Promise<{ data: PerformanceMetric[] }> {
    try {
      return await apiClient.get('/monitoring/metrics', filters);
    } catch (error) {
      return { data: [] };
    }
  }

  /**
   * Record a performance metric
   */
  async recordMetric(data: {
    metricName: string;
    value: number;
    unit?: string;
    tags?: Record<string, unknown>;
  }): Promise<PerformanceMetric> {
    return await apiClient.post<PerformanceMetric>('/monitoring/metrics', data);
  }

  /**
   * Get system alerts
   */
  async getAlerts(filters?: Record<string, unknown>): Promise<PaginatedResponse<SystemAlert>> {
    try {
      return await apiClient.get<PaginatedResponse<SystemAlert>>('/monitoring/alerts', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(id: string, userId: string): Promise<SystemAlert> {
    return await apiClient.post<SystemAlert>(`/monitoring/alerts/${id}/acknowledge`, { userId });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(id: string): Promise<SystemAlert> {
    return await apiClient.post<SystemAlert>(`/monitoring/alerts/${id}/resolve`, {});
  }
}
