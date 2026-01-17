/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Outlet, useLoaderData } from 'react-router';

import { RouteSkeleton } from '../_shared/RouteSkeletons';

import { EvidenceProvider } from './EvidenceContext';
import { evidenceLoader } from './loader';

export { evidenceLoader as loader };

/**
 * Evidence Layout Component
 *
 * Provides common EvidenceProvider and ErrorBoundary for all evidence sub-routes.
 */
export default function EvidenceLayout() {
  const data = useLoaderData<typeof evidenceLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Evidence" />}>
      <EvidenceProvider initialData={data}>
        <div className="h-full w-full">
          <Outlet />
        </div>
      </EvidenceProvider>
    </Suspense>
  );
}
