/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Reports Page Component
 *
 * Handles Suspense/Await wiring for reports route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/reports/ReportsPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { ReportsCenter } from './components/ReportsCenter';
import { ReportsProvider } from './components/ReportsContext';
import type { ReportsLoaderData } from './loader';

interface ReportsPageProps {
  loaderData: ReportsLoaderData;
}

export function ReportsPage({ loaderData }: ReportsPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Reports" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Reports" />}>
        {(resolved) => (
          <ReportsProvider initialData={resolved}>
            <ReportsCenter />
          </ReportsProvider>
        )}
      </Await>
    </Suspense>
  );
}
