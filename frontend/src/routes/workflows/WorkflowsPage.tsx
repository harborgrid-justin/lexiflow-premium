/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Workflows Page Component
 *
 * Handles Suspense/Await wiring for workflows route
 * Receives deferred loader data and passes to Provider → View
 *
 * @module routes/workflows/WorkflowsPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { WorkflowsProvider } from './WorkflowsProvider';
import { WorkflowsView } from './WorkflowsView';
import type { WorkflowsDeferredLoaderData, WorkflowsLoaderData } from './loader';

interface WorkflowsPageProps {
  loaderData: WorkflowsDeferredLoaderData;
}

export function WorkflowsPage({ loaderData }: WorkflowsPageProps) {
  const resolved = Promise.all([
    loaderData.templates,
    loaderData.instances,
    loaderData.tasks
  ]).then(([templates, instances, tasks]) => ({
    templates, instances, tasks
  }) satisfies WorkflowsLoaderData);

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Workflows" />}>
      <Await resolve={resolved} errorElement={<RouteError title="Failed to load Workflows" />}>
        {(initialData) => (
          <WorkflowsProvider initialData={initialData}>
            <WorkflowsView />
          </WorkflowsProvider>
        )}
      </Await>
    </Suspense>
  );
}
