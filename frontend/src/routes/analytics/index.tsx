/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Analytics Index Route
 *
 * Enterprise React Architecture - Business Intelligence
 * Exports loader and default component for React Router v7
 *
 * @module routes/analytics/index
 */

import { useLoaderData } from 'react-router';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// Import standard components
import { AnalyticsPage } from './AnalyticsPage';

import type { clientLoader } from './loader';

// Export loader (renamed to loader for standard router usage)
export { clientLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createListMeta({
    entityType: 'Analytics',
    description: 'View system usage, performance metrics, and business intelligence',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function AnalyticsIndexRoute() {
  const loaderData = useLoaderData();

  return <AnalyticsPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
