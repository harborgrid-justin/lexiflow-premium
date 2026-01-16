/**
 * Pleadings Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import type { PleadingsLoaderData } from './loader';
import { PleadingsProvider } from './PleadingsProvider';
import { PleadingsView } from './PleadingsView';

export function PleadingsPage() {
  const initialData = useLoaderData() as PleadingsLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Pleadings" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Pleadings" />}>
        {(resolved) => (
          <PleadingsProvider initialData={resolved}>
            <PleadingsView />
          </PleadingsProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default PleadingsPage;
