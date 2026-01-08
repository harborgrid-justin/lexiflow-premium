/**
 * Cases Page - Server Component with Server Actions
 * Next.js 16 Compliant: Async params/searchParams, Server Actions
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getCases } from '@/lib/actions/cases';
import { CacheTags, CacheProfiles } from '@/lib/cache';
import { CaseFilters } from '@/components/cases/CaseFilters';
import { CaseList } from '@/components/cases/CaseList';
import type { Case } from '@/types/case';

export const metadata: Metadata = {
  title: 'Cases | LexiFlow',
  description: 'Manage all legal cases',
};

// Next.js 16: searchParams must be awaited
interface CasesPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    search?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

/**
 * Server Component for fetching cases with cache tags
 */
async function CasesData({
  filters,
}: {
  filters: {
    status?: string[];
    matterType?: string[];
    searchQuery?: string;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}) {
  const result = await getCases(filters.status || filters.matterType || filters.searchQuery ? {
    status: filters.status as ('Open' | 'Active' | 'Pending' | 'Discovery' | 'Trial' | 'Settled' | 'Closed' | 'Archived' | 'On Hold' | 'Pre-Filing' | 'Appeal' | 'Transferred')[],
    matterType: filters.matterType as ('LITIGATION' | 'TRANSACTIONAL' | 'ADVISORY' | 'COMPLIANCE' | 'INTELLECTUAL_PROPERTY' | 'EMPLOYMENT' | 'REAL_ESTATE' | 'CORPORATE' | 'OTHER')[],
    searchQuery: filters.searchQuery,
    page: filters.page ?? 1,
    pageSize: 20,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder ?? 'desc',
  } : undefined);

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Failed to load cases: {result.error}
        </p>
        <Link
          href="/cases"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Try again
        </Link>
      </div>
    );
  }

  const cases = result.data;

  if (cases.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          No cases found
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {filters.searchQuery
            ? 'No cases match your search criteria.'
            : 'Get started by creating a new case.'}
        </p>
        <Link
          href="/cases/new"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Case
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Showing {cases.length} case{cases.length !== 1 ? 's' : ''}
      </p>

      {/* Cases grid */}
      <div className="grid grid-cols-1 gap-4">
        {cases.map((caseItem: Case) => (
          <CaseCard key={caseItem.id} caseData={caseItem} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual case card component
 */
function CaseCard({ caseData }: { caseData: Case }) {
  const statusColors: Record<string, string> = {
    Open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Discovery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Trial: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Settled: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    Closed: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    Archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    'On Hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  return (
    <Link
      href={`/cases/${caseData.id}`}
      className="block p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {caseData.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {caseData.caseNumber && `#${caseData.caseNumber} - `}
            {caseData.client}
          </p>
          {caseData.description && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {caseData.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {caseData.practiceArea && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {caseData.practiceArea}
              </span>
            )}
            {caseData.jurisdiction && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {caseData.jurisdiction}
              </span>
            )}
          </div>
        </div>
        <div className="ml-4 flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[caseData.status] || statusColors.Open
            }`}
          >
            {caseData.status}
          </span>
          {caseData.filingDate && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Filed: {new Date(caseData.filingDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Loading skeleton for cases
 */
function CasesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-6 bg-white dark:bg-slate-800 rounded-lg border animate-pulse"
        >
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            </div>
            <div className="ml-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Filters loading skeleton
 */
function FiltersLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg border animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Main Cases Page
 */
export default async function CasesPage({ searchParams }: CasesPageProps) {
  // Next.js 16: Await searchParams
  const params = await searchParams;

  // Parse filters from search params
  const filters = {
    status: params.status?.split(',').filter(Boolean) as string[] | undefined,
    matterType: params.type?.split(',').filter(Boolean) as string[] | undefined,
    searchQuery: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as 'asc' | 'desc') ?? 'desc',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Cases
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage and track all legal cases
          </p>
        </div>
        <Link
          href="/cases/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Case
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<FiltersLoadingSkeleton />}>
            <CaseFilters />
          </Suspense>
        </aside>

        {/* Cases List */}
        <main className="lg:col-span-3">
          <Suspense fallback={<CasesLoadingSkeleton />}>
            <CasesData filters={filters} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
