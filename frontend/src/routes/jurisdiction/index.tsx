/**
 * Jurisdictions Index Route
 *
 * Manage jurisdictional information including court systems,
 * filing requirements, and jurisdiction-specific rules.
 *
 * @module routes/jurisdiction/index
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
    entityType: 'Jurisdictions',
    count: data?.items?.length,
    description: 'Manage jurisdictional rules and court systems',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Implement jurisdiction data fetching
  // const url = new URL(request.url);
  // const type = url.searchParams.get("type"); // federal, state, local
  // const jurisdictions = await api.jurisdictions.list({ type });

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
      // TODO: Handle jurisdiction creation
      return { success: true, message: "Jurisdiction created" };
    case "delete":
      // TODO: Handle jurisdiction deletion
      return { success: true, message: "Jurisdiction deleted" };
    case "update":
      // TODO: Handle jurisdiction update
      return { success: true, message: "Jurisdiction updated" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function JurisdictionIndexRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Jurisdictions
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage court systems and jurisdictional rules
          </p>
        </div>

        <Link
          to="/jurisdiction/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Jurisdiction
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
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Jurisdictions Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Jurisdiction management features coming soon.
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
      title="Failed to Load Jurisdictions"
      message="We couldn't load the jurisdiction data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
