// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - ANALYTICS DOMAIN
// ================================================================================

/**
 * Analytics Provider
 *
 * Manages analytics and reporting data state for business intelligence.
 * Handles case metrics, performance tracking, custom reports, and data exports.
 *
 * @module providers/data/analyticsprovider
 */

import { AnalyticsActionsContext, AnalyticsStateContext } from '@/lib/analytics/contexts';
import type { AnalyticsActionsValue, AnalyticsProviderProps, AnalyticsStateValue } from '@/lib/analytics/types';
import { DataService } from '@/services/data/dataService';
import type { CaseMetrics, UserActivityMetrics } from '@/types/analytics';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface CustomReport {
  id: string;
  name: string;
  type: string;
  filters: Record<string, unknown>;
  createdAt: string;
  data?: unknown;
}

export function AnalyticsProvider({ children, caseId }: AnalyticsProviderProps) {
  const [caseMetrics, setCaseMetrics] = useState<CaseMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<UserActivityMetrics | null>(null);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [filterByCaseId, setFilterByCaseId] = useState<string | null>(caseId || null);

  const loadCaseMetrics = useCallback(async (caseId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await (DataService.analytics as unknown as { getCaseMetrics: (caseId?: string) => Promise<CaseMetrics> }).getCaseMetrics(caseId);
      setCaseMetrics(metrics);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load case metrics'));
      console.error('[AnalyticsProvider] Failed to load case metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPerformanceMetrics = useCallback(async (filters?: { startDate?: string; endDate?: string; userId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await (DataService.analytics as unknown as { getPerformanceMetrics: (filters?: unknown) => Promise<UserActivityMetrics> }).getPerformanceMetrics(filters);
      setPerformanceMetrics(metrics);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load performance metrics'));
      console.error('[AnalyticsProvider] Failed to load performance metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (
    reportType: string,
    filters: Record<string, unknown>
  ): Promise<CustomReport> => {
    setIsLoading(true);
    setError(null);
    try {
      const reportData = await (DataService.analytics as unknown as { generateReport: (type: string, filters: Record<string, unknown>) => Promise<unknown> }).generateReport(reportType, filters);
      const report: CustomReport = {
        id: `report_${Date.now()}`,
        name: `${reportType} Report`,
        type: reportType,
        filters,
        createdAt: new Date().toISOString(),
        data: reportData,
      };
      setCustomReports(prev => [report, ...prev]);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to generate ${reportType} report`));
      console.error('[AnalyticsProvider] Failed to generate report:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (
    reportId: string,
    format: 'csv' | 'pdf' | 'xlsx'
  ): Promise<Blob> => {
    setIsLoading(true);
    setError(null);
    try {
      const report = customReports.find(r => r.id === reportId);
      if (!report) {
        throw new Error(`Report ${reportId} not found`);
      }

      const blob = await (DataService.analytics as unknown as { exportReport: (data: unknown, format: string) => Promise<Blob> }).exportReport(report.data, format);
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to export report ${reportId}`));
      console.error('[AnalyticsProvider] Failed to export report:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [customReports]);

  const deleteReport = useCallback((reportId: string) => {
    setCustomReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  const refreshMetrics = useCallback(async () => {
    await Promise.all([
      loadCaseMetrics(filterByCaseId || undefined),
      loadPerformanceMetrics(),
    ]);
  }, [loadCaseMetrics, loadPerformanceMetrics, filterByCaseId]);

  const filterByCase = useCallback((caseId: string | null) => {
    setFilterByCaseId(caseId);
    if (caseId) {
      loadCaseMetrics(caseId);
    } else {
      loadCaseMetrics();
    }
  }, [loadCaseMetrics]);

  // Load top-level analytics comparison
  const compareMetrics = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<{ current: UserActivityMetrics; previous: UserActivityMetrics }> => {
    setIsLoading(true);
    setError(null);
    try {
      const [current, previous] = await Promise.all([
        (DataService.analytics as unknown as { getPerformanceMetrics: (filters: unknown) => Promise<UserActivityMetrics> }).getPerformanceMetrics({ startDate, endDate }),
        (DataService.analytics as unknown as { getPerformanceMetrics: (filters: unknown) => Promise<UserActivityMetrics> }).getPerformanceMetrics({
          startDate: new Date(new Date(startDate).getTime() - (new Date(endDate).getTime() - new Date(startDate).getTime())).toISOString(),
          endDate: startDate
        }),
      ]);
      return { current, previous };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to compare metrics'));
      console.error('[AnalyticsProvider] Failed to compare metrics:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaseMetrics(caseId);
    loadPerformanceMetrics();
  }, [caseId, loadCaseMetrics, loadPerformanceMetrics]);

  const stateValue = useMemo<AnalyticsStateValue>(() => ({
    caseMetrics,
    performanceMetrics,
    customReports,
    isLoading,
    error,
    lastRefresh,
    filterByCaseId,
  }), [caseMetrics, performanceMetrics, customReports, isLoading, error, lastRefresh, filterByCaseId]);

  const actionsValue = useMemo<AnalyticsActionsValue>(() => ({
    loadCaseMetrics,
    loadPerformanceMetrics,
    loadCustomReport: async (reportId: string) => {
      const report = customReports.find(r => r.id === reportId);
      return report?.data || null;
    },
    generateReport,
    exportReport,
    deleteReport,
    refreshAnalytics: refreshMetrics,
    filterByCase,
    compareMetrics,
  }), [
    loadCaseMetrics,
    loadPerformanceMetrics,
    customReports,
    generateReport,
    exportReport,
    deleteReport,
    refreshMetrics,
    filterByCase,
    compareMetrics
  ]);

  return (
    <AnalyticsStateContext.Provider value={stateValue}>
      <AnalyticsActionsContext.Provider value={actionsValue}>
        {children}
      </AnalyticsActionsContext.Provider>
    </AnalyticsStateContext.Provider>
  );
}

export function useAnalyticsState(): AnalyticsStateValue {
  const context = useContext(AnalyticsStateContext);
  if (!context) {
    throw new Error('useAnalyticsState must be used within AnalyticsProvider');
  }
  return context;
}

export function useAnalyticsActions(): AnalyticsActionsValue {
  const context = useContext(AnalyticsActionsContext);
  if (!context) {
    throw new Error('useAnalyticsActions must be used within AnalyticsProvider');
  }
  return context;
}

export function useAnalytics() {
  return {
    state: useAnalyticsState(),
    actions: useAnalyticsActions(),
  };
}
