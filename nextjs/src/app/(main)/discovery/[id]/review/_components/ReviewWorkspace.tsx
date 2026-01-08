'use client';

/**
 * Review Workspace Component
 * Main review interface with document list, viewer, and coding panel
 *
 * Features:
 * - Document navigation (previous/next with bounds checking)
 * - Auto-load document content on index change
 * - Coding panel integration
 * - Automatic save & next workflow
 * - Keyboard navigation (arrow keys)
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { CodingPanel } from './CodingPanel';
import type { ReviewDocument } from '../../../_types';

interface ReviewWorkspaceProps {
  discoveryRequestId: string;
  documents: ReviewDocument[];
  initialDocId?: string;
}

export function ReviewWorkspace({
  discoveryRequestId,
  documents,
  initialDocId,
}: ReviewWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Find initial document or use first one
  const initialDocument = initialDocId
    ? documents.find((d) => d.id === initialDocId) || documents[0]
    : documents[0];

  const [selectedDocument, setSelectedDocument] = useState<ReviewDocument>(initialDocument);

  // Calculate current index and navigation bounds
  const currentIndex = documents.findIndex((d) => d.id === selectedDocument.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < documents.length - 1;

  // Handle document selection with URL update
  const handleSelectDocument = useCallback(
    (document: ReviewDocument) => {
      setSelectedDocument(document);
      // Update URL without navigation for bookmarking/sharing
      const params = new URLSearchParams(searchParams.toString());
      params.set('docId', document.id);
      router.replace(`/discovery/${discoveryRequestId}/review?${params.toString()}`, {
        scroll: false,
      });
    },
    [discoveryRequestId, router, searchParams]
  );

  // Navigate to previous document with bounds checking
  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      handleSelectDocument(documents[currentIndex - 1]);
    }
  }, [currentIndex, documents, handleSelectDocument, hasPrevious]);

  // Navigate to next document with bounds checking
  const handleNext = useCallback(() => {
    if (hasNext) {
      handleSelectDocument(documents[currentIndex + 1]);
    }
  }, [currentIndex, documents, handleSelectDocument, hasNext]);

  // Handle coding update - refresh to get updated data
  const handleCodingUpdate = useCallback(() => {
    router.refresh();
  }, [router]);

  // Handle save and advance to next document (automatic workflow)
  const handleSaveAndNext = useCallback(() => {
    // Refresh data first, then advance to next document
    router.refresh();
    if (hasNext) {
      // Use setTimeout to ensure the refresh completes first
      setTimeout(() => {
        handleSelectDocument(documents[currentIndex + 1]);
      }, 100);
    }
  }, [router, hasNext, currentIndex, documents, handleSelectDocument]);

  // Keyboard navigation for efficient review workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Arrow key navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  // Note: When documents array changes (e.g., after refresh), React will reconcile
  // the selectedDocument state with the updated data through normal re-rendering

  return (
    <div className="h-full grid grid-cols-12 gap-4">
      {/* Document List - Left Panel */}
      <div className="col-span-3 h-full overflow-hidden">
        <DocumentList
          documents={documents}
          selectedId={selectedDocument.id}
          onSelect={handleSelectDocument}
        />
      </div>

      {/* Document Viewer - Center Panel */}
      <div className="col-span-6 h-full overflow-hidden">
        <DocumentViewer
          document={selectedDocument}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          currentIndex={currentIndex}
          totalDocuments={documents.length}
        />
      </div>

      {/* Coding Panel - Right Panel */}
      {/* Using key prop to reset CodingPanel state when document changes */}
      <div className="col-span-3 h-full overflow-hidden">
        <CodingPanel
          key={selectedDocument.id}
          document={selectedDocument}
          onUpdate={handleCodingUpdate}
          onSaveAndNext={handleSaveAndNext}
          hasNext={hasNext}
        />
      </div>
    </div>
  );
}
