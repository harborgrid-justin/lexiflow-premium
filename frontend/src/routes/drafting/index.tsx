/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { createListMeta } from '../_shared/meta-utils';
import { DraftingDashboard } from './components/DraftingDashboard';
import type { Route } from './+types/index';
import { draftingLoader } from './loader';

export { draftingLoader as loader } from './loader';

export function meta(_args: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Drafting',
    description: 'Draft and assemble legal documents',
  });
}

export default function DraftingIndexRoute() {
  const initialData = useLoaderData<typeof draftingLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Drafting" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Drafting" />}>
        {(resolved) => <DraftingDashboard initialData={resolved} />}
      </Await>
    </Suspense>
  );
}

export { RouteErrorBoundary as ErrorBoundary };
