/**
 * Exhibits Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { ExhibitsProvider } from './ExhibitsProvider';
import { ExhibitsView } from './ExhibitsView';

import type { ExhibitsLoaderData } from './loader';

export function ExhibitsPage() {
  const initialData = useLoaderData();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Exhibits" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Exhibits" />}>
        {(resolved) => (
          <ExhibitsProvider initialData={resolved}>
            <ExhibitsView />
          </ExhibitsProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default ExhibitsPage;
