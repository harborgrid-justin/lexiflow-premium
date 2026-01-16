import { Suspense } from 'react';
import { Await, Outlet, useLoaderData, useRevalidator } from 'react-router';
import { RouteError, TableRouteSkeleton } from '../_shared/RouteSkeletons';
import { CaseListProvider } from './CaseListProvider';
import { clientLoader } from './loader';

export { clientLoader as loader };

export default function CaseListLayout() {
  const data = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();

  return (
    <div className="min-h-full">
      <Suspense fallback={<TableRouteSkeleton title="Loading Cases" />}>
        <Await resolve={data} errorElement={<RouteError title="Failed to load cases" />}>
          {(resolved) => (
            <CaseListProvider
              initialCases={resolved.cases}
              initialInvoices={resolved.invoices}
              onRevalidate={revalidator.revalidate}
            >
              <Outlet />
            </CaseListProvider>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
