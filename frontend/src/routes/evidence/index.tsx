/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Evidence Vault Index Route
 *
 * Secure evidence management system for storing, organizing,
 * and tracking chain of custody for legal evidence.
 *
 * @module routes/evidence/index
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { createMeta } from '../_shared/meta-utils';
import { EvidenceProvider } from './EvidenceContext';
import { EvidenceView } from './EvidenceView';
import type { evidenceLoader } from './loader';

// Export loader from dedicated file
export { evidenceLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Evidence Vault',
    description: 'Secure evidence management and chain of custody tracking',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function EvidenceRoute() {
  const initialData = useLoaderData<typeof evidenceLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Evidence" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Evidence" />}>
        {(resolved) => (
          <EvidenceProvider initialData={resolved}>
            <EvidenceView />
          </EvidenceProvider>
        )}
      </Await>
    </Suspense>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
