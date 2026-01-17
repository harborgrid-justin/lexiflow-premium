/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * War Room Domain - Page Component
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { RouteError, RouteSkeleton } from '../../_shared/RouteSkeletons';

import { WarRoomProvider } from './WarRoomProvider';
import { WarRoomView } from './WarRoomView';

import type { WarRoomLoaderData } from '../loader';

export function WarRoomPage() {
  const initialData = useLoaderData();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading War Room" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load War Room" />}>
        {(resolved) => (
          <WarRoomProvider initialData={resolved}>
            <WarRoomView />
          </WarRoomProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default WarRoomPage;
