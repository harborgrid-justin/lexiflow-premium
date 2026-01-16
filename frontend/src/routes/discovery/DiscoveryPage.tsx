/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Discovery Page Component
 *
 * Handles Suspense/Await wiring for discovery route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/discovery/DiscoveryPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { DiscoveryProvider } from './DiscoveryContext';
import { DiscoveryView } from './DiscoveryView';
import type { clientLoader } from './loader';

interface DiscoveryPageProps {
  loaderData: ReturnType<typeof clientLoader>;
}

export function DiscoveryPage({ loaderData }: DiscoveryPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Discovery" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Discovery" />}>
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
