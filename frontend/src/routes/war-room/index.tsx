/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * War Room Index Route
 *
 * Collaborative litigation war room for trial preparation,
 * strategy sessions, and team coordination.
 *
 * @module routes/war-room/index
 */

import { casesApi } from '@/lib/frontend-api';
import { CaseStatus } from '@/types';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import { WarRoom } from './components/WarRoom';

import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

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
    // Fetch all cases using new enterprise API
    const result = await casesApi.getAll({ page: 1, limit: 1000 });
    const cases = result.ok ? result.data.data : [];
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

export async function clientAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create": {
        // Create a new case with Trial status
        const title = formData.get("title") as string;
        if (title) {
          const result = await casesApi.create({
            title,
            status: CaseStatus.Trial,
            description: 'Created from War Room',
            clientId: 'Unknown', // Should be provided
            practiceArea: 'Litigation'
          });
          if (!result.ok) {
            return { success: false, error: result.error.message };
          }
          return { success: true, message: "War room case created" };
        }
        return { success: false, error: "Title required" };
      }
      case "delete": {
        const id = formData.get("id") as string;
        if (id) {
          const result = await casesApi.remove(id);
          if (!result.ok) {
            return { success: false, error: result.error.message };
          }
          return { success: true, message: "War room case deleted" };
        }
        return { success: false, error: "ID required" };
      }
      case "archive": {
        const id = formData.get("id") as string;
        if (id) {
          const result = await casesApi.update(id, { status: CaseStatus.Closed });
          if (!result.ok) {
            return { success: false, error: result.error.message };
          }
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
