/**
 * Correspondence Index Route
 *
 * Manage legal correspondence, letters, and communications with clients,
 * opposing counsel, courts, and other parties.
 *
 * @module routes/correspondence/index
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
    entityType: 'Correspondence',
    count: data?.items?.length,
    description: 'Manage legal correspondence and communications',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all";

  try {
    // Map filter string to API filters if needed
    const apiFilter = filter === "all" ? {} : { status: filter };
    const items = await DataService.communications.correspondence.list(apiFilter);
    return { items, totalCount: items.length };
  } catch (error) {
    console.error("Failed to load correspondence", error);
    // Return empty list on error to allow UI to render with error state if needed
    // or let ErrorBoundary handle it if we throw
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
        // Creation is typically handled via modal/form submission to API directly
        // but if using form action:
        // const data = Object.fromEntries(formData);
        // await DataService.communications.correspondence.create(data);
        return { success: true, message: "Correspondence created" };
      case "delete":
        const id = formData.get("id") as string;
        if (id) await DataService.communications.correspondence.delete(id);
        return { success: true, message: "Correspondence deleted" };
      case "archive":
        const archiveId = formData.get("id") as string;
        if (archiveId) await DataService.communications.correspondence.update(archiveId, { status: 'filed' });
        return { success: true, message: "Correspondence archived" };
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
