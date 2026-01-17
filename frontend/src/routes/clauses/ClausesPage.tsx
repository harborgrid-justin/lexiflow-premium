/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Clauses Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { ClausesProvider } from './ClausesProvider';
import { ClausesView } from './ClausesView';

import type { ClausesLoaderData } from './loader';

export function ClausesPage() {
  const initialData = useLoaderData();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Clauses" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Clauses" />}>
        {(resolved) => (
          <ClausesProvider initialData={resolved}>
            <ClausesView />
          </ClausesProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default ClausesPage;
