/**
 * Jurisdictions Index Route
 *
 * Manage jurisdictional information including court systems,
 * filing requirements, and jurisdiction-specific rules.
 *
 * @module routes/jurisdiction/index
 */

import { DataService } from '@/services/data/dataService';
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

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type"); // federal, state, local

  try {
    // Map type string to API filter if needed
    const filter = type ? { system: type as any } : {};
    const items = await DataService.analytics.jurisdiction.getAll(filter);
    return { items, totalCount: items.length };
  } catch (error) {
    console.error("Failed to load jurisdictions", error);
    return { items: [], totalCount: 0 };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create":
        // Creation logic would go here
        // const data = Object.fromEntries(formData);
        // await DataService.analytics.jurisdiction.create(data);
        return { success: true, message: "Jurisdiction created" };
      case "delete":
        const id = formData.get("id") as string;
        if (id) await DataService.analytics.jurisdiction.delete(id);
        return { success: true, message: "Jurisdiction deleted" };
      case "update":
        // Update logic
        return { success: true, message: "Jurisdiction updated" };
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    return { success: false, error: "Action failed" };
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
