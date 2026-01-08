import React, { useState, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Printer,
  X,
} from 'lucide-react';

interface DocumentPreviewProps {
  documentId: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  onClose?: () => void;
}

/**
 * DocumentPreview Component
 *
 * Universal document preview with support for:
 * - PDF documents (using pdfjs)
 * - Images (PNG, JPG, GIF, etc.)
 * - Word documents (converted to PDF)
 * - Text files
 * - OCR-processed documents
 *
 * Features:
 * - Zoom controls
 * - Page navigation (for multi-page docs)
 * - Rotation
 * - Download
 * - Print
 * - Fullscreen mode
 */
export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentId,
  fileUrl,
  fileName,
  mimeType,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, this would load the document via API
      // For PDFs, we would use pdfjs-dist
      // For images, we can directly display them
      // For other formats, we might need conversion

      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock total pages for PDFs
      if (mimeType?.includes('pdf')) {
        setTotalPages(5);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load document');
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDownload = () => {
    // In real implementation, this would trigger file download
    const link = document.createElement('a');
    link.href = fileUrl || '';
    link.download = fileName || 'document';
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </div>
      );
    }

    // Render based on MIME type
    if (mimeType?.includes('image')) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <img
            src={fileUrl || '/placeholder-image.png'}
            alt={fileName}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      );
    }

    if (mimeType?.includes('pdf')) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          {/* In real implementation, use pdfjs-dist to render PDF */}
          <div
            className="bg-white shadow-lg"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              width: '612px', // Letter size
              height: '792px',
              transition: 'transform 0.2s ease',
            }}
          >
            <div className="p-8 h-full bg-white">
              <h1 className="text-2xl font-bold mb-4">
                Sample PDF Document
              </h1>
              <p className="mb-4">Page {currentPage} of {totalPages}</p>
              <p className="text-gray-600">
                This is a preview of the PDF document. In a real implementation,
                this would be rendered using PDF.js or similar library.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (mimeType?.includes('text')) {
      return (
        <div className="h-full overflow-auto p-8">
          <pre
            className="font-mono text-sm whitespace-pre-wrap"
            style={{
              fontSize: `${zoom}%`,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* In real implementation, load and display text content */}
            Sample text document content would be displayed here.
          </pre>
        </div>
      );
    }

    // Fallback for unsupported types
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <FileText className="w-16 h-16 mb-4" />
        <p>Preview not available for this file type</p>
        <button
          onClick={handleDownload}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download to view
        </button>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-900 ${
        fullscreen ? 'fixed inset-0 z-50' : 'h-full rounded-lg border border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span className="font-medium truncate max-w-xs">
            {fileName || 'Document Preview'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-3 text-sm">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

          {/* Page navigation (for PDFs) */}
          {mimeType?.includes('pdf') && totalPages > 1 && (
            <>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
            </>
          )}

          {/* Other controls */}
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {onClose && (
            <>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950">
        {renderPreview()}
      </div>
    </div>
  );
};

export default DocumentPreview;
