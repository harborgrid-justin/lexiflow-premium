/**
 * Legal Research Index Route
 *
 * Comprehensive legal research tools including case law search,
 * statute lookup, and AI-powered research assistance.
 *
 * @module routes/research/index
 */

import { Link, useNavigate } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

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

export async function loader({ request }: Route.LoaderArgs) {
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

export default function ResearchIndexRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Legal Research
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Search case law, statutes, and legal resources
          </p>
        </div>

        <Link
          to="/research/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          New Research
        </Link>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Legal Research Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. AI-powered legal research coming soon.
        </p>
      </div>
    </div>
  );
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
