/**
 * Documents Index Route
 *
 * Document management page displaying all documents with:
 * - Server-side data loading via loader
 * - Search, filter, and sort capabilities
 * - Upload actions via Form
 * - Type-safe Route types
 *
 * @module routes/documents/index
 */

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteLoadingSkeleton } from '../_shared/RouteLoading';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Documents',
    count: data?.documents?.length,
    description: 'Manage your legal documents, filings, and attachments',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Implement document fetching
  // const documents = await api.documents.getAll();

  return {
    documents: [],
    totalCount: 0,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "upload":
      // TODO: Handle file upload
      return { success: true, message: "Document uploaded" };

    case "delete":
      // TODO: Handle document deletion
      return { success: true };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DocumentsIndexRoute({ loaderData }: Route.ComponentProps) {
  const { documents, totalCount } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Documents
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage legal documents, filings, and attachments
          </p>
        </div>

        <Link
          to="/documents/upload"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Document
        </Link>
      </div>

      {/* Placeholder Content */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Documents Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Document management features coming soon.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {totalCount} documents in system
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Documents"
      message="We couldn't load your documents. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
