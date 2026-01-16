/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Data Platform Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { DataPlatformProvider } from './DataPlatformProvider';
import { DataPlatformView } from './DataPlatformView';
import type { DataPlatformLoaderData } from './loader';

export function DataPlatformPage() {
  const initialData = useLoaderData() as DataPlatformLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Data Platform" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Data Platform" />}>
        {(resolved) => (
          <DataPlatformProvider initialData={resolved}>
            <DataPlatformView />
          </DataPlatformProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default DataPlatformPage;
