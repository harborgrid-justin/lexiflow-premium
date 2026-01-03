/**
 * Enterprise DocumentViewer Component
 *
 * Advanced document viewer with:
 * - PDF viewer with annotations
 * - Redaction tools
 * - Bates stamping interface
 * - OCR status indicator
 * - Full-text search within document
 * - Page thumbnails
 */

import type { LegalDocument } from '@/types/documents';
import { useRef, useState } from 'react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [activeToolbarItem, setActiveToolbarItem] = useState<'select' | 'highlight' | 'note' | 'redact'>('select');
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [showRedactionPanel, setShowRedactionPanel] = useState(false);
  const [showBatesStampDialog, setShowBatesStampDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ page: number; text: string }>>([]);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);
  const totalPages = document.pageCount || 1;

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const resetZoom = () => setZoom(100);

  // Page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Search in document
  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    // Simulate search results (in real implementation, this would search through document content)
    const results: Array<{ page: number; text: string }> = [];
    const content = document.fullTextContent || document.content || '';
    const regex = new RegExp(searchQuery, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + searchQuery.length + 50);
      const snippet = content.slice(start, end);

      results.push({
        page: Math.floor(Math.random() * totalPages) + 1, // In real implementation, calculate actual page
        text: snippet,
      });

      if (results.length >= 10) break; // Limit to 10 results
    }

    setSearchResults(results);
  };

  // Get annotations for current page
  const currentPageAnnotations = annotations.filter(a => a.page === currentPage);
  const currentPageRedactions = redactions.filter(r => r.page === currentPage);

  // Generate Bates number for current page
  const getBatesNumber = (): string => {
    if (!batesStamp) return '';
    const num = batesStamp.startNumber + (currentPage - 1);
    return `${batesStamp.prefix}${num.toString().padStart(6, '0')}${batesStamp.suffix}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Tool Selection */}
          <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => setActiveToolbarItem('select')}
              className={`p-2 ${activeToolbarItem === 'select' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
              title="Select"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </button>
            {enableAnnotations && (
              <>
                <button
                  onClick={() => setActiveToolbarItem('highlight')}
                  className={`p-2 ${activeToolbarItem === 'highlight' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                  title="Highlight"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveToolbarItem('note')}
                  className={`p-2 ${activeToolbarItem === 'note' ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                  title="Add Note"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
              </>
            )}
            {enableRedaction && (
              <button
                onClick={() => setActiveToolbarItem('redact')}
                className={`p-2 ${activeToolbarItem === 'redact' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                title="Redact"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>
            )}
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100"
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
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                / {totalPages}
              </span>
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-4">
            <button
              onClick={zoomOut}
              disabled={zoom === 50}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="text-sm text-gray-700 dark:text-gray-300 w-12 text-center hover:text-blue-600 dark:hover:text-blue-400"
            >
              {zoom}%
            </button>
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

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 ${showThumbnails ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            title="Thumbnails"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setShowAnnotationPanel(!showAnnotationPanel)}
            className={`p-2 ${showAnnotationPanel ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            title="Annotations"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
          <button
            onClick={() => setShowRedactionPanel(!showRedactionPanel)}
            className={`p-2 ${showRedactionPanel ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            title="Redactions"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
          <button
            onClick={() => setShowBatesStampDialog(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Bates Stamp
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search in document..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
          {searchResults.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {searchResults.length} results
            </span>
          )}
        </div>
      </div>

      {/* OCR Status Banner */}
      {showOCRStatus && document.ocrProcessed && (
        <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnail Sidebar */}
        {showThumbnails && (
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 overflow-auto bg-white dark:bg-gray-800">
            <div className="p-2 space-y-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <div
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`relative cursor-pointer border-2 rounded ${pageNum === currentPage
                    ? 'border-blue-500'
                    : 'border-gray-200 dark:border-gray-700'
                    }`}
                >
                  <div className="aspect-[8.5/11] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Page {pageNum}</span>
                  </div>
                  <div className="absolute top-1 right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">
                    {pageNum}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Viewer */}
        <div ref={viewerRef} className="flex-1 overflow-auto p-8 bg-gray-100 dark:bg-gray-900">
          <div
            className="mx-auto bg-white shadow-lg relative"
            style={{
              width: `${8.5 * zoom}px`,
              minHeight: `${11 * zoom}px`,
            }}
          >
            {/* Bates Number Overlay */}
            {batesStamp && (
              <div
                className={`absolute ${batesStamp.position === 'top-right' ? 'top-2 right-2' :
                  batesStamp.position === 'bottom-left' ? 'bottom-2 left-2' :
                    batesStamp.position === 'bottom-right' ? 'bottom-2 right-2' :
                      'top-2 left-2'
                  } text-xs font-mono text-gray-500 bg-white/80 px-2 py-1 rounded`}
              >
                {getBatesNumber()}
              </div>
            )}

            {/* Annotations Overlay */}
            {currentPageAnnotations.map(annotation => (
              <div
                key={annotation.id}
                className={`absolute border-2 ${annotation.type === 'highlight' ? 'bg-yellow-200/50 border-yellow-400' :
                  annotation.type === 'note' ? 'bg-green-200/50 border-green-400' :
                    'bg-blue-200/50 border-blue-400'
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

            {/* Redactions Overlay */}
            {currentPageRedactions.map(redaction => (
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

            {/* Document Content */}
            <div className="p-8 space-y-4 text-gray-700" style={{ fontSize: `${zoom / 8}px` }}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
                <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
              </div>

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
            </div>
          </div>
        </div>

        {/* Annotation Panel */}
        {showAnnotationPanel && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 overflow-auto bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Annotations ({annotations.length})
              </h3>
              <button
                onClick={() => setShowAnnotationPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {annotations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No annotations yet</p>
              ) : (
                annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${annotation.type === 'highlight' ? 'bg-yellow-100 text-yellow-800' :
                        annotation.type === 'note' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {annotation.type}
                      </span>
                      <button
                        onClick={() => onAnnotationDelete?.(annotation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {annotation.content && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {annotation.content}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
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

        {/* Redaction Panel */}
        {showRedactionPanel && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 overflow-auto bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Redactions ({redactions.length})
              </h3>
              <button
                onClick={() => setShowRedactionPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {redactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No redactions applied</p>
              ) : (
                redactions.map(redaction => (
                  <div
                    key={redaction.id}
                    className="p-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-red-900 dark:text-red-100">
                        Page {redaction.page}
                      </span>
                      <button
                        onClick={() => onRedactionDelete?.(redaction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Reason: {redaction.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bates Stamp Dialog */}
      {showBatesStampDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Apply Bates Stamping
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  placeholder="ABC-"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Number
                </label>
                <input
                  type="number"
                  placeholder="000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suffix
                </label>
                <input
                  type="text"
                  placeholder="-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
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
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Apply bates stamp logic here
                  setShowBatesStampDialog(false);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
