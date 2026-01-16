/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Cases Route Index
 *
 * Case management and litigation tracking system.
 *
 * @module routes/cases/index
 */

import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

import { CasesPage } from './CasesPage';
import type { CaseListLoaderData } from './loader';

// Export loader from dedicated file
export { clientLoader } from './loader';

// Export Contexts
export {
  CaseProvider,
  useCaseActions,
  useCaseContext,
  useCaseState,
  type CaseContextValue
} from './CaseProvider';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Cases',
    description: 'Manage cases and litigation',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function CasesRoute() {
  const loaderData = useLoaderData() as CaseListLoaderData;

  return <CasesPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
