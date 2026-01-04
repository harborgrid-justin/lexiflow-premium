/**
 * Legal Research Index Route
 *
 * Comprehensive legal research tools including case law search,
 * statute lookup, and AI-powered research assistance.
 *
 * @module routes/research/index
 */

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
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement research history fetching
  // const url = new URL(request.url);
  // const query = url.searchParams.get("q");
  // const results = query ? await api.research.search(query) : [];
  // const recentSearches = await api.research.getRecentSearches();

  return { items: [], totalCount: 0, recentSearches: [] };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "search":
      // TODO: Handle search query
      return { success: true, results: [] };
    case "save":
      // TODO: Handle saving research
      return { success: true, message: "Research saved" };
    case "delete":
      // TODO: Handle deleting saved research
      return { success: true, message: "Research deleted" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { ResearchTool } from '@/features/knowledge/research/ResearchTool';

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
