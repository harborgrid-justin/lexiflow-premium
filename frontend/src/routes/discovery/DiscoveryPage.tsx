/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { DiscoveryProvider } from './DiscoveryProvider';
import { DiscoveryView } from './DiscoveryView';
import type { clientLoader } from './loader';

export function DiscoveryPageContent() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Discovery" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load discovery" />}>
        {(resolved) => (
          <DiscoveryProvider
            initialEvidence={resolved.evidence}
            initialRequests={resolved.requests}
            initialProductions={resolved.productions}
          >
            <DiscoveryView />
          </DiscoveryProvider>
        )}
      </Await>
    </Suspense>
  );
}
