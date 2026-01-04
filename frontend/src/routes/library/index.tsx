/**
 * Knowledge Base Route
 *
 * Legal knowledge base and resource library with:
 * - Server-side data loading via loader
 * - Document templates
 * - Legal research materials
 * - Firm precedents
 *
 * @module routes/library/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Resources',
    count: data?.resources?.length,
    description: 'Legal knowledge base, templates, and research materials',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // Parse search/filter params
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "all";
  const search = url.searchParams.get("q") || "";

  // TODO: Implement library data fetching
  // const resources = await api.library.search({ category, search });

  return {
    resources: [],
    categories: [
      { id: 'templates', name: 'Templates', count: 0 },
      { id: 'precedents', name: 'Precedents', count: 0 },
      { id: 'research', name: 'Research', count: 0 },
      { id: 'forms', name: 'Forms', count: 0 },
    ],
    currentCategory: category,
    searchQuery: search,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "upload":
      // TODO: Handle resource upload
      return { success: true, message: "Resource uploaded" };

    case "delete":
      // TODO: Handle resource deletion
      return { success: true };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { KnowledgeBase } from '@/features/knowledge/base/KnowledgeBase';

export default function LibraryIndexRoute() {
  return <KnowledgeBase />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Knowledge Base"
      message="We couldn't load the library. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
