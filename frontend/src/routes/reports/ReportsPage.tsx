/**
 * Reports & Analytics Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import type { ReportsLoaderData } from './loader';
import { ReportsProvider } from './ReportsProvider';
import { ReportsView } from './ReportsView';

export function ReportsPage() {
  const initialData = useLoaderData() as ReportsLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Reports" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Reports" />}>
        {(resolved) => (
          <ReportsProvider initialData={resolved}>
            <ReportsView />
          </ReportsProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default ReportsPage;
