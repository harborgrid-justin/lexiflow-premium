/**
 * Library Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { LibraryProvider } from './LibraryProvider';
import { LibraryView } from './LibraryView';
import type { LibraryLoaderData } from './loader';

export function LibraryPage() {
  const initialData = useLoaderData() as LibraryLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Library" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Library" />}>
        {(resolved) => (
          <LibraryProvider initialData={resolved}>
            <LibraryView />
          </LibraryProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default LibraryPage;
