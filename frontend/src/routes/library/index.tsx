/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Library Route Index
 *
 * Enterprise React Architecture - Legal Library & Knowledge Base
 * Exports loader and default component for React Router v7
 *
 * @module routes/library/index
 */

import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// Import Page component
import { LibraryPage } from './LibraryPage';
import type { LibraryLoaderData } from './loader';

// Export loader
export { libraryLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Library',
    count: data?.items?.length,
    description: 'Internal knowledge base and legal library',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function LibraryIndexRoute() {
  const loaderData = useLoaderData() as LibraryLoaderData;

  return <LibraryPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
