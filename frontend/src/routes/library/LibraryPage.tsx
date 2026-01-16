/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Library Page Component
 *
 * Handles Suspense/Await wiring for library route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/library/LibraryPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { LibraryProvider } from './LibraryProvider';
import { LibraryView } from './LibraryView';
import type { LibraryLoaderData } from './loader';

interface LibraryPageProps {
  loaderData: LibraryLoaderData;
}

export function LibraryPage({ loaderData }: LibraryPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Library" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Library" />}>
        {(resolved) => (
          <LibraryProvider initialData={resolved}>
            <LibraryView />
          </LibraryProvider>
        )}
      </Await>
    </Suspense>
  );
}
