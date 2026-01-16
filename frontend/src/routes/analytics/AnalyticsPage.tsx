/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { AnalyticsProvider } from './AnalyticsProvider';
import { AnalyticsView } from './AnalyticsView';
import type { clientLoader } from './loader';

export function AnalyticsPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Analytics" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load analytics" />}>
        {(resolved) => (
          <AnalyticsProvider
            initialCaseMetrics={resolved.caseMetrics}
            initialFinancialMetrics={resolved.financialMetrics}
            initialPerformanceMetrics={resolved.performanceMetrics}
          >
            <AnalyticsView />
          </AnalyticsProvider>
        )}
      </Await>
    </Suspense>
  );
}
