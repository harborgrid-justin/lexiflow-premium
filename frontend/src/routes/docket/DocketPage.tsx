/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Docket Page Component
 *
 * Handles Suspense/Await wiring for docket route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/docket/DocketPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, TableRouteSkeleton } from '../_shared/RouteSkeletons';
import { DocketProvider } from './DocketProvider';
import { DocketView } from './DocketView';
import type { clientLoader } from './loader';

interface DocketPageProps {
  loaderData: ReturnType<typeof clientLoader>;
}

export function DocketPage({ loaderData }: DocketPageProps) {
  return (
    <Suspense fallback={<TableRouteSkeleton title="Loading Docket" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load docket" />}>
        {(resolved) => (
          <DocketProvider initialEntries={resolved.docketEntries}>
            <DocketView />
          </DocketProvider>
        )}
      </Await>
    </Suspense>
  );
}
