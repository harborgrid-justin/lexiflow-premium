/**
 * SearchPage Component
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * Responsibility: Suspense boundary and async resolution management
 * Pattern: Page → Suspense → Await → Provider → View
 *
 * This component:
 * - Manages Suspense boundaries for async data
 * - Resolves deferred promises with Await
 * - Provides PageFrame layout wrapper
 * - Delegates to EnhancedSearch for UI presentation
 *
 * @see routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { Suspense } from "react";
import { Await } from "react-router";

import { PageFrame } from "@/layouts/PageFrame";

import { RouteSkeleton } from "../_shared/RouteSkeletons";

import { EnhancedSearch } from './components/components/advanced/EnhancedSearch';

import type { searchLoader } from './loader';

interface SearchPageProps {
  loaderData: Awaited<ReturnType<typeof searchLoader>>;
}

export function SearchPage({ loaderData }: SearchPageProps) {
  return (
    <PageFrame title="Global Search" breadcrumbs={[{ label: 'Search' }]}>
      <Suspense fallback={<RouteSkeleton title="Loading Search..." />}>
        <Await resolve={loaderData} errorElement={<div>Error loading search</div>}>
          {() => (
            <div className="max-w-3xl mx-auto py-12 px-4">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">LexiFlow Search</h1>
                <p className="text-gray-500">Search across cases, documents, and entities</p>
              </div>
              <EnhancedSearch
                onSearch={(q) => console.log('Search:', q)}
                className="w-full"
                autoFocus
                showCategories
                showSyntaxHints
              />
            </div>
          )}
        </Await>
      </Suspense>
    </PageFrame>
  );
}
