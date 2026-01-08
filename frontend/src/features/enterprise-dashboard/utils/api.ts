import axios from 'axios';
import type {
  ExecutiveDashboardData,
  PracticeGroupMetrics,
  AttorneyPerformanceMetrics,
  ClientProfitabilityMetrics,
  FinancialSummary,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/analytics/enterprise`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface DateRangeParams {
  organizationId: string;
  startDate: string;
  endDate: string;
}

// Executive Dashboard API
export const executiveDashboardApi = {
  getOverview: async (params: DateRangeParams): Promise<ExecutiveDashboardData> => {
    const { data } = await api.get('/executive/overview', { params });
    return data;
  },

  getUserWidgets: async (userId: string, dashboardId?: string) => {
    const { data } = await api.get(`/executive/widgets/${userId}`, {
      params: { dashboardId },
    });
    return data;
  },

  saveWidget: async (userId: string, widgetData: any) => {
    const { data } = await api.post('/executive/widgets', widgetData, {
      params: { userId },
    });
    return data;
  },

  deleteWidget: async (widgetId: string, userId: string) => {
    await api.delete(`/executive/widgets/${widgetId}`, {
      params: { userId },
    });
  },
};

// Firm Analytics API
export const firmAnalyticsApi = {
  getAnalytics: async (params: DateRangeParams) => {
    const { data } = await api.get('/firm', { params });
    return data;
  },

  getPerformance: async (
    params: DateRangeParams & { granularity?: 'daily' | 'weekly' | 'monthly' },
  ) => {
    const { data } = await api.get('/firm/performance', { params });
    return data;
  },

  getBenchmarks: async (organizationId: string) => {
    const { data } = await api.get('/firm/benchmarks', {
      params: { organizationId },
    });
    return data;
  },
};

// Practice Group Analytics API
export const practiceGroupApi = {
  getMetrics: async (params: DateRangeParams): Promise<PracticeGroupMetrics[]> => {
    const { data } = await api.get('/practice-groups', { params });
    return data;
  },

  getComparison: async (params: DateRangeParams) => {
    const { data } = await api.get('/practice-groups/comparison', { params });
    return data;
  },
};

// Attorney Performance API
export const attorneyPerformanceApi = {
  getPerformance: async (
    params: DateRangeParams,
  ): Promise<AttorneyPerformanceMetrics[]> => {
    const { data } = await api.get('/attorneys/performance', { params });
    return data;
  },

  getUtilizationTrend: async (
    attorneyId: string,
    params: Omit<DateRangeParams, 'organizationId'>,
  ) => {
    const { data } = await api.get(`/attorneys/${attorneyId}/utilization`, {
      params,
    });
    return data;
  },

  getLeaderboard: async (
    organizationId: string,
    metric: 'revenue' | 'utilization' | 'realization' = 'revenue',
    limit = 10,
  ) => {
    const { data } = await api.get('/attorneys/leaderboard', {
      params: { organizationId, metric, limit },
    });
    return data;
  },
};

// Client Analytics API
export const clientAnalyticsApi = {
  getProfitability: async (
    params: DateRangeParams,
  ): Promise<ClientProfitabilityMetrics[]> => {
    const { data } = await api.get('/clients/profitability', { params });
    return data;
  },

  getSegmentation: async (organizationId: string) => {
    const { data } = await api.get('/clients/segmentation', {
      params: { organizationId },
    });
    return data;
  },

  getRetention: async (params: DateRangeParams) => {
    const { data } = await api.get('/clients/retention', { params });
    return data;
  },

  getLifetimeValue: async (clientId: string) => {
    const { data } = await api.get(`/clients/${clientId}/lifetime-value`);
    return data;
  },
};

// Financial Reports API
export const financialReportsApi = {
  getSummary: async (params: DateRangeParams): Promise<FinancialSummary> => {
    const { data } = await api.get('/financial/summary', { params });
    return data;
  },

  getCashFlow: async (params: DateRangeParams) => {
    const { data } = await api.get('/financial/cash-flow', { params });
    return data;
  },

  getRevenueBreakdown: async (params: DateRangeParams) => {
    const { data } = await api.get('/financial/revenue-breakdown', { params });
    return data;
  },
};
