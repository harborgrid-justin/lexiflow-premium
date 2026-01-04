/**
 * Jurisdictions Index Route
 *
 * Manage jurisdictional information including court systems,
 * filing requirements, and jurisdiction-specific rules.
 *
 * @module routes/jurisdiction/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Jurisdictions',
    count: data?.items?.length,
    description: 'Manage jurisdictional rules and court systems',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement jurisdiction data fetching
  // const url = new URL(request.url);
  // const type = url.searchParams.get("type"); // federal, state, local
  // const jurisdictions = await api.jurisdictions.list({ type });

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
      // TODO: Handle jurisdiction creation
      return { success: true, message: "Jurisdiction created" };
    case "delete":
      // TODO: Handle jurisdiction deletion
      return { success: true, message: "Jurisdiction deleted" };
    case "update":
      // TODO: Handle jurisdiction update
      return { success: true, message: "Jurisdiction updated" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { JurisdictionManager } from '@/features/knowledge/jurisdiction/JurisdictionManager';

export default function JurisdictionIndexRoute() {
  return <JurisdictionManager />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Jurisdictions"
      message="We couldn't load the jurisdiction data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
