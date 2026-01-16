/**
 * Workflows Index Route
 *
 * Manage automated workflows, task automation, and process templates
 * for legal operations and case management.
 *
 * @module routes/workflows/index
 */

import { createListMeta } from '../_shared/meta-utils';
import WorkflowsPage from './WorkflowsPage';
import { workflowsLoader } from './loader';

// ============================================================================
// Types
// ============================================================================

type LoaderData = Awaited<ReturnType<typeof loader>>;

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: LoaderData }) {
  void data;
  return createListMeta({
    entityType: 'Workflows',
    // Deferred loader data may not be resolved here; keep meta stable.
    description: 'Manage automated workflows and process templates',
  });
}

// Loader
// ============================================================================

export async function loader(args: Parameters<typeof workflowsLoader>[0]) {
  return workflowsLoader(args);
}

// ============================================================================
// Component
// ============================================================================

export default function WorkflowsIndexRoute() {
  return <WorkflowsPage />;
}
