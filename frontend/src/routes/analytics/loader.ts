/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { DataService } from "@/services/data/data-service.service";

export async function clientLoader() {
  const [caseMetrics, financialMetrics, performanceMetrics] = await Promise.all(
    [
      DataService.analytics.getCaseMetrics(),
      DataService.analytics.getFinancialMetrics(),
      DataService.analytics.getPerformanceMetrics(),
    ]
  );
  return { caseMetrics, financialMetrics, performanceMetrics };
}
