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

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

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

export async function loader() {
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

export default function LibraryIndexRoute() {
  const { resources, categories, currentCategory } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Legal templates, precedents, and research materials
          </p>
        </div>

        <Link
          to="/library/upload"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Resource
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="?category=all"
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            currentCategory === 'all'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`?category=${cat.id}`}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              currentCategory === cat.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {cat.name}
            {cat.count > 0 && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {cat.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Placeholder Content */}
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
          Knowledge Base Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Library features coming soon.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {resources.length} resources in library
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
      title="Failed to Load Knowledge Base"
      message="We couldn't load the library. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
