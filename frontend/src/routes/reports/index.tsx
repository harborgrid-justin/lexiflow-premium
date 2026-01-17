/**
 * Reports Route
 *
 * Report builder and management interface with:
 * - Server-side data loading via loader
 * - Report generation and scheduling
 * - Filtering and search
 * - Export capabilities
 *
 * @module routes/reports/index
 */

import { useLoaderData } from 'react-router';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import { ReportsPage } from './ReportsPage';

import type { ReportsLoaderData } from './loader';

// Export loader from dedicated file
export { loader as clientLoader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createListMeta({
    title: 'Reports',
    description: 'Analytics and reporting dashboard',
    count: 0
  });
}

// ============================================================================
// Component
// ============================================================================

export default function ReportsRoute() {
  const loaderData = useLoaderData();

  return <ReportsPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
