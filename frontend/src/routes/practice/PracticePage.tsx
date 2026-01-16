/**
 * Practice Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import type { PracticeLoaderData } from './loader';
import { PracticeProvider } from './PracticeProvider';
import { PracticeView } from './PracticeView';

export function PracticePage() {
  const initialData = useLoaderData() as PracticeLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Practice" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Practice" />}>
        {(resolved) => (
          <PracticeProvider initialData={resolved}>
            <PracticeView />
          </PracticeProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default PracticePage;
