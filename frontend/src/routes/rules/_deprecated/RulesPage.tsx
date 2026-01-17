/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Rules Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

import { RulesProvider } from './RulesProvider';
import { RulesView } from './RulesView';

import type { RulesLoaderData } from './loader';

export function RulesPage() {
  const initialData = useLoaderData() as RulesLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Rules" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Rules" />}>
        {(resolved) => (
          <RulesProvider initialData={resolved}>
            <RulesView />
          </RulesProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default RulesPage;
