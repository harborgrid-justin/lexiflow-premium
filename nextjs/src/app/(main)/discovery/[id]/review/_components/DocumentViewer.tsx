'use client';

/**
 * Document Viewer Component
 * Displays document content for review
 */

import { useState } from 'react';
import { Button, Badge } from '@/components/ui';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Mail,
} from 'lucide-react';
import type { ReviewDocument } from '../../../_types';

interface DocumentViewerProps {
  document: ReviewDocument;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalDocuments?: number;
}

export function DocumentViewer({
  document,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  currentIndex = 0,
  totalDocuments = 0,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const getFileIcon = () => {
    const type = document.fileType.toLowerCase();
    if (type.includes('image')) return <Image className="h-6 w-6" />;
    if (type.includes('email') || type.includes('msg')) return <Mail className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            {getFileIcon()}
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm truncate max-w-[200px]">
                {document.fileName}
              </p>
              <p className="text-xs text-slate-500">
                {document.pageCount || 1} page{(document.pageCount || 1) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1 mr-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={onPrevious}
              disabled={!hasPrevious}
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            {totalDocuments > 0 && (
              <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
                {currentIndex + 1} of {totalDocuments}
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onNext}
              disabled={!hasNext}
              icon={<ChevronRight className="h-4 w-4" />}
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              icon={<ZoomOut className="h-4 w-4" />}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[48px] text-center">
              {zoom}%
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              icon={<ZoomIn className="h-4 w-4" />}
            />
          </div>

          {/* Other Controls */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRotate}
              icon={<RotateCw className="h-4 w-4" />}
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<Maximize2 className="h-4 w-4" />}
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<Download className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-4">
        <div
          className="mx-auto bg-white dark:bg-slate-800 shadow-lg transition-transform"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            width: '8.5in',
            minHeight: '11in',
          }}
        >
          {/* Document Preview Placeholder */}
          <div className="p-8">
            {document.extractedText ? (
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                  {document.extractedText}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                {getFileIcon()}
                <p className="mt-4 text-sm">Preview not available</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  icon={<Download className="h-4 w-4" />}
                >
                  Download Original
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      {(document.pageCount || 1) > 1 && (
        <div className="flex items-center justify-center gap-4 p-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            icon={<ChevronLeft className="h-4 w-4" />}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {document.pageCount || 1}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.min(document.pageCount || 1, prev + 1))}
            disabled={currentPage >= (document.pageCount || 1)}
            icon={<ChevronRight className="h-4 w-4" />}
          />
        </div>
      )}
    </div>
  );
}
