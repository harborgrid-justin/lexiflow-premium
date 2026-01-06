/**
 * Clause Library Index Route
 *
 * Manage reusable contract clauses, boilerplate language,
 * and clause templates for document assembly.
 *
 * @module routes/clauses/index
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
    entityType: 'Clauses',
    count: data?.items?.length,
    description: 'Manage contract clauses and boilerplate language',
  });
}

// ============================================================================
// Client Loader
// ============================================================================

/**
 * Fetches clauses on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  try {
    // Map category string to API filter type if needed, or pass as is if compatible
    // Assuming category from URL matches Clause['category'] or is undefined
    const filter = category ? { category: category as string } : {};
    const items = await DataService.clauses.getAll(filter);
    return { items, totalCount: items.length };
  } catch (error) {
    console.error("Failed to load clauses", error);
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
        // Creation logic would go here, typically via API call
        // const data = Object.fromEntries(formData);
        // await DataService.analytics.clauses.create(data);
        return { success: true, message: "Clause created" };
      case "delete": {
        const id = formData.get("id") as string;
        if (id) await DataService.analytics.clauses.delete(id);
        return { success: true, message: "Clause deleted" };
      }
      case "duplicate":
        // Duplication logic
        return { success: true, message: "Clause duplicated" };
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

import ClauseLibrary from '@/features/knowledge/clauses/ClauseLibrary';

export default function ClausesIndexRoute() {
  return <ClauseLibrary onSelectClause={() => { }} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Clause Library"
      message="We couldn't load the clause library. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
