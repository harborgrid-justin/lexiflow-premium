/**
 * War Room Index Route
 *
 * Collaborative litigation war room for trial preparation,
 * strategy sessions, and team coordination.
 *
 * @module routes/war-room/index
 */

import { api } from '@/api';
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

export async function loader({ request: _ }: LoaderFunctionArgs) {
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

export async function action({ request }: ActionFunctionArgs) {
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

import { WarRoom } from '@/features/litigation/war-room/WarRoom';

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
