/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * DAF (Document Assembly Framework) Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { DAFProvider } from './DAFProvider';
import { DAFView } from './DAFView';
import type { DAFLoaderData } from './loader';

export function DAFPage() {
  const initialData = useLoaderData() as DAFLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading DAF" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load DAF" />}>
        {(resolved) => (
          <DAFProvider initialData={resolved}>
            <DAFView />
          </DAFProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default DAFPage;
