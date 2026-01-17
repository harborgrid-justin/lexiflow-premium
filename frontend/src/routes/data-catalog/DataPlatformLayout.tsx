import { Suspense } from 'react';
import { Await, Outlet, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { DataPlatformProvider } from './DataPlatformProvider';
import { dataPlatformLoader } from './loader';

import type { DataPlatformLoaderData } from './loader';

export { dataPlatformLoader as loader };

export default function DataPlatformLayout() {
  const initialData = useLoaderData();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Data Platform" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Data Platform" />}>
        {(resolved) => (
          <DataPlatformProvider initialData={resolved}>
            <Outlet />
          </DataPlatformProvider>
        )}
      </Await>
    </Suspense>
  );
}
