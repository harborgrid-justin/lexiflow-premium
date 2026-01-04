/**
 * Correspondence Index Route
 *
 * Manage legal correspondence, letters, and communications with clients,
 * opposing counsel, courts, and other parties.
 *
 * @module routes/correspondence/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Correspondence',
    count: data?.items?.length,
    description: 'Manage legal correspondence and communications',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement correspondence fetching
  // const url = new URL(request.url);
  // const filter = url.searchParams.get("filter") || "all";
  // const correspondence = await api.correspondence.list({ filter });

  return { items: [], totalCount: 0 };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // TODO: Handle correspondence creation
      return { success: true, message: "Correspondence created" };
    case "delete":
      // TODO: Handle correspondence deletion
      return { success: true, message: "Correspondence deleted" };
    case "archive":
      // TODO: Handle correspondence archival
      return { success: true, message: "Correspondence archived" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import CorrespondenceManager from '@/features/operations/correspondence/CorrespondenceManager';

export default function CorrespondenceIndexRoute() {
  return <CorrespondenceManager />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Correspondence"
      message="We couldn't load the correspondence data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
