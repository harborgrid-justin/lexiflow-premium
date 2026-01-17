/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Pleadings Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { PleadingsProvider } from './PleadingsContext';
import { PleadingsView } from './PleadingsView';

import type { PleadingsLoaderData } from './loader';

export function PleadingsPage() {
  const initialData = useLoaderData();

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
