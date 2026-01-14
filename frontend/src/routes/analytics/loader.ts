import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

export async function clientLoader() {
  const [caseMetrics, financialMetrics, performanceMetrics] = await Promise.all(
    [
      DataService.analytics.getCaseMetrics(),
      DataService.analytics.getFinancialMetrics(),
      DataService.analytics.getPerformanceMetrics(),
    ]
  );
  return defer({ caseMetrics, financialMetrics, performanceMetrics });
}
