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

import { knowledgeApi } from '@/lib/frontend-api';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof clientLoader>> }) {
  return createListMeta({
    entityType: 'Resources',
    count: data?.resources?.length,
    description: 'Legal knowledge base, templates, and research materials',
  });
}

// ============================================================================
// Client Loader
// ============================================================================

/**
 * Fetches library resources on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader({ request }: LoaderFunctionArgs) {
  // Parse search/filter params
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "all";
  const search = url.searchParams.get("q") || "";

  try {
    // Fetch resources using new enterprise API
    const result = await knowledgeApi.getAllKnowledge({
      category: category !== "all" ? category : undefined,
      search: search || undefined,
      page: 1,
      limit: 100
    });

    const resources = result.ok ? result.data.data : [];

    return {
      resources,
      categories: [
        { id: 'templates', name: 'Templates', count: 0 },
        { id: 'precedents', name: 'Precedents', count: 0 },
        { id: 'research', name: 'Research', count: 0 },
        { id: 'forms', name: 'Forms', count: 0 },
      ],
      currentCategory: category,
      searchQuery: search,
    };
  } catch (error) {
    console.error("Failed to load library resources", error);
    return {
      resources: [],
      categories: [],
      currentCategory: category,
      searchQuery: search,
    };
  }
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "upload":
        // Upload logic would go here
        // const data = Object.fromEntries(formData);
        // await DataService.analytics.knowledge.create(data);
        return { success: true, message: "Resource uploaded" };

      case "delete": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "ID required" };

        const result = await knowledgeApi.deleteKnowledge(id);
        if (!result.ok) {
          return { success: false, error: result.error.message };
        }

        return { success: true };
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

import { KnowledgeBase } from '@/routes/library/components/KnowledgeBase';

export default function LibraryIndexRoute() {
  return <KnowledgeBase />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
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
