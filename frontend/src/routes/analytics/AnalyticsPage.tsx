import { useLoaderData } from 'react-router';
import { AnalyticsProvider } from './AnalyticsProvider';
import { AnalyticsView } from './AnalyticsView';
import type { clientLoader } from './loader';

export function AnalyticsPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <AnalyticsProvider
      initialCaseMetrics={data.caseMetrics}
      initialFinancialMetrics={data.financialMetrics}
      initialPerformanceMetrics={data.performanceMetrics}
    >
      <AnalyticsView />
    </AnalyticsProvider>
  );
}
