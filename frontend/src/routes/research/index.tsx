/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Legal Research Index Route
 *
 * Comprehensive legal research tools including case law search,
 * statute lookup, and AI-powered research assistance.
 *
 * @module routes/research/index
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';

import { intelligenceApi, knowledgeApi } from '@/lib/frontend-api';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';


// Import standard components
import { ResearchProvider } from './ResearchProvider';
import { ResearchView } from './ResearchView';

import type { Route } from "./+types/index";
import type { ResearchLoaderData } from './loader';

// Export loader
export { researchLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Research',
    count: data?.recentSearches?.length,
    description: 'Legal research tools and case law database',
  });
}

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
          const result = await intelligenceApi.getLegalResearch(query);
          if (!result.ok) {
            return { success: false, error: result.error.message };
          }
          return { success: true, results: result.data };
        }
        return { success: false, error: "Query required" };
      }
      case "save": {
        const data = Object.fromEntries(formData);
        delete data.intent;
        const result = await knowledgeApi.createResearch(data);
        if (!result.ok) {
          return { success: false, error: result.error.message };
        }
        return { success: true, message: "Research saved" };
      }
      case "delete": {
        const id = formData.get("id");
        if (typeof id === 'string') {
          const result = await knowledgeApi.deleteResearch(id);
          if (!result.ok) {
            return { success: false, error: result.error.message };
          }
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
  const initialData = useLoaderData();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Research" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Research" />}>
        {(resolved) => (
          <ResearchProvider initialData={resolved}>
            <ResearchView />
          </ResearchProvider>
        )}
      </Await>
    </Suspense>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
