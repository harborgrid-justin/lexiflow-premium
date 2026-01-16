/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Jurisdiction Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { JurisdictionProvider } from './JurisdictionProvider';
import { JurisdictionView } from './JurisdictionView';
import type { JurisdictionLoaderData } from './loader';

export function JurisdictionPage() {
  const initialData = useLoaderData() as JurisdictionLoaderData;
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Jurisdiction" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Jurisdiction" />}>
        {(resolved) => (
          <JurisdictionProvider initialData={resolved}>
            <JurisdictionView />
          </JurisdictionProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default JurisdictionPage;
