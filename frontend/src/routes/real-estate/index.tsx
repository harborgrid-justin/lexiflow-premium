/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Real Estate Route Index
 *
 * Enterprise React Architecture - Property Portfolio Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/real-estate/index
 */

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// Export loader from dedicated file
export { realEstateLoader as loader } from './loader';

// Import Page component
import { RealEstatePage } from './RealEstatePage';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Real Estate',
    description: 'Property portfolio and real estate management',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function RealEstateRoute() {
  return <RealEstatePage />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
