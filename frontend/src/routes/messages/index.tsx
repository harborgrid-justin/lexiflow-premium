/**
 * Messages Route Index
 *
 * Enterprise React Architecture - Secure Communications
 * Exports loader and default component for React Router v7
 *
 * @module routes/messages/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// Export loader from dedicated file
export { messagesLoader as loader } from './loader';

// Import Page component
import { MessagesPage } from './MessagesPage';

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

export default function MessagesRoute() {
  return <MessagesPage />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
