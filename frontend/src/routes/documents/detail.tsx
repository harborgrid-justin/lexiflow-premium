/**
 * Document Detail Route
 *
 * Displays detailed information for a single document.
 *
 * @module routes/documents/detail
 */

import { documentsApi } from '@/lib/frontend-api';
import { DataService } from '@/services/data/data-service.service';
import { DocumentVersion } from '@/types';
import { useState } from 'react';
import { useFetcher, useLoaderData, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';
import {
  DocumentAnnotations,
  DocumentViewer,
  MetadataPanel,
  VersionHistory
} from './components';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createDetailMeta({
    entityType: 'Document',
    entityName: data?.document?.title,
    entityId: data?.document?.id,
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: LoaderFunctionArgs) {
  const { documentId } = params;

  // CRITICAL: Validate param exists
  if (!documentId) {
    throw new Response("Document ID is required", { status: 400 });
  }

  try {
    const [docResult, versionsResult, annotationsResult] = await Promise.all([
      documentsApi.getDocumentById(documentId),
      documentsApi.getDocumentVersions(documentId),
      documentsApi.getDocumentAnnotations(documentId),
    ]);

    if (!docResult.ok) {
      throw new Response("Document not found", { status: 404 });
    }

    return {
      document: docResult.data,
      versions: versionsResult.ok ? versionsResult.data.data : [],
      annotations: annotationsResult.ok ? annotationsResult.data.data : [],
    };
  } catch (error) {
    console.error('[Document Detail Loader] Error:', error);
    throw new Response("Document not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: ActionFunctionArgs) {
  const { documentId } = params;

  if (!documentId) {
    return { success: false, error: "Document ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "update": {
        const updates = JSON.parse(formData.get("data") as string);
        await DataService.documents.update(documentId, updates);
        return { success: true };
      }
      case "delete": {
        await DataService.documents.delete(documentId);
        return { success: true, redirect: "/documents" };
      }
      case "restore-version": {
        const versionId = formData.get("versionId") as string;
        await DataService.documents.restoreVersion(documentId, versionId);
        return { success: true };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error('[Document Detail Action] Error:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DocumentDetailRoute() {
  const navigate = useNavigate();
  const { document: doc, versions, annotations } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [activeTab, setActiveTab] = useState<'viewer' | 'metadata' | 'versions' | 'annotations'>('viewer');
  const fetcher = useFetcher();

  const handleUpdate = async (updates: Partial<typeof doc>) => {
    fetcher.submit(
      { intent: "update", data: JSON.stringify(updates) },
      { method: "post" }
    );
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!confirm(`Restore to version ${versionNumber}?`)) return;

    const versionId = versions.find((v: DocumentVersion) => v.versionNumber === versionNumber)?.id;
    if (!versionId) return;

    fetcher.submit(
      { intent: "restore-version", versionId: versionId as string },
      { method: "post" }
    );
  };

  const handleCompare = async (v1: number, v2: number) => {
    try {
      const version1 = versions.find((v: DocumentVersion) => v.versionNumber === v1);
      const version2 = versions.find((v: DocumentVersion) => v.versionNumber === v2);
      if (!version1 || !version2) throw new Error('Versions not found');

      const result = await DataService.documents.compareVersions(
        doc.id,
        version1.id as string,
        version2.id as string
      );

      const comparisonWindow = window.open('', '_blank');
      if (comparisonWindow) {
        comparisonWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Version Comparison - ${doc.title}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #f5f5f5; }
              .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              h1 { color: #1e293b; margin-bottom: 10px; }
              .meta { color: #64748b; margin-bottom: 30px; }
              .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .version { padding: 20px; background: #f8fafc; border-radius: 4px; }
              .version h2 { color: #475569; font-size: 18px; margin-bottom: 15px; }
              .content { white-space: pre-wrap; line-height: 1.6; color: #1e293b; }
              .added { background: #dcfce7; padding: 2px 4px; }
              .removed { background: #fee2e2; padding: 2px 4px; text-decoration: line-through; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Version Comparison</h1>
              <div class="meta">Comparing ${version1.version} vs ${version2.version}</div>
              <div class="comparison">
                <div class="version">
                  <h2>Version ${version1.version}</h2>
                  <div class="content">${JSON.stringify(result, null, 2)}</div>
                </div>
                <div class="version">
                  <h2>Version ${version2.version}</h2>
                  <div class="content">Side-by-side comparison view</div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `);
        comparisonWindow.document.close();
      }
    } catch (error) {
      console.error('Compare failed:', error);
      alert('Failed to compare versions');
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await DataService.documents.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.title;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await DataService.documents.delete(doc.id);
      navigate('/documents');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Documents
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {document.title}
        </h1>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 -mb-px">
          <button
            onClick={() => setActiveTab('viewer')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'viewer'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
          >
            Document
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'metadata'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
          >
            Metadata
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'versions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
          >
            Versions ({versions.length})
          </button>
          <button
            onClick={() => setActiveTab('annotations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'annotations'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
          >
            Annotations ({annotations.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'viewer' && (
          <DocumentViewer document={doc} />
        )}

        {activeTab === 'metadata' && (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-2xl mx-auto">
              <MetadataPanel
                document={doc}
                editable={true}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-3xl mx-auto">
              <VersionHistory
                versions={versions}
                currentVersion={doc.currentVersion}
                onRestore={handleRestoreVersion}
                onCompare={handleCompare}
              />
            </div>
          </div>
        )}

        {activeTab === 'annotations' && (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-3xl mx-auto">
              <DocumentAnnotations
                documentId={doc.id}
                annotations={annotations}
                onAdd={async (annotation) => {
                  try {
                    await DataService.documents.addAnnotation(doc.id, annotation);
                    window.location.reload();
                  } catch (error) {
                    console.error('Failed to add annotation:', error);
                    alert('Failed to add annotation');
                  }
                }}
                onDelete={async (id) => {
                  try {
                    await DataService.documents.deleteAnnotation(doc.id, id);
                    window.location.reload();
                  } catch (error) {
                    console.error('Failed to delete annotation:', error);
                    alert('Failed to delete annotation');
                  }
                }}
              />
            </div>
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
  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="Document Not Found"
        message="The document you're looking for doesn't exist."
        backTo="/documents"
        backLabel="Back to Documents"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Document"
      message="We couldn't load this document. Please try again."
      backTo="/documents"
      backLabel="Back to Documents"
    />
  );
}
