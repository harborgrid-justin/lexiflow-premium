import React, { createContext, useContext, useMemo } from 'react';

interface AnalyticsContextValue {
  caseMetrics: unknown;
  financialMetrics: unknown;
  performanceMetrics: unknown;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children, initialCaseMetrics, initialFinancialMetrics, initialPerformanceMetrics }: {
  children: React.ReactNode;
  initialCaseMetrics: unknown;
  initialFinancialMetrics: unknown;
  initialPerformanceMetrics: unknown;
}) {
  const value = useMemo<AnalyticsContextValue>(() => ({
    caseMetrics: initialCaseMetrics,
    financialMetrics: initialFinancialMetrics,
    performanceMetrics: initialPerformanceMetrics
  }), [initialCaseMetrics, initialFinancialMetrics, initialPerformanceMetrics]);

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return context;
}
