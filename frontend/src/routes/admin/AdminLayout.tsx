/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from 'react';
import { Outlet, useLoaderData } from 'react-router';
import { RouteSkeleton } from '../_shared/RouteSkeletons';
import { AdminProvider } from './AdminContext';
import { adminLoader } from './loader';

export { adminLoader as loader };

/**
 * Admin Layout Component
 *
 * Provides common AdminProvider and ErrorBoundary for all administration sub-routes.
 */
export default function AdminLayout() {
  const data = useLoaderData<typeof adminLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Administration" />}>
      <AdminProvider
        metrics={data.metrics}
        auditLogs={data.auditLogs}
        user={data.user}
      >
        <div className="h-full w-full">
          <Outlet />
        </div>
      </AdminProvider>
    </Suspense>
  );
}
