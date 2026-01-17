/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Outlet, useLoaderData } from 'react-router';

import { RouteSkeleton } from '../_shared/RouteSkeletons';

import { LitigationProvider } from './LitigationContext';
import { litigationLoader } from './loader';

export { litigationLoader as loader };

/**
 * Litigation Layout Component
 *
 * Provides common LitigationProvider and ErrorBoundary for all litigation sub-routes.
 */
export default function LitigationLayout() {
  const data = useLoaderData<typeof litigationLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Litigation" />}>
      <LitigationProvider initialData={data}>
        <div className="h-full w-full">
          <Outlet />
        </div>
      </LitigationProvider>
    </Suspense>
  );
}
