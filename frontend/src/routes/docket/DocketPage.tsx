import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, TableRouteSkeleton } from '../_shared/RouteSkeletons';
import { DocketProvider } from './DocketProvider';
import { DocketView } from './DocketView';
import type { clientLoader } from './loader';

export function DocketPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback={<TableRouteSkeleton title="Loading Docket" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load docket" />}>
        {(resolved) => (
          <DocketProvider initialEntries={resolved.docketEntries}>
            <DocketView />
          </DocketProvider>
        )}
      </Await>
    </Suspense>
  );
}
