/**
 * Master Calendar Route
 *
 * Unified calendar view with:
 * - Server-side data loading via loader
 * - Court dates, deadlines, and appointments
 * - Event creation and management
 * - Multiple view modes (month, week, day)
 *
 * @module routes/calendar/index
 */

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createMeta({
    title: 'Master Calendar',
    description: 'View and manage all deadlines, court dates, and appointments',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // Parse URL for date range
  const url = new URL(request.url);
  const view = url.searchParams.get("view") || "month";
  const date = url.searchParams.get("date") || new Date().toISOString().split('T')[0];

  // TODO: Implement calendar event fetching
  // const events = await api.calendar.getEvents({ view, date });

  return {
    events: [],
    view,
    currentDate: date,
    upcomingDeadlines: [],
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-event":
      // TODO: Handle event creation
      return { success: true, message: "Event created" };

    case "update-event":
      // TODO: Handle event update
      return { success: true, message: "Event updated" };

    case "delete-event":
      // TODO: Handle event deletion
      return { success: true, message: "Event deleted" };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function CalendarIndexRoute({ loaderData }: Route.ComponentProps) {
  const { events, view, currentDate } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Master Calendar
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage all deadlines, court dates, and appointments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <Link
              to="?view=month"
              className={`px-3 py-2 text-sm font-medium ${
                view === 'month'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </Link>
            <Link
              to="?view=week"
              className={`border-l border-r border-gray-200 px-3 py-2 text-sm font-medium dark:border-gray-700 ${
                view === 'week'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </Link>
            <Link
              to="?view=day"
              className={`px-3 py-2 text-sm font-medium ${
                view === 'day'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Day
            </Link>
          </div>

          <Link
            to="/calendar/create"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </Link>
        </div>
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Calendar Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Calendar features coming soon.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Viewing: {view} | Date: {currentDate} | {events.length} events
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
      title="Failed to Load Calendar"
      message="We couldn't load the calendar. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
