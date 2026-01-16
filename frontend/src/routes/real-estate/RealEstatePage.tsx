/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Real Estate Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import type { RealEstateLoaderData } from './loader';
import { RealEstateProvider } from './RealEstateProvider';
import { RealEstateView } from './RealEstateView';

export function RealEstatePage() {
  const initialData = useLoaderData() as RealEstateLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Real Estate" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Real Estate" />}>
        {(resolved) => (
          <RealEstateProvider initialData={resolved}>
            <RealEstateView />
          </RealEstateProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default RealEstatePage;
