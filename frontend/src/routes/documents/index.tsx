/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Documents Index Route
 *
 * Enterprise React Architecture - Document Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/documents/index
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// Import standard components
import { DocumentsProvider } from './DocumentsProvider';
import { DocumentsView } from './DocumentsView';
import type { clientLoader } from './loader';

// Export loader (renamed to loader for standard router usage)
export { clientLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Documents',
    count: data?.documents?.length || 0,
    description: 'Manage your legal documents, filings, and attachments',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function DocumentsIndexRoute() {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof clientLoader>>;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Documents" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load documents" />}>
        {(resolved) => (
          <DocumentsProvider initialDocuments={resolved.documents}>
            <DocumentsView />
          </DocumentsProvider>
        )}
      </Await>
    </Suspense>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
