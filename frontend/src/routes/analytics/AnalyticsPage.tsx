/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Analytics Page Component
 *
 * Handles Suspense/Await wiring for analytics route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/analytics/AnalyticsPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { AnalyticsProvider } from './AnalyticsProvider';
import { AnalyticsView } from './AnalyticsView';

import type { clientLoader } from './loader';

interface AnalyticsPageProps {
  loaderData: ReturnType<typeof clientLoader>;
}

export function AnalyticsPage({ loaderData }: AnalyticsPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Analytics" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load analytics" />}>
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
