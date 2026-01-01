/**
 * Docket & Filings Route
 *
 * Displays court filings, docket entries, and case schedules with:
 * - Server-side data loading via loader
 * - Filter and search capabilities
 * - File new motion/document actions
 *
 * @module routes/docket/index
 */

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Docket Entries',
    count: data?.entries?.length,
    description: 'Manage court docket entries and filings',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Implement docket entry fetching
  // const entries = await api.docket.getAll();

  return {
    entries: [],
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
    case "file-motion":
      // TODO: Handle motion filing
      return { success: true, message: "Motion filed" };

    case "delete":
      // TODO: Handle entry deletion
      return { success: true };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DocketIndexRoute({ loaderData }: Route.ComponentProps) {
  const { entries, totalCount } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Docket & Filings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage court docket entries and case filings
          </p>
        </div>

        <Link
          to="/docket/file"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          File New Entry
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Docket Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Docket and filing features coming soon.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {totalCount} entries in system
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
      title="Failed to Load Docket"
      message="We couldn't load the docket entries. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
