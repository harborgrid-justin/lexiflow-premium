import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentViewerProps {
  documentId: string;
  documentUrl?: string;
  documentType?: string;
  title?: string;
  onClose?: () => void;
  onDownload?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  documentUrl,
  documentType = 'application/pdf',
  title = 'Document Viewer',
  onClose,
  onDownload,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [documentUrl]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const isPDF = documentType?.includes('pdf');
  const isImage = documentType?.includes('image');
  const isWord = documentType?.includes('word') || documentType?.includes('document');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-100 rounded"
              title="Rotate"
            >
              <RotateCw size={20} />
            </button>
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 hover:bg-gray-100 rounded"
                title="Download"
              >
                <Download size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-full">
              <div
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                }}
                className="bg-white shadow-lg"
              >
                {isPDF && documentUrl && (
                  <iframe
                    src={documentUrl}
                    className="w-[800px] h-[1000px]"
                    title={title}
                  />
                )}
                {isImage && documentUrl && (
                  <img
                    src={documentUrl}
                    alt={title}
                    className="max-w-full h-auto"
                  />
                )}
                {isWord && (
                  <div className="p-8 w-[800px] min-h-[1000px]">
                    <p className="text-gray-500 text-center">
                      Word document preview not available. Please download to view.
                    </p>
                  </div>
                )}
                {!isPDF && !isImage && !isWord && documentUrl && (
                  <iframe
                    src={documentUrl}
                    className="w-[800px] h-[1000px]"
                    title={title}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        {isPDF && (
          <div className="flex items-center justify-center gap-4 p-4 border-t">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
