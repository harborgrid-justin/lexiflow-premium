/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Litigation Route Index
 *
 * Enterprise React Architecture - Case Litigation Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/litigation/index
 */

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// Export loader from dedicated file
export { litigationLoader as clientLoader } from './loader';

// Import Page component
import { LitigationPage } from './LitigationPage';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Litigation',
    description: 'Case litigation tracking and strategy',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function LitigationRoute() {
  return <LitigationPage />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
