/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Legal Research Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import type { ResearchLoaderData } from './loader';
import { ResearchProvider } from './ResearchProvider';
import { ResearchView } from './ResearchView';

export function ResearchPage() {
  const initialData = useLoaderData() as ResearchLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Research" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Research" />}>
        {(resolved) => (
          <ResearchProvider initialData={resolved}>
            <ResearchView />
          </ResearchProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default ResearchPage;
