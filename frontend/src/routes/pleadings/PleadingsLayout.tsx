/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Outlet, useLoaderData } from 'react-router';
import { RouteSkeleton } from '../_shared/RouteSkeletons';
import { PleadingsProvider } from './PleadingsContext';
import { pleadingsLoader } from './loader';

export { pleadingsLoader as loader };

/**
 * Pleadings Layout Component
 *
 * Provides common PleadingsProvider and ErrorBoundary for all pleadings sub-routes.
 */
export default function PleadingsLayout() {
  const data = useLoaderData<typeof pleadingsLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Pleadings" />}>
      <PleadingsProvider initialData={data}>
        <div className="h-full w-full">
          <Outlet />
        </div>
      </PleadingsProvider>
    </Suspense>
  );
}
