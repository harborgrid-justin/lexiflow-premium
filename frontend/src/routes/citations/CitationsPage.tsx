/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Citations Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { CitationsProvider } from './CitationsProvider';
import { CitationsView } from './CitationsView';
import type { CitationsLoaderData } from './loader';

export function CitationsPage() {
  const initialData = useLoaderData() as CitationsLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Citations" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Citations" />}>
        {(resolved) => (
          <CitationsProvider initialData={resolved}>
            <CitationsView />
          </CitationsProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default CitationsPage;
