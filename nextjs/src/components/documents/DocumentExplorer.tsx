'use client';

import { useDocumentManager } from '@/hooks/useDocumentManager';
import { LegalDocument } from '@/types/documents';
import { useDeferredValue, useState } from 'react';
import { DocumentDragOverlay } from './DocumentDragOverlay';
import { DocumentFilters } from './DocumentFilters';
import { DocumentGridCard } from './DocumentGridCard';
import { DocumentToolbar } from './DocumentToolbar';
import { DocumentTable } from './table/DocumentTable';

interface DocumentExplorerProps {
  currentUserRole?: string;
}

export const DocumentExplorer = ({ currentUserRole = 'Associate' }: DocumentExplorerProps) => {
  const {
    searchTerm, setSearchTerm,
    currentFolder, setCurrentFolder,
    isDetailsOpen, setIsDetailsOpen,
    previewDoc, setPreviewDoc,
    filtered,
    setSelectedDocForHistory,
    handleDragEnter, handleDragLeave, handleDrop, isDragging
  } = useDocumentManager({ enableDragDrop: true });

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [taggingDoc, setTaggingDoc] = useState<LegalDocument | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedDocs.length === filtered.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filtered.map(d => d.id));
    }
  };

  const isSelected = (id: string) => selectedDocs.includes(id);
  const isAllSelected = filtered.length > 0 && selectedDocs.length === filtered.length;

  const handleBulkSummarize = () => {
    console.log('Summarizing', selectedDocs);
  };

  const clearSelection = () => {
    setSelectedDocs([]);
  };

  return (
    <div
      className="flex-1 flex h-full relative overflow-hidden"
      onDragEnter={handleDragEnter}
    >
      {isDragging && (
        <DocumentDragOverlay
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        />
      )}

      <div className="w-64 border-r flex-shrink-0 hidden md:flex bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DocumentFilters currentFolder={currentFolder} setCurrentFolder={setCurrentFolder} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-slate-900">
        <DocumentToolbar
          selectedDocsCount={selectedDocs.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isDetailsOpen={isDetailsOpen}
          setIsDetailsOpen={setIsDetailsOpen}
          isProcessingAI={false}
          onBulkSummarize={handleBulkSummarize}
          onClearSelection={clearSelection}
        />

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {viewMode === 'list' ? (
            <DocumentTable
              documents={filtered}
              viewMode={viewMode}
              selectedDocs={selectedDocs}
              toggleSelection={toggleSelection}
              selectAll={selectAll}
              isAllSelected={isAllSelected}
              isSelected={isSelected}
              setSelectedDocForHistory={setSelectedDocForHistory}
              setTaggingDoc={setTaggingDoc}
              onRowClick={setPreviewDoc}
            />
          ) : (
            <div className="h-full p-4 bg-slate-50 dark:bg-slate-800 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map(doc => (
                  <DocumentGridCard
                    key={doc.id}
                    doc={doc}
                    isSelected={isSelected(doc.id)}
                    onToggleSelection={(id) => toggleSelection(id)}
                    onPreview={setPreviewDoc}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <p>No documents found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
