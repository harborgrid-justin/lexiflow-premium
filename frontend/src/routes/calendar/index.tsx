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

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { LoaderFunctionArgs, MetaArgs } from 'react-router';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_: MetaArgs) {
  return createMeta({
    title: 'Master Calendar',
    description: 'View and manage all deadlines, court dates, and appointments',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
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

import { CalendarView } from '@/features/cases/components/calendar/CalendarView';

export default function CalendarIndexRoute() {
  return <CalendarView />;
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
