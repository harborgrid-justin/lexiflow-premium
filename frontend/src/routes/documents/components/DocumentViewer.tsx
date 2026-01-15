/**
 * DocumentViewer Component
 * PDF and document preview with annotation support
 */

import type { LegalDocument } from '@/types/documents';
import { useDocumentViewer } from '../_hooks/useDocumentViewer';

interface DocumentViewerProps {
  document: LegalDocument;
  showAnnotations?: boolean;
  onAddAnnotation?: (annotation: { page: number; text: string; x: number; y: number }) => void;
}

export function DocumentViewer({ document, showAnnotations, onAddAnnotation }: DocumentViewerProps) {
  const {
    currentPage,
    zoom,
    totalPages,
    handleAnnotationAdd,
    zoomIn,
    zoomOut,
    nextPage,
    prevPage,
    setPage
  } = useDocumentViewer({ document, showAnnotations, onAddAnnotation });

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="flex flex-col h-full">
      {showAnnotations && (
        <button
          onClick={handleAnnotationAdd}
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700"
        >
          Add Annotation
        </button>
      )}
      {/* Toolbar */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
            <button
              onClick={zoomOut}
              disabled={zoom === 50}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoom === 200}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Print
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Download
          </button>
        </div>
      </div>

      {/* Document Display */}
      <div className="flex-1 overflow-auto p-8">
        <div
          style={{ backgroundColor: 'var(--color-surface)' }}
          className="mx-auto shadow-lg"
          style={{
            width: `${8.5 * zoom}px`,
            minHeight: `${11 * zoom}px`,
          }}
        >
          {/* PDF Preview Placeholder */}
          <div className="p-8 space-y-4 text-gray-700" style={{ fontSize: `${zoom / 8}px` }}>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
              <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
            </div>

            {/* Bates Number Display */}
            {document.customFields?.batesNumber && (
              <div className="text-right text-xs text-gray-500 font-mono mb-4">
                {String(document.customFields.batesNumber)}
              </div>
            )}

            {/* Content Preview */}
            <div className="space-y-2">
              {document.fullTextContent ? (
                <p className="whitespace-pre-wrap">{document.fullTextContent}</p>
              ) : document.content ? (
                <p className="whitespace-pre-wrap">{document.content}</p>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Document preview not available</p>
                  <p className="text-sm mt-2">PDF viewer integration required</p>
                </div>
              )}
            </div>

            {/* OCR Text Display */}
            {document.ocrProcessed && document.fullTextContent && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">OCR Extracted Text:</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {document.fullTextContent.slice(0, 500)}
                  {document.fullTextContent.length > 500 && '...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Indicator */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="px-4 py-2 border-t text-center">
        <input
          type="range"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => setPage(parseInt(e.target.value))}
          className="w-64"
        />
      </div>
    </div>
  );
}
