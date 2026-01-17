/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Compliance Route Index
 *
 * Enterprise React Architecture - Legal Compliance & Deadlines
 * Exports loader and default component for React Router v7
 *
 * @module routes/compliance/index
 */

import { useLoaderData } from 'react-router';

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// Import Page component
import { CompliancePage } from './CompliancePage';

import type { ComplianceLoaderData } from './loader';

// Export loader
export { complianceLoader as clientLoader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Compliance',
    description: 'Track legal deadlines, ethics compliance, and CLE requirements',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function ComplianceIndexRoute() {
  const loaderData = useLoaderData() as ComplianceLoaderData;

  return <CompliancePage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
