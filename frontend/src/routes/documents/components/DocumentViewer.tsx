/**
 * DocumentViewer Component
 * PDF and document preview with annotation support
 */

import type { LegalDocument } from '@/types/documents';
import { useTheme } from '@/contexts/ThemeContext';
import { useDocumentViewer } from '../_hooks/useDocumentViewer';

interface DocumentViewerProps {
  document: LegalDocument;
  showAnnotations?: boolean;
  onAddAnnotation?: (annotation: { page: number; text: string; x: number; y: number }) => void;
}

export function DocumentViewer({ document, showAnnotations, onAddAnnotation }: DocumentViewerProps) {
  const { tokens } = useTheme();
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
    <div style={{ backgroundColor: tokens.colors.background }} className="flex flex-col h-full">
      {showAnnotations && (
        <button
          onClick={handleAnnotationAdd}
          style={{
            backgroundColor: tokens.colors.primary,
            color: '#ffffff',
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.lg
          }}
          className="fixed bottom-4 right-4 px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Add Annotation
        </button>
      )}
      {/* Toolbar */}
      <div
        style={{
          backgroundColor: tokens.colors.surface,
          borderBottom: `1px solid ${tokens.colors.border}`
        }}
        className="flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{
                color: tokens.colors.textSecondary,
                opacity: currentPage === 1 ? 0.5 : 1
              }}
              className="p-2 hover:opacity-75 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span style={{ color: tokens.colors.text }} className="text-sm">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              style={{
                color: tokens.colors.textSecondary,
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
              className="p-2 hover:opacity-75 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls */}
          <div
            style={{ borderLeft: `1px solid ${tokens.colors.border}` }}
            className="flex items-center gap-2 pl-4"
          >
            <button
              onClick={zoomOut}
              disabled={zoom === 50}
              style={{
                color: tokens.colors.textSecondary,
                opacity: zoom === 50 ? 0.5 : 1
              }}
              className="p-2 hover:opacity-75 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span style={{ color: tokens.colors.text }} className="text-sm w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoom === 200}
              style={{
                color: tokens.colors.textSecondary,
                opacity: zoom === 200 ? 0.5 : 1
              }}
              className="p-2 hover:opacity-75 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            style={{
              backgroundColor: tokens.colors.surfaceHover,
              color: tokens.colors.text,
              borderRadius: tokens.borderRadius.md
            }}
            className="px-3 py-1.5 text-sm font-medium hover:opacity-90"
          >
            Print
          </button>
          <button
            style={{
              backgroundColor: tokens.colors.surfaceHover,
              color: tokens.colors.text,
              borderRadius: tokens.borderRadius.md
            }}
            className="px-3 py-1.5 text-sm font-medium hover:opacity-90"
          >
            Download
          </button>
        </div>
      </div>

      {/* Document Display */}
      <div className="flex-1 overflow-auto p-8">
        <div
          style={{
            backgroundColor: tokens.colors.surface,
            width: `${8.5 * zoom}px`,
            minHeight: `${11 * zoom}px`,
            boxShadow: tokens.shadows.lg
          }}
          className="mx-auto"
        >
          {/* PDF Preview Placeholder */}
          <div
            style={{
              color: tokens.colors.text,
              fontSize: `${zoom / 8}px`
            }}
            className="p-8 space-y-4"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
              <p style={{ color: tokens.colors.textMuted }} className="text-sm">Page {currentPage} of {totalPages}</p>
            </div>

            {/* Bates Number Display */}
            {document.customFields?.batesNumber && (
              <div style={{ color: tokens.colors.textMuted }} className="text-right text-xs font-mono mb-4">
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
                <div style={{ color: tokens.colors.textMuted }} className="text-center py-12">
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
              <div
                style={{ borderTop: `1px solid ${tokens.colors.border}` }}
                className="mt-8 pt-4"
              >
                <p style={{ color: tokens.colors.textMuted }} className="text-xs mb-2">OCR Extracted Text:</p>
                <p style={{ color: tokens.colors.textSecondary }} className="text-sm whitespace-pre-wrap">
                  {document.fullTextContent.slice(0, 500)}
                  {document.fullTextContent.length > 500 && '...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Indicator */}
      <div
        style={{
          backgroundColor: tokens.colors.surface,
          borderTop: `1px solid ${tokens.colors.border}`
        }}
        className="px-4 py-2 text-center"
      >
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
