import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { ComplianceProvider } from './ComplianceProvider';
import { ComplianceView } from './ComplianceView';
import type { clientLoader } from './loader';

export function CompliancePageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Compliance" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load compliance" />}>
        {(resolved) => (
          <ComplianceProvider initialChecks={resolved.checks} initialConflicts={resolved.conflicts} initialDeadlines={resolved.deadlines}>
            <ComplianceView />
          </ComplianceProvider>
        )}
      </Await>
    </Suspense>
  );
}
