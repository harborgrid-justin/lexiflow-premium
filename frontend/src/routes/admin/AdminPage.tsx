import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { AdminProvider } from './AdminProvider';
import { AdminView } from './AdminView';
import type { clientLoader } from './loader';

export function AdminPageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Admin" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load admin panel" />}>
        {(resolved) => (
          <AdminProvider initialUsers={resolved.users} initialSettings={resolved.settings} initialAuditLogs={resolved.auditLogs}>
            <AdminView />
          </AdminProvider>
        )}
      </Await>
    </Suspense>
  );
}
