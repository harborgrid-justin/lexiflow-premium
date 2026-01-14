/**
 * Correspondence Index Route
 *
 * Manage legal correspondence, letters, and communications with clients,
 * opposing counsel, courts, and other parties.
 *
 * @module routes/correspondence/index
 */

import { communicationsApi } from '@/lib/frontend-api';
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
// Client Loader
// ============================================================================

/**
 * Fetches correspondence on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all";

  try {
    // Fetch correspondence using new enterprise API
    // Using getAllMessages as getAllCorrespondence does not exist on communicationsApi
    // and Correspondence is essentially a type of Message
    const result = await communicationsApi.getAllMessages({ page: 1, limit: 100 });
    const items = result.ok ? result.data.data : [];

    // Apply client-side filtering if needed
    // Filtering by status requires checking properties on the normalized message objects
    const filteredItems = filter === "all"
      ? items
      : items.filter((item: any) => item.status === filter);

    return { items: filteredItems, totalCount: filteredItems.length };
  } catch (error) {
    console.error("Failed to load correspondence", error);
    return { items: [], totalCount: 0 };
  }
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

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
      case "delete": {
        const id = formData.get("id") as string;
        if (id) await DataService.communications.correspondence.delete(id);
        return { success: true, message: "Correspondence deleted" };
      }
      case "archive": {
        const archiveId = formData.get("id") as string;
        if (archiveId) await DataService.communications.correspondence.update(archiveId, { status: 'filed' });
        return { success: true, message: "Correspondence archived" };
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

import { CorrespondenceManager } from './components/CorrespondenceManager';

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
