/**
 * Analytics Service
 * Handles dashboard data, KPIs, metrics, and reporting
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { DashboardStatsResponse, MonthlyRevenue, CaseActivity } from '../../types/api';

export interface AnalyticsParams {
  dateFrom?: string;
  dateTo?: string;
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  caseId?: string;
  userId?: string;
  clientId?: string;
}

/**
 * DASHBOARD ANALYTICS
 */

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(params?: AnalyticsParams): Promise<DashboardStatsResponse> {
  try {
    const response = await apiClient.get<DashboardStatsResponse>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * CASE ANALYTICS
 */

/**
 * Get case analytics
 */
export async function getCaseAnalytics(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.CASES, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case metrics by status
 */
export async function getCaseMetricsByStatus(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.CASES}/by-status`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case metrics by type
 */
export async function getCaseMetricsByType(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.CASES}/by-type`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case timeline trends
 */
export async function getCaseTimelineTrends(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.CASES}/timeline`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * BILLING ANALYTICS
 */

/**
 * Get billing analytics
 */
export async function getBillingAnalytics(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.BILLING, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get revenue trends
 */
export async function getRevenueTrends(params?: AnalyticsParams): Promise<MonthlyRevenue[]> {
  try {
    const response = await apiClient.get<MonthlyRevenue[]>(
      `${API_ENDPOINTS.ANALYTICS.BILLING}/revenue`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get realization rates
 */
export async function getRealizationRates(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.BILLING}/realization`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get collection metrics
 */
export async function getCollectionMetrics(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.BILLING}/collections`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get work-in-progress analytics
 */
export async function getWIPAnalytics(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.BILLING}/wip`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * PERFORMANCE ANALYTICS
 */

/**
 * Get user performance metrics
 */
export async function getUserPerformance(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.PERFORMANCE, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get team performance metrics
 */
export async function getTeamPerformance(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.PERFORMANCE}/team`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get utilization rates
 */
export async function getUtilizationRates(params?: AnalyticsParams): Promise<any> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.ANALYTICS.PERFORMANCE}/utilization`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * TRENDS ANALYTICS
 */

/**
 * Get trending data
 */
export async function getTrends(
  metric: string,
  params?: AnalyticsParams
): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.TRENDS, {
      params: { metric, ...params },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get predictive analytics
 */
export async function getPredictiveAnalytics(
  type: string,
  params?: AnalyticsParams
): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.TRENDS}/predictive`, {
      params: { type, ...params },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * REPORTS
 */

/**
 * Get available reports
 */
export async function getAvailableReports(): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.REPORTS);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate custom report
 */
export async function generateReport(config: {
  reportType: string;
  parameters: Record<string, any>;
  format?: 'pdf' | 'excel' | 'csv';
}): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ANALYTICS.REPORTS, config);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Download report
 */
export async function downloadReport(reportId: string): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.ANALYTICS.REPORTS}/${reportId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * CUSTOM QUERIES
 */

/**
 * Execute custom analytics query
 */
export async function executeCustomQuery(query: {
  metrics: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
  dateRange?: { from: string; to: string };
}): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ANALYTICS.CUSTOM_QUERY, query);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * EXPORT
 */

/**
 * Export analytics data
 */
export async function exportAnalytics(config: {
  dataType: string;
  format: 'csv' | 'excel' | 'json';
  params?: AnalyticsParams;
}): Promise<Blob> {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.ANALYTICS.EXPORT,
      config,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * REAL-TIME METRICS
 */

/**
 * Get real-time metrics
 */
export async function getRealTimeMetrics(metric: string): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.DASHBOARD}/realtime`, {
      params: { metric },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  // Dashboard
  getDashboardStats,
  getRealTimeMetrics,
  // Cases
  getCaseAnalytics,
  getCaseMetricsByStatus,
  getCaseMetricsByType,
  getCaseTimelineTrends,
  // Billing
  getBillingAnalytics,
  getRevenueTrends,
  getRealizationRates,
  getCollectionMetrics,
  getWIPAnalytics,
  // Performance
  getUserPerformance,
  getTeamPerformance,
  getUtilizationRates,
  // Trends
  getTrends,
  getPredictiveAnalytics,
  // Reports
  getAvailableReports,
  generateReport,
  downloadReport,
  // Custom
  executeCustomQuery,
  exportAnalytics,
};
