/**
 * Case Documents Route
 *
 * Displays all documents associated with a specific case.
 * - Server-side data loading via loader
 * - Type-safe params via Route types
 * - Document filtering and search
 * - Upload and management actions
 *
 * @module routes/cases/documents
 */

import { CaseHeader } from '@/routes/cases/ui/components/CaseHeader';
import type { Case, LegalDocument } from '@/types';
import { useState } from 'react';
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: { caseData: Case } }) {
  const caseTitle = data?.caseData?.title || 'Case Documents';
  return [
    { title: `Documents - ${caseTitle} | LexiFlow` },
    { name: 'description', content: `View and manage documents for ${caseTitle}` },
  ];
}

// ============================================================================
// Loader
// ============================================================================

import { casesApi, documentsApi } from '@/lib/frontend-api';

export async function loader({ params }: LoaderFunctionArgs) {
  const { caseId } = params;

  if (!caseId) {
    throw new Response("Case ID is required", { status: 400 });
  }

  // Fetch case and documents in parallel using new enterprise API
  const [caseResult, documentsResult] = await Promise.all([
    casesApi.getCaseById(caseId),
    documentsApi.getDocumentsByCase(caseId),
  ]);

  if (!caseResult.ok) {
    throw new Response("Case Not Found", { status: 404 });
  }

  // Extract documents from paginated result, fallback to empty array on error
  const documents = documentsResult.ok ? documentsResult.data.data : [];

  return { caseData: caseResult.data, documents };
}

// ============================================================================
// Component
// ============================================================================

export default function CaseDocumentsRoute() {
  const { caseData, documents } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter documents
  const filteredDocuments = documents.filter((doc: LegalDocument) => {
    const matchesSearch = searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  // Get unique document types
  const documentTypes = Array.from(new Set(documents.map((doc: LegalDocument) => doc.type).filter(Boolean)));

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Case Header */}
      <CaseHeader case={caseData} showBreadcrumbs />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>

          {/* Actions */}
          <button
            onClick={() => {
              // Handle upload
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Document</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filterType === 'all'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
            >
              All
            </button>
            {documentTypes.map((type) => (
              <button
                key={type as string}
                onClick={() => setFilterType(type as string)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filterType === type
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
              >
                {type as string}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search or filters' : 'Get started by uploading a document'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc: LegalDocument) => (
              <div
                key={doc.id}
                className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <div className="p-4">
                  {/* Document Icon */}
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Document Title */}
                  <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {doc.title}
                  </h3>

                  {/* Document Type */}
                  {doc.type && (
                    <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      {doc.type}
                    </span>
                  )}

                  {/* Document Description */}
                  {doc.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {doc.description}
                    </p>
                  )}

                  {/* Document Metadata */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{doc.createdAt && new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Documents"
      message="We couldn't load the documents for this case."
      backTo="/cases"
      backLabel="Back to Cases"
      onRetry={() => window.location.reload()}
    />
  );
}
