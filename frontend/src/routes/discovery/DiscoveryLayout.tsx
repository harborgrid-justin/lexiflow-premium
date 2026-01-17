/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Outlet, useLoaderData } from 'react-router';

import { RouteSkeleton } from '../_shared/RouteSkeletons';

import { DiscoveryProvider } from './DiscoveryContext';
import { clientLoader } from './loader';

export { clientLoader };

/**
 * Discovery Layout Component
 *
 * Provides common DiscoveryProvider and ErrorBoundary for all discovery sub-routes.
 */
export default function DiscoveryLayout() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Discovery" />}>
      <DiscoveryProvider
        initialEvidence={data.evidence}
        initialRequests={data.requests}
        initialProductions={data.productions}
      >
        <div className="h-full w-full">
          <Outlet />
        </div>
      </DiscoveryProvider>
    </Suspense>
  );
}
