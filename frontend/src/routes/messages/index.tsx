/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Messages Route Index
 *
 * Enterprise React Architecture - Secure Communications
 * Exports loader and default component for React Router v7
 *
 * @module routes/messages/index
 */

import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// Import Page component
import { MessagesPage } from './MessagesPage';
import type { MessagesLoaderData } from './loader';

// Export loader from dedicated file
export { messagesLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Messages',
    description: 'Secure communications and messaging',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function MessagesIndexRoute() {
  const loaderData = useLoaderData() as MessagesLoaderData;

  return <MessagesPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
