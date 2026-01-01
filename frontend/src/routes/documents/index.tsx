/**
 * Documents Index Route
 *
 * Document management page displaying all documents with:
 * - Server-side data loading via loader
 * - Search, filter, and sort capabilities
 * - Upload actions via Form
 * - Type-safe Route types
 *
 * @module routes/documents/index
 */

import { DocumentsApiService } from '@/api/admin/documents-api';
import { DocumentFilters, DocumentList, type DocumentFilterOptions, type ViewMode } from '@/components/features/documents/components';
import { useState } from 'react';
import { Link } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

const documentsApi = new DocumentsApiService();

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Documents',
    count: data?.documents?.length,
    description: 'Manage your legal documents, filings, and attachments',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const filters = {
      type: url.searchParams.get('type') || undefined,
      status: url.searchParams.get('status') || undefined,
      caseId: url.searchParams.get('caseId') || undefined,
    };

    const documents = await documentsApi.getAll(filters);

    return {
      documents,
      totalCount: documents.length,
    };
  } catch (error) {
    console.error('[Documents Loader] Error:', error);
    return {
      documents: [],
      totalCount: 0,
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "delete": {
        const id = formData.get("id") as string;
        await documentsApi.delete(id);
        return { success: true };
      }

      case "bulk-delete": {
        const ids = JSON.parse(formData.get("ids") as string) as string[];
        await Promise.all(ids.map(id => documentsApi.delete(id)));
        return { success: true };
      }

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error('[Documents Action] Error:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DocumentsIndexRoute({ loaderData }: Route.ComponentProps) {
  const { documents, totalCount } = loaderData;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<DocumentFilterOptions>({});
  const [filteredDocs, setFilteredDocs] = useState(documents);

  // Apply filters
  const handleFilterChange = (newFilters: DocumentFilterOptions) => {
    setFilters(newFilters);

    let filtered = [...documents];

    if (newFilters.search) {
      const search = newFilters.search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(search) ||
        doc.content.toLowerCase().includes(search) ||
        doc.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (newFilters.type) {
      filtered = filtered.filter(doc => doc.type === newFilters.type);
    }

    if (newFilters.status) {
      filtered = filtered.filter(doc => doc.status === newFilters.status);
    }

    if (newFilters.caseId) {
      filtered = filtered.filter(doc => doc.caseId === newFilters.caseId);
    }

    if (newFilters.dateFrom) {
      filtered = filtered.filter(doc => new Date(doc.uploadDate) >= new Date(newFilters.dateFrom!));
    }

    if (newFilters.dateTo) {
      filtered = filtered.filter(doc => new Date(doc.uploadDate) <= new Date(newFilters.dateTo!));
    }

    if (newFilters.author) {
      const author = newFilters.author.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.author?.toLowerCase().includes(author)
      );
    }

    if (newFilters.ocrProcessed) {
      filtered = filtered.filter(doc => doc.ocrProcessed);
    }

    if (newFilters.isRedacted) {
      filtered = filtered.filter(doc => doc.isRedacted);
    }

    setFilteredDocs(filtered);
  };

  const handleDownload = async (id: string) => {
    try {
      const blob = await documentsApi.download(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documents.find(d => d.id === id)?.title || 'document.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsApi.delete(id);
      window.location.reload();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document');
    }
  };

  const handleBulkDownload = async (ids: string[]) => {
    for (const id of ids) {
      await handleDownload(id);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} documents?`)) return;

    try {
      await Promise.all(ids.map(id => documentsApi.delete(id)));
      window.location.reload();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Failed to delete documents');
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Documents
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage legal documents, filings, and attachments
          </p>
        </div>

        <Link
          to="/documents/upload"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Document
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <DocumentFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={() => {
            setFilters({});
            setFilteredDocs(documents);
          }}
        />
      </div>

      {/* Document List */}
      <DocumentList
        documents={filteredDocs}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onBulkDownload={handleBulkDownload}
        onBulkDelete={handleBulkDelete}
      />
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
      title="Failed to Load Documents"
      message="We couldn't load your documents. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
