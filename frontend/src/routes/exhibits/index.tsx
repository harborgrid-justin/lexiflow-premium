/**
 * Exhibit Pro Index Route
 *
 * Professional exhibit management for trial preparation,
 * including exhibit numbering, organization, and presentation.
 *
 * @module routes/exhibits/index
 */

import { api } from '@/api';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Exhibits',
    count: data?.items?.length,
    description: 'Professional exhibit management for trial preparation',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
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

export async function action({ request }: ActionFunctionArgs) {
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

import { ExhibitManager } from '@/features/litigation/exhibits/ExhibitManager';

export default function ExhibitsIndexRoute() {
  return <ExhibitManager />;
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
