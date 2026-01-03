/**
 * War Room Index Route
 *
 * Collaborative litigation war room for trial preparation,
 * strategy sessions, and team coordination.
 *
 * @module routes/war-room/index
 */

import { api } from '@/api';
import { Link } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'War Rooms',
    count: data?.items?.length,
    description: 'Collaborative litigation war rooms for trial preparation',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request: _ }: Route.LoaderArgs) {
  try {
    const cases = await api.cases.getAll();
    // Filter for cases that might be relevant for war room (e.g. Trial, Litigation)
    const warRoomCases = cases.filter(c => c.status === 'Active' || c.status === 'Trial');

    return { items: warRoomCases, totalCount: warRoomCases.length };
  } catch (error) {
    console.error("Failed to load war room cases:", error);
    return { items: [], totalCount: 0 };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // In a real app, this would create a new war room context or case
      return { success: true, message: "War room created" };
    case "delete":
      return { success: true, message: "War room deleted" };
    case "archive":
      return { success: true, message: "War room archived" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function WarRoomIndexRoute({ loaderData }: Route.ComponentProps) {
  const { items } = loaderData;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            War Room
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Collaborative space for trial preparation and strategy
          </p>
        </div>

        <Link
          to="/war-room/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New War Room
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Active War Rooms
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start a new war room for an active case to begin collaboration.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item: any) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.status === 'Trial' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                    {item.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.caseNumber}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  <Link to={`/war-room/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {item.description || 'No description available'}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Placeholder avatars */}
                    <div className="inline-block h-8 w-8 rounded-full bg-gray-300 ring-2 ring-white dark:ring-gray-800"></div>
                    <div className="inline-block h-8 w-8 rounded-full bg-gray-400 ring-2 ring-white dark:ring-gray-800"></div>
                    <div className="inline-block h-8 w-8 rounded-full bg-gray-500 ring-2 ring-white dark:ring-gray-800"></div>
                  </div>
                  <Link
                    to={`/war-room/${item.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Enter Room &rarr;
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
      title="Failed to Load War Room"
      message="We couldn't load the war room data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
