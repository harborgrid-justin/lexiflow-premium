/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Entities Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { EntitiesProvider } from './EntitiesProvider';
import { EntitiesView } from './EntitiesView';
import type { EntitiesLoaderData } from './loader';

export function EntitiesPage() {
  const initialData = useLoaderData() as EntitiesLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Entities" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Entities" />}>
        {(resolved) => (
          <EntitiesProvider initialData={resolved}>
            <EntitiesView />
          </EntitiesProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default EntitiesPage;
