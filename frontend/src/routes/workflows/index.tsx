/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Workflows Index Route
 *
 * Manage automated workflows, task automation, and process templates
 * for legal operations and case management.
 *
 * @module routes/workflows/index
 */

import { useLoaderData } from 'react-router';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import { WorkflowsPage } from './WorkflowsPage';

import type { WorkflowsDeferredLoaderData } from './loader';

// Export loader
export { workflowsLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createListMeta({
    entityType: 'Workflows',
    description: 'Manage automated workflows and process templates',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function WorkflowsIndexRoute() {
  const loaderData = useLoaderData();

  return <WorkflowsPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
