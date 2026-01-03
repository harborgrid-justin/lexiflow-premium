/**
 * Exhibit Pro Index Route
 *
 * Professional exhibit management for trial preparation,
 * including exhibit numbering, organization, and presentation.
 *
 * @module routes/exhibits/index
 */

import { api } from '@/api';
import { Link, useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Exhibits',
    count: data?.items?.length,
    description: 'Professional exhibit management for trial preparation',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get("caseId") || undefined;

  try {
    const exhibits = await api.exhibits.getAll({ caseId });
    return { items: exhibits, totalCount: exhibits.length };
  } catch (error) {
    console.error("Failed to load exhibits:", error);
    return { items: [], totalCount: 0 };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create":
        // In a real app, we would parse form data and call api.exhibits.create(...)
        return { success: true, message: "Exhibit created" };
      case "delete":
        // api.exhibits.delete(...)
        return { success: true, message: "Exhibit deleted" };
      case "update-status":
        // api.exhibits.updateStatus(...)
        return { success: true, message: "Status updated" };
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ExhibitsIndexRoute() {
  const { items } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Exhibit Pro
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Professional exhibit management for trial preparation
          </p>
        </div>

        <Link
          to="/exhibits/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Exhibit
        </Link>
      </div>

      {items.length === 0 ? (
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
            No Exhibits Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new exhibit for your case.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: TrialExhibit) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {item.exhibitNumber || 'No #'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  <Link to={`/exhibits/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {item.description || 'No description available'}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.type}
                  </span>
                  <Link
                    to={`/exhibits/${item.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
      title="Failed to Load Exhibits"
      message="We couldn't load the exhibits. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
