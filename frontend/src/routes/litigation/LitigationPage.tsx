/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Litigation Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { LitigationProvider } from './LitigationContext';
import { LitigationView } from './LitigationView';
import type { LitigationLoaderData } from './loader';

export function LitigationPage() {
  const initialData = useLoaderData() as LitigationLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Litigation" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Litigation" />}>
        {(resolved) => (
          <LitigationProvider initialData={resolved}>
            <LitigationView />
          </LitigationProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default LitigationPage;
