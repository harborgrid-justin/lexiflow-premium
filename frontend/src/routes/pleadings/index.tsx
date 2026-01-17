/**
 * Pleadings Route Index
 *
 * Enterprise React Architecture - Legal Pleadings Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/pleadings/index
 */

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// Export client loader from dedicated file (SPA mode)
export { clientLoader } from './loader';

// Import Page component
import { PleadingsPage } from './PleadingsPage';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Pleadings',
    description: 'Legal pleading and motion management',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function PleadingsRoute() {
  return <PleadingsPage />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
