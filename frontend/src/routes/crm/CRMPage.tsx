import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { CRMProvider } from './CRMProvider';
import { CRMView } from './CRMView';
import type { clientLoader } from './loader';

export function CRMPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback={<RouteSkeleton title="Loading CRM" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load CRM" />}>
        {(resolved) => (
          <CRMProvider initialClients={resolved.clients} initialContacts={resolved.contacts} initialOpportunities={resolved.opportunities}>
            <CRMView />
          </CRMProvider>
        )}
      </Await>
    </Suspense>
  );
}
