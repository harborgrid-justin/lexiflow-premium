/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Discovery Index Route
 *
 * Comprehensive e-discovery platform including legal holds, collections,
 * processing, review, productions, and privilege logging.
 *
 * @module routes/discovery/index
 */

import { useLoaderData } from 'react-router';

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// Import Page component
import { DiscoveryPage } from './DiscoveryPage';

import type { clientLoader } from './loader';

// Export loader and action
export { action, clientLoader as clientLoader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Discovery',
    description: 'Manage legal discovery processes and requests',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function DiscoveryIndexRoute() {
  const loaderData = useLoaderData();

  return <DiscoveryPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
