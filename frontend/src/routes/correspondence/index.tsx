/**
 * Correspondence Index Route
 *
 * Manage legal correspondence, letters, and communications with clients,
 * opposing counsel, courts, and other parties.
 *
 * @module routes/correspondence/index
 */

import { Link, useNavigate } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Correspondence',
    count: data?.items?.length,
    description: 'Manage legal correspondence and communications',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Implement correspondence fetching
  // const url = new URL(request.url);
  // const filter = url.searchParams.get("filter") || "all";
  // const correspondence = await api.correspondence.list({ filter });

  return { items: [], totalCount: 0 };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // TODO: Handle correspondence creation
      return { success: true, message: "Correspondence created" };
    case "delete":
      // TODO: Handle correspondence deletion
      return { success: true, message: "Correspondence deleted" };
    case "archive":
      // TODO: Handle correspondence archival
      return { success: true, message: "Correspondence archived" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function CorrespondenceIndexRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Correspondence
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage legal correspondence, letters, and communications
          </p>
        </div>

        <Link
          to="/correspondence/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Correspondence
        </Link>
      </div>

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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Correspondence Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Letter and communication management coming soon.
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
      title="Failed to Load Correspondence"
      message="We couldn't load the correspondence data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
