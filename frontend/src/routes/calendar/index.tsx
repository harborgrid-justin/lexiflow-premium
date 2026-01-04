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

import { DataService } from '@/services/data/dataService';
import type { CalendarEventType } from '@/types';
import { endOfDay, endOfMonth, endOfWeek, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

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
  const dateStr = url.searchParams.get("date") || new Date().toISOString().split('T')[0];
  const date = parseISO(dateStr);

  let startDate: Date;
  let endDate: Date;

  switch (view) {
    case 'week':
      startDate = startOfWeek(date);
      endDate = endOfWeek(date);
      break;
    case 'day':
      startDate = startOfDay(date);
      endDate = endOfDay(date);
      break;
    case 'month':
    default:
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      break;
  }

  try {
    const events = await DataService.calendar.getAll({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Also fetch upcoming deadlines (e.g. next 30 days)
    // We can use a separate call or filter from events if the range covers it.
    // For now, let's just return empty or fetch specifically if needed.
    // The UI might expect 'upcomingDeadlines'

    // Let's fetch upcoming deadlines separately as they might be outside the current view
    const upcomingDeadlines = await DataService.calendar.getAll({
      eventType: 'deadline',
      startDate: new Date().toISOString(),
      // Default to 30 days ahead for upcoming
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    return {
      events,
      view,
      currentDate: dateStr,
      upcomingDeadlines,
    };
  } catch (error) {
    console.error("Failed to load calendar events", error);
    return {
      events: [],
      view,
      currentDate: dateStr,
      upcomingDeadlines: [],
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create-event": {
        const title = formData.get("title") as string;
        const startDate = formData.get("startDate") as string;
        const type = formData.get("type") as CalendarEventType;

        if (!title || !startDate || !type) {
          return { success: false, error: "Missing required fields" };
        }

        await DataService.calendar.add({
          title,
          startDate,
          type,
          description: formData.get("description") as string,
          endDate: formData.get("endDate") as string,
          location: formData.get("location") as string,
          caseId: formData.get("caseId") as string,
        });
        return { success: true, message: "Event created" };
      }

      case "update-event": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "Missing event ID" };

        const updates: Record<string, unknown> = {};
        if (formData.has("title")) updates.title = formData.get("title") as string;
        if (formData.has("startDate")) updates.startDate = formData.get("startDate") as string;
        if (formData.has("endDate")) updates.endDate = formData.get("endDate") as string;
        if (formData.has("description")) updates.description = formData.get("description") as string;
        if (formData.has("location")) updates.location = formData.get("location") as string;

        await DataService.calendar.update(id, updates);
        return { success: true, message: "Event updated" };
      }

      case "delete-event": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "Missing event ID" };

        await DataService.calendar.delete(id);
        return { success: true, message: "Event deleted" };
      }

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Calendar action failed", error);
    return { success: false, error: "Action failed" };
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

export function ErrorBoundary({ error }: { error: unknown }) {
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
