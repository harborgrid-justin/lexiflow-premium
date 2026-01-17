/**
 * Enterprise DocumentViewer Component
 *
 * Advanced document viewer with:
 * - Text/PDF preview surface (text fallback)
 * - Annotations and redactions overlays
 * - Bates stamping overlay + configurator
 * - OCR processed status banner
 * - Full-text search within document
 * - Page thumbnails
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import type { LegalDocument } from '@/types/documents';

interface Annotation {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'highlight' | 'note' | 'redact';
  content?: string;
  color?: string;
  author: string;
  createdAt: string;
}

interface Redaction {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  reason: string;
}

interface BatesStamp {
  prefix: string;
  startNumber: number;
  suffix: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface DocumentViewerProps {
  document: LegalDocument;
  annotations?: Annotation[];
  redactions?: Redaction[];
  batesStamp?: BatesStamp;
  showOCRStatus?: boolean;
  enableAnnotations?: boolean;
  enableRedaction?: boolean;
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id' | 'author' | 'createdAt'>) => void;
  onAnnotationDelete?: (id: string) => void;
  onRedactionAdd?: (redaction: Omit<Redaction, 'id'>) => void;
  onRedactionDelete?: (id: string) => void;
  onBatesStampApply?: (stamp: BatesStamp) => void;
}

type ToolbarItem = 'select' | 'highlight' | 'note' | 'redact';

const DEFAULT_BATES_STAMP: BatesStamp = {
  prefix: '',
  startNumber: 1,
  suffix: '',
  position: 'bottom-right',
};

export function DocumentViewer({
  document,
  annotations = [],
  redactions = [],
  batesStamp,
  showOCRStatus = true,
  enableAnnotations = true,
  enableRedaction = true,
  onAnnotationAdd,
  onAnnotationDelete,
  onRedactionAdd,
  onRedactionDelete,
  onBatesStampApply,
}: DocumentViewerProps) {
  const totalPages = document.pageCount || 1;

  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [activeToolbarItem, setActiveToolbarItem] = useState<ToolbarItem>('select');
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [showRedactionPanel, setShowRedactionPanel] = useState(false);
  const [showBatesStampDialog, setShowBatesStampDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ page: number; text: string }>>([]);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [batesDraft, setBatesDraft] = useState<BatesStamp>(batesStamp ?? DEFAULT_BATES_STAMP);

  const viewerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBatesDraft(batesStamp ?? DEFAULT_BATES_STAMP);
  }, [batesStamp]);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const resetZoom = () => setZoom(100);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    requestAnimationFrame(() => {
      viewerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  };

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const content = document.fullTextContent || document.content || '';
    const regex = new RegExp(escapeRegExp(query), 'gi');
    const results: Array<{ page: number; text: string }> = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + query.length + 50);
      const snippet = content.slice(start, end);
      results.push({
        page: Math.min(totalPages, Math.max(1, Math.floor((match.index / Math.max(1, content.length)) * totalPages) + 1)),
        text: snippet,
      });
      if (results.length >= 10) break;
    }

    setSearchResults(results);
  };

  const currentPageAnnotations = useMemo(
    () => annotations.filter((a) => a.page === currentPage),
    [annotations, currentPage]
  );
  const currentPageRedactions = useMemo(
    () => redactions.filter((r) => r.page === currentPage),
    [redactions, currentPage]
  );

  const getBatesNumber = (): string => {
    if (!batesStamp) return '';
    const num = batesStamp.startNumber + (currentPage - 1);
    return `${batesStamp.prefix}${num.toString().padStart(6, '0')}${batesStamp.suffix}`;
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const surface = contentRef.current;
    if (!surface) return;

    const rect = surface.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const x = clamp(xPercent, 0, 95);
    const y = clamp(yPercent, 0, 95);

    if (activeToolbarItem === 'highlight' || activeToolbarItem === 'note') {
      if (!enableAnnotations || !onAnnotationAdd) return;
      onAnnotationAdd({
        page: currentPage,
        x,
        y,
        width: 10,
        height: 3,
        type: activeToolbarItem,
        content: activeToolbarItem === 'note' ? 'Note' : undefined,
        color: activeToolbarItem === 'highlight' ? '#FDE68A' : undefined,
      });
      setShowAnnotationPanel(true);
      return;
    }

    if (activeToolbarItem === 'redact') {
      if (!enableRedaction || !onRedactionAdd) return;
      onRedactionAdd({
        page: currentPage,
        x,
        y,
        width: 12,
        height: 4,
        reason: 'Redacted',
      });
      setShowRedactionPanel(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-surfaceRaised)]">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-borderLight)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-md">
            <button
              onClick={() => setActiveToolbarItem('select')}
              className={`p-2 ${activeToolbarItem === 'select' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
              title="Select"
              type="button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </button>

            {enableAnnotations && (
              <>
                <button
                  onClick={() => setActiveToolbarItem('highlight')}
                  className={`p-2 ${activeToolbarItem === 'highlight' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                  title="Highlight"
                  type="button"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveToolbarItem('note')}
                  className={`p-2 ${activeToolbarItem === 'note' ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                  title="Add Note"
                  type="button"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </button>
              </>
            )}

            {enableRedaction && (
              <button
                onClick={() => setActiveToolbarItem('redact')}
                className={`p-2 ${activeToolbarItem === 'redact' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                title="Redact"
                type="button"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-[var(--color-textMuted)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm text-center border border-[var(--color-border)] rounded"
              />
              <span className="text-sm text-[var(--color-text)]">/ {totalPages}</span>
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-[var(--color-textMuted)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-4">
            <button
              onClick={zoomOut}
              disabled={zoom === 50}
              className="p-2 text-[var(--color-textMuted)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="text-sm text-[var(--color-text)] w-12 text-center hover:text-[var(--color-primary)]"
              type="button"
            >
              {zoom}%
            </button>
            <button
              onClick={zoomIn}
              disabled={zoom === 200}
              className="p-2 text-[var(--color-textMuted)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails((v) => !v)}
            className={`p-2 ${showThumbnails ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            title="Thumbnails"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>

          {enableAnnotations && (
            <button
              onClick={() => setShowAnnotationPanel((v) => !v)}
              className={`p-2 ${showAnnotationPanel ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
              title="Annotations"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </button>
          )}

          {enableRedaction && (
            <button
              onClick={() => setShowRedactionPanel((v) => !v)}
              className={`p-2 ${showRedactionPanel ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
              title="Redactions"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </button>
          )}

          <button
            onClick={() => setShowBatesStampDialog(true)}
            className="px-3 py-1.5 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surfaceRaised)] rounded hover:bg-[var(--color-backgroundTertiary)]"
            type="button"
          >
            Bates Stamp
          </button>
        </div>
      </div>

      <div className="px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-borderLight)]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder="Search in document..."
            className="flex-1 px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primaryDark)]"
            type="button"
          >
            Search
          </button>
          {searchResults.length > 0 && (
            <span className="text-sm text-[var(--color-textMuted)]">{searchResults.length} results</span>
          )}
        </div>
      </div>

      {showOCRStatus && document.ocrProcessed && (
        <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                OCR Processed - Full text search available
              </span>
            </div>
            {document.ocrProcessedAt && (
              <span className="text-xs text-purple-700 dark:text-purple-300">
                Processed: {new Date(document.ocrProcessedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {showThumbnails && (
          <div className="w-48 border-r border-[var(--color-borderLight)] overflow-auto bg-[var(--color-surface)]">
            <div className="p-2 space-y-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`relative cursor-pointer border-2 rounded w-full text-left ${pageNum === currentPage ? 'border-blue-500' : 'border-[var(--color-borderLight)] '
                    }`}
                  type="button"
                >
                  <div className="aspect-[8.5/11] bg-[var(--color-surfaceRaised)] flex items-center justify-center">
                    <span className="text-xs text-[var(--color-textMuted)]">Page {pageNum}</span>
                  </div>
                  <div className="absolute top-1 right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">
                    {pageNum}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={viewerRef} className="flex-1 overflow-auto p-8 bg-[var(--color-surfaceRaised)]">
          <div
            ref={contentRef}
            onClick={handleContentClick}
            className="mx-auto bg-[var(--color-surface)] shadow-lg relative"
            style={{
              width: `${8.5 * zoom}px`,
              minHeight: `${11 * zoom}px`,
            }}
            role="presentation"
          >
            {batesStamp && (
              <div
                className={`absolute ${batesStamp.position === 'top-right'
                    ? 'top-2 right-2'
                    : batesStamp.position === 'bottom-left'
                      ? 'bottom-2 left-2'
                      : batesStamp.position === 'bottom-right'
                        ? 'bottom-2 right-2'
                        : 'top-2 left-2'
                  } text-xs font-mono text-[var(--color-textMuted)] bg-[var(--color-surface)]/80 px-2 py-1 rounded`}
              >
                {getBatesNumber()}
              </div>
            )}

            {currentPageAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`absolute border-2 ${annotation.type === 'highlight'
                    ? 'bg-yellow-200/50 border-yellow-400'
                    : annotation.type === 'note'
                      ? 'bg-green-200/50 border-green-400'
                      : 'bg-blue-200/50 border-blue-400'
                  }`}
                style={{
                  left: `${annotation.x}%`,
                  top: `${annotation.y}%`,
                  width: `${annotation.width}%`,
                  height: `${annotation.height}%`,
                }}
                title={annotation.content}
              />
            ))}

            {currentPageRedactions.map((redaction) => (
              <div
                key={redaction.id}
                className="absolute bg-black"
                style={{
                  left: `${redaction.x}%`,
                  top: `${redaction.y}%`,
                  width: `${redaction.width}%`,
                  height: `${redaction.height}%`,
                }}
                title={`Redacted: ${redaction.reason}`}
              />
            ))}

            <div className="p-8 space-y-4 text-[var(--color-text)]" style={{ fontSize: `${zoom / 8}px` }}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
                <p className="text-sm text-[var(--color-textMuted)]">
                  Page {currentPage} of {totalPages}
                </p>
              </div>

              <div className="space-y-2">
                {document.fullTextContent ? (
                  <p className="whitespace-pre-wrap">{document.fullTextContent}</p>
                ) : document.content ? (
                  <p className="whitespace-pre-wrap">{document.content}</p>
                ) : (
                  <div className="text-center py-12 text-[var(--color-textMuted)]">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>Document preview not available</p>
                    <p className="text-sm mt-2">PDF viewer integration required</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showAnnotationPanel && enableAnnotations && (
          <div className="w-80 border-l border-[var(--color-borderLight)] overflow-auto bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[var(--color-text)]">Annotations ({annotations.length})</h3>
              <button
                onClick={() => setShowAnnotationPanel(false)}
                className="text-[var(--color-textMuted)] hover:text-[var(--color-textMuted)]"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {annotations.length === 0 ? (
                <p className="text-sm text-[var(--color-textMuted)] text-center py-8">No annotations yet</p>
              ) : (
                annotations.map((annotation) => (
                  <div key={annotation.id} className="p-3 border border-[var(--color-borderLight)] rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${annotation.type === 'highlight'
                            ? 'bg-yellow-100 text-yellow-800'
                            : annotation.type === 'note'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                      >
                        {annotation.type}
                      </span>
                      <button
                        onClick={() => onAnnotationDelete?.(annotation.id)}
                        className="text-red-600 hover:text-red-700"
                        type="button"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {annotation.content && <p className="text-sm text-[var(--color-text)] mb-2">{annotation.content}</p>}

                    <div className="text-xs text-[var(--color-textMuted)]">
                      <div>Page {annotation.page}</div>
                      <div>By {annotation.author}</div>
                      <div>{new Date(annotation.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showRedactionPanel && enableRedaction && (
          <div className="w-80 border-l border-[var(--color-borderLight)] overflow-auto bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[var(--color-text)]">Redactions ({redactions.length})</h3>
              <button
                onClick={() => setShowRedactionPanel(false)}
                className="text-[var(--color-textMuted)] hover:text-[var(--color-textMuted)]"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {redactions.length === 0 ? (
                <p className="text-sm text-[var(--color-textMuted)] text-center py-8">No redactions applied</p>
              ) : (
                redactions.map((redaction) => (
                  <div
                    key={redaction.id}
                    className="p-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-red-900 dark:text-red-100">Page {redaction.page}</span>
                      <button
                        onClick={() => onRedactionDelete?.(redaction.id)}
                        className="text-red-600 hover:text-red-700"
                        type="button"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200">Reason: {redaction.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showBatesStampDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface)] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Apply Bates Stamping</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1" htmlFor="bates-prefix">
                  Prefix
                </label>
                <input
                  id="bates-prefix"
                  type="text"
                  value={batesDraft.prefix}
                  onChange={(e) => setBatesDraft((prev) => ({ ...prev, prefix: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1" htmlFor="bates-start">
                  Start Number
                </label>
                <input
                  id="bates-start"
                  type="number"
                  value={batesDraft.startNumber}
                  onChange={(e) => setBatesDraft((prev) => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1" htmlFor="bates-suffix">
                  Suffix
                </label>
                <input
                  id="bates-suffix"
                  type="text"
                  value={batesDraft.suffix}
                  onChange={(e) => setBatesDraft((prev) => ({ ...prev, suffix: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1" htmlFor="bates-position">
                  Position
                </label>
                <select
                  id="bates-position"
                  value={batesDraft.position}
                  onChange={(e) =>
                    setBatesDraft((prev) => ({
                      ...prev,
                      position: e.target.value as BatesStamp['position'],
                    }))
                  }
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowBatesStampDialog(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surfaceRaised)] rounded-md hover:bg-[var(--color-backgroundTertiary)]"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onBatesStampApply?.(batesDraft);
                  setShowBatesStampDialog(false);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primaryDark)]"
                type="button"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
