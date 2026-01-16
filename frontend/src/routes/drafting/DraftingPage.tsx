/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Drafting Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { DraftingProvider } from './DraftingProvider';
import { DraftingView } from './DraftingView';
import type { DraftingLoaderData } from './loader';

export function DraftingPage() {
  const initialData = useLoaderData() as DraftingLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Drafting" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Drafting" />}>
        {(resolved) => (
          <DraftingProvider initialData={resolved}>
            <DraftingView />
          </DraftingProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default DraftingPage;
