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

import { DataService } from '@/services/data/dataService';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Resources',
    count: data?.resources?.length,
    description: 'Legal knowledge base, templates, and research materials',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  // Parse search/filter params
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "all";
  const search = url.searchParams.get("q") || "";

  try {
    // Map filters to API params
    const filter = {
      category: category !== "all" ? category : undefined,
      search: search || undefined
    };

    const resources = await DataService.analytics.knowledge.getAll(filter);

    return {
      resources,
      categories: [
        { id: 'templates', name: 'Templates', count: 0 }, // Counts could be fetched separately if needed
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
        if (id) await DataService.analytics.knowledge.delete(id);
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

import { KnowledgeBase } from '@/features/knowledge/base/KnowledgeBase';

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
