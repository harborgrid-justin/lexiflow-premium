/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Evidence Management Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { EvidenceProvider } from './EvidenceProvider';
import { EvidenceView } from './EvidenceView';
import type { EvidenceLoaderData } from './loader';

export function EvidencePage() {
  const initialData = useLoaderData() as EvidenceLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Evidence" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Evidence" />}>
        {(resolved) => (
          <EvidenceProvider initialData={resolved}>
            <EvidenceView />
          </EvidenceProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default EvidencePage;
