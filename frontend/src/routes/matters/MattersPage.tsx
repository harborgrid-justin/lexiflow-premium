/**
 * MattersPage Component
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * Responsibility: Suspense boundary and async resolution management
 * Pattern: Page → Suspense → Await → Provider → View
 *
 * This component:
 * - Manages Suspense boundaries for async data
 * - Resolves deferred promises with Await
 * - Delegates to MatterManagement for state/presentation
 *
 * @see routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Await } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { MatterManagement } from './components/list/MatterManagement';

import type { mattersLoader } from './loader';

interface MattersPageProps {
  loaderData: ReturnType<typeof mattersLoader>;
}

export function MattersPage({ loaderData }: MattersPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Matters" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Matters" />}>
        {(resolved) => <MatterManagement initialMatters={resolved.matters} />}
      </Await>
    </Suspense>
  );
}
