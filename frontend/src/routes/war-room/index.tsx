/**
 * War Room Index Route
 *
 * Collaborative litigation war room for trial preparation,
 * strategy sessions, and team coordination.
 *
 * @module routes/war-room/index
 */

import { WarRoom } from '@/features/litigation/war-room/WarRoom';
import { DataService } from '@/services/data/dataService';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Types
// ============================================================================

interface RouteErrorBoundaryProps {
  error: unknown;
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: { items: unknown[] } }) {
  return createListMeta({
    entityType: 'War Rooms',
    count: data?.items?.length,
    description: 'Collaborative litigation war rooms for trial preparation',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function clientLoader({ request: _ }: LoaderFunctionArgs) {
  try {
    const cases = await DataService.cases.getAll();
    // Filter for cases that might be relevant for war room (e.g. Trial, Litigation)
    const warRoomCases = cases.filter((c: { status: string }) => c.status === 'Active' || c.status === 'Trial');

    return { items: warRoomCases, totalCount: warRoomCases.length };
  } catch (error) {
    console.error("Failed to load war room cases:", error);
    return { items: [], totalCount: 0 };
  }
}

clientLoader.hydrate = true;

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create": {
        // Create a new case with Trial status
        const title = formData.get("title") as string;
        if (title) {
          await DataService.cases.add({
            title,
            status: 'Trial',
            description: 'Created from War Room',
            client: 'Unknown', // Should be provided
            practiceArea: 'Litigation'
          });
          return { success: true, message: "War room case created" };
        }
        return { success: false, error: "Title required" };
      }
      case "delete": {
        const id = formData.get("id") as string;
        if (id) {
          await DataService.cases.delete(id);
          return { success: true, message: "War room case deleted" };
        }
        return { success: false, error: "ID required" };
      }
      case "archive": {
        const id = formData.get("id") as string;
        if (id) {
          await DataService.cases.update(id, { status: 'Closed' });
          return { success: true, message: "War room archived" };
        }
        return { success: false, error: "ID required" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch {
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function WarRoomIndexRoute() {
  return <WarRoom />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: RouteErrorBoundaryProps) {
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
