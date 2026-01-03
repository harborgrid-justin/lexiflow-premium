/**
 * Exhibit Detail Route
 *
 * Displays detailed information for a single exhibit.
 *
 * @module routes/exhibits/detail
 */

import { useNavigate } from 'react-router';
import type { Route } from "./+types/detail";
import { RouteErrorBoundary, NotFoundError } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createDetailMeta({
    entityType: 'Exhibit',
    entityName: data?.item?.title,
    entityId: data?.item?.id,
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: Route.LoaderArgs) {
  const { exhibitId } = params;

  // CRITICAL: Validate param exists
  if (!exhibitId) {
    throw new Response("Exhibit ID is required", { status: 400 });
  }

  // TODO: Fetch data
  // const item = await api.exhibits.get(exhibitId);
  // if (!item) {
  //   throw new Response("Exhibit not found", { status: 404 });
  // }

  return { item: null };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { exhibitId } = params;

  if (!exhibitId) {
    return { success: false, error: "Exhibit ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update":
      // TODO: Implement update
      return { success: true };
    case "delete":
      // TODO: Implement delete
      // return redirect("/exhibits");
      return { success: true };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ExhibitDetailRoute() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Exhibit Detail
      </h1>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-500 dark:text-gray-400">
          Detail view under development.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="Exhibit Not Found"
        message="The exhibit you're looking for doesn't exist."
        backTo="/exhibits"
        backLabel="Back to Exhibits"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Exhibit"
      message="We couldn't load this exhibit. Please try again."
      backTo="/exhibits"
      backLabel="Back to Exhibits"
    />
  );
}
