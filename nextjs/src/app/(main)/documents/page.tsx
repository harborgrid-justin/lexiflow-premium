/**
 * Documents Page - Server Component with Server Actions
 * Next.js 16 Compliant: Async params/searchParams, Server Actions
 */

import React from 'react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getDocuments, getFolders } from '@/lib/actions/documents';
import { DocumentManager } from '@/components/documents/DocumentManager';
import type { LegalDocument } from '@/types/documents';

export const metadata: Metadata = {
  title: 'Documents | LexiFlow',
  description: 'Manage legal documents',
};

// Next.js 16: searchParams must be awaited
interface DocumentsPageProps {
  searchParams: Promise<{
    folderId?: string;
    caseId?: string;
    status?: string;
    type?: string;
    search?: string;
    page?: string;
  }>;
}

/**
 * Documents data fetcher component
 */
async function DocumentsData({
  filters,
}: {
  filters: {
    folderId?: string;
    caseId?: string;
    status?: string[];
    type?: string[];
    searchQuery?: string;
    page?: number;
  };
}) {
  // Fetch documents and folders in parallel
  const [documentsResult, foldersResult] = await Promise.all([
    getDocuments(
      filters.folderId || filters.caseId || filters.status || filters.type || filters.searchQuery
        ? {
            folderId: filters.folderId,
            caseId: filters.caseId,
            status: filters.status as ('draft' | 'under_review' | 'approved' | 'filed' | 'archived')[],
            type: filters.type as ('Contract' | 'Pleading' | 'Motion' | 'Brief' | 'Discovery' | 'Correspondence' | 'Evidence' | 'Exhibit' | 'Template' | 'Other')[],
            searchQuery: filters.searchQuery,
            page: filters.page ?? 1,
            pageSize: 50,
          }
        : undefined
    ),
    getFolders(filters.folderId ? { parentId: filters.folderId } : undefined),
  ]);

  const documents = documentsResult.success ? documentsResult.data : [];
  const folders = foldersResult.success ? foldersResult.data : [];

  return (
    <DocumentManager
      initialDocuments={documents}
      initialFolders={folders}
    />
  );
}

/**
 * Loading skeleton for documents
 */
function DocumentsLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar skeleton */}
      <div className="p-4 border-b bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="p-4 bg-white dark:bg-slate-800 rounded-lg border animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyDocuments({ searchQuery }: { searchQuery?: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center py-12 px-4">
        <svg
          className="mx-auto h-16 w-16 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          {searchQuery ? 'No documents found' : 'No documents yet'}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          {searchQuery
            ? 'Try adjusting your search or filters.'
            : 'Upload your first document to get started with document management.'}
        </p>
        {!searchQuery && (
          <button
            type="button"
            className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload Document
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Main Documents Page
 */
export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps): Promise<React.JSX.Element> {
  // Next.js 16: Await searchParams
  const params = await searchParams;

  // Parse filters from search params
  const filters = {
    folderId: params.folderId,
    caseId: params.caseId,
    status: params.status?.split(',').filter(Boolean) as string[] | undefined,
    type: params.type?.split(',').filter(Boolean) as string[] | undefined,
    searchQuery: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
  };

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<DocumentsLoadingSkeleton />}>
        <DocumentsData filters={filters} />
      </Suspense>
    </div>
  );
}
