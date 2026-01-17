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

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';

// Import standard components
import { DocumentsProvider } from './DocumentsProvider';
import { DocumentsView } from './DocumentsView';

import type { clientLoader } from './loader';

// Export loader (renamed to loader for standard router usage)
export { clientLoader as clientLoader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

type DocumentsLoaderData = Awaited<ReturnType<typeof clientLoader>>;

export function meta({ data }: { data?: DocumentsLoaderData }) {
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
  const initialData = useLoaderData<DocumentsLoaderData>();

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
