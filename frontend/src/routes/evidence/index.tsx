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

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// Export loader from dedicated file
export { evidenceLoader as loader } from './loader';

// Import View component
import { EvidenceView } from './EvidenceView';

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
  return <EvidenceView />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
