/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Cases Index Route (List View)
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * ================================================================================
 * React v18 + React Router v7 + Context + Suspense
 *
 * DATA FLOW (One-Directional):
 * Router Loader → Route Component → Feature Provider → Feature View → UI
 *
 * ARCHITECTURAL LAYERS:
 * 1. loader.ts        - Data authority (server/client)
 * 2. index.tsx        - Route definition (this file)
 * 3. CaseListPage.tsx - Data orchestration (Suspense, Await, Provider init)
 * 4. CaseListProvider - Domain logic (state, computations, actions)
 * 5. CaseListView.tsx - Pure presentation (render only)
 *
 * CANONICAL RULES:
 * - Data flows down
 * - Events flow up
 * - Navigation flows sideways (via router)
 * - Suspense = rendering concern
 * - Loaders = data concern
 * - Server = business decisions
 * - Client = presentation logic
 *
 * @module routes/cases/index
 */

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import type { Route } from "./+types/index";

// Import loader and action from dedicated file (ENTERPRISE PATTERN)
export { action, clientLoader } from './loader';

// Import Page component (data orchestration layer)
import { CaseListPageContent } from './CaseListPage';

// ============================================================================
// Meta Tags
// ============================================================================

/**
 * Dynamic meta tags showing case count
 * NOTE: With deferred data, meta receives promises, not resolved data
 */
export function meta() {
  // TODO: Adjust meta generation for deferred data
  return createListMeta({
    entityType: 'Cases',
    description: 'Manage your legal cases and matters',
  });
}

// ============================================================================
// Component - Enterprise Pattern
// ============================================================================

/**
 * Route component - delegates to Page component
 *
 * ENTERPRISE PATTERN:
 * - Route exports default component
 * - Component imports Page from separate file
 * - Page handles data orchestration (Suspense, Await, Provider)
 * - View handles presentation (pure render)
 *
 * This separation enables:
 * - Clear architectural boundaries
 * - Easier testing (Page vs View)
 * - Reusability (View can be used elsewhere)
 * - Code organization (feature-focused folders)
 */
export default function CasesRoute() {
  return <CaseListPageContent />;
}

// ============================================================================
// Error Boundary
// ============================================================================

/**
 * Route-specific error boundary with recovery options
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error("Cases route error:", error);

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Cases"
      message="We couldn't load your cases. This might be a temporary issue."
      backTo="/"
      backLabel="Return to Dashboard"
      onRetry={() => window.location.reload()}
    />
  );
}
