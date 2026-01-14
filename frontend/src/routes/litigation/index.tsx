/**
 * Litigation Route Index
 *
 * Enterprise React Architecture - Case Litigation Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/litigation/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// Export loader from dedicated file
export { litigationLoader as loader } from './loader';

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
