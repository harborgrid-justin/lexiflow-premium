/**
 * React Query Hooks for Analytics API
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import * as analyticsService from '../../services/api/analyticsService';

// Query Keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  cases: (filters?: any) => [...analyticsKeys.all, 'cases', filters] as const,
  billing: (filters?: any) => [...analyticsKeys.all, 'billing', filters] as const,
  performance: (filters?: any) => [...analyticsKeys.all, 'performance', filters] as const,
  trends: (filters?: any) => [...analyticsKeys.all, 'trends', filters] as const,
};

/**
 * Hook to get dashboard analytics
 */
export function useDashboardAnalytics(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboardAnalytics(),
    ...options,
  });
}

/**
 * Hook to get case analytics
 */
export function useCaseAnalytics(
  filters?: { dateFrom?: string; dateTo?: string; caseId?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.cases(filters),
    queryFn: () => analyticsService.getCaseAnalytics(filters),
    ...options,
  });
}

/**
 * Hook to get billing analytics
 */
export function useBillingAnalytics(
  filters?: { dateFrom?: string; dateTo?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.billing(filters),
    queryFn: () => analyticsService.getBillingAnalytics(filters),
    ...options,
  });
}

/**
 * Hook to get performance analytics
 */
export function usePerformanceAnalytics(
  filters?: { dateFrom?: string; dateTo?: string; userId?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.performance(filters),
    queryFn: () => analyticsService.getPerformanceAnalytics(filters),
    ...options,
  });
}

/**
 * Hook to get trend analytics
 */
export function useTrendAnalytics(
  filters?: { metric: string; period: string; dateFrom?: string; dateTo?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.trends(filters),
    queryFn: () => analyticsService.getTrendAnalytics(filters),
    enabled: !!filters?.metric,
    ...options,
  });
}

export default {
  useDashboardAnalytics,
  useCaseAnalytics,
  useBillingAnalytics,
  usePerformanceAnalytics,
  useTrendAnalytics,
};
