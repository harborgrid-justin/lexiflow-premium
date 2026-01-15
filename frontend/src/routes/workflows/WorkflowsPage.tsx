/**
 * Workflows Domain - Page Component
 * Enterprise React Architecture Pattern
 *
 * Responsibilities:
 * - Route integration (loader)
 * - Suspense/Await boundaries (rendering concern)
 * - Provider composition
 * - View rendering
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import type { WorkflowsDeferredLoaderData, WorkflowsLoaderData } from './loader';
import { WorkflowsProvider } from './WorkflowsProvider';
import { WorkflowsView } from './WorkflowsView';

/**
 * Page Component
 * Composes Provider + View
 */
export function WorkflowsPage() {
  const loaderData = useLoaderData() as WorkflowsDeferredLoaderData;
  const resolved = Promise.all([loaderData.templates, loaderData.instances, loaderData.tasks]).then(
    ([templates, instances, tasks]) => ({ templates, instances, tasks }) satisfies WorkflowsLoaderData
  );

  return (
    <Suspense
      fallback={
        <div className="p-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
        </div>
      }
    >
      <Await resolve={resolved}>
        {(initialData) => (
          <WorkflowsProvider initialData={initialData}>
            <WorkflowsView />
          </WorkflowsProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default WorkflowsPage;
