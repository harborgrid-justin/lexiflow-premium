/**
 * Legal Research Index Route
 *
 * Comprehensive legal research tools including case law search,
 * statute lookup, and AI-powered research assistance.
 *
 * @module routes/research/index
 */

import { ResearchTool } from '@/routes/research/components/ResearchTool';
import { DataService } from '@/services/data/dataService';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Research',
    count: data?.items?.length,
    description: 'Legal research tools and case law database',
  });
}

// ============================================================================
// Client Loader
// ============================================================================

/**
 * Fetches research history on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader() {
  try {
    const history = await DataService.research.getHistory();
    return { items: [], totalCount: 0, recentSearches: history };
  } catch (error) {
    console.error("Failed to load research history", error);
    return { items: [], totalCount: 0, recentSearches: [] };
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
      case "search": {
        const query = formData.get("q");
        if (typeof query === 'string' && query) {
          const results = await DataService.research.searchCases(query);
          return { success: true, results };
        }
        return { success: false, error: "Query required" };
      }
      case "save": {
        const data = Object.fromEntries(formData);
        // Remove intent from data
        delete data.intent;
        await DataService.research.add(data);
        return { success: true, message: "Research saved" };
      }
      case "delete": {
        const id = formData.get("id");
        if (typeof id === 'string') {
          await DataService.research.delete(id);
          return { success: true, message: "Research deleted" };
        }
        return { success: false, error: "ID required" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Research action failed", error);
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ResearchIndexRoute() {
  return <ResearchTool />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Legal Research"
      message="We couldn't load the research tools. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
