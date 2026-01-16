/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { analyticsApi } from "@/lib/frontend-api";

export async function clientLoader() {
  const [caseMetricsResult, financialMetricsResult, performanceMetricsResult] =
    await Promise.all([
      analyticsApi.getDashboardMetrics(),
      analyticsApi.getRevenueAnalytics(),
      analyticsApi.getTeamMetrics(),
    ]);

  const caseMetrics = caseMetricsResult.ok ? caseMetricsResult.data : null;
  const financialMetrics = financialMetricsResult.ok
    ? financialMetricsResult.data
    : null;
  const performanceMetrics = performanceMetricsResult.ok
    ? performanceMetricsResult.data
    : null;
  return { caseMetrics, financialMetrics, performanceMetrics };
}
