import React, { useState, useCallback, useRef } from 'react';
import { UserRole, LegalDocument } from '../../types';
import { DocumentVersions } from './DocumentVersions';
import { useDocumentManager } from '@/hooks/useDocumentManager';
import { DocumentTable } from './table/DocumentTable';
import { DocumentFilters } from './DocumentFilters';
import { DocumentToolbar } from './DocumentToolbar';
import { DocumentDragOverlay } from './DocumentDragOverlay';
import { DocumentPreviewPanel } from './viewer/DocumentPreviewPanel';
import { TagManagementModal } from './TagManagementModal';
import { useSelection } from '@/hooks/useSelection';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useNotify } from '@/hooks/useNotify';
import { useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { queryKeys } from '../../utils/queryKeys';
import { VirtualGrid } from '../common/VirtualGrid';
import { DocumentGridCard } from './DocumentGridCard';

interface DocumentExplorerProps {
  currentUserRole?: UserRole;
}

export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({ currentUserRole = 'Associate' }) => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Enhanced useDocumentManager with drag-drop functionality enabled
  const {
    searchTerm, setSearchTerm, selectedDocForHistory, setSelectedDocForHistory,
    isProcessingAI, handleRestore,
    addTag, removeTag, allTags, filtered, currentFolder, setCurrentFolder,
    isDetailsOpen, setIsDetailsOpen, previewDoc, setPreviewDoc, updateDocument, isLoading,
    isDragging, isUploading, handleDragEnter, handleDragLeave, handleDragOver, handleDrop
  } = useDocumentManager({ enableDragDrop: true });

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [taggingDoc, setTaggingDoc] = useState<LegalDocument | null>(null);

  const {
    selectedIds: selectedDocs, toggleSelection, selectAll,
    clearSelection, isSelected, isAllSelected
  } = useSelection(filtered);

  const { mutate: summarizeBatch, isLoading: isSummarizing } = useMutation(
      DataService.documents.summarizeBatch,
      {
          onSuccess: (count) => {
              notify.success(`AI Summary generated for ${count} documents.`);
              clearSelection();
              queryClient.invalidate(queryKeys.documents.all());
          }
      }
  );

  const renderGridCell = (doc: LegalDocument) => {
    return (
        <DocumentGridCard 
            doc={doc}
            isSelected={isSelected(doc.id)}
            onToggleSelection={(id, e) => toggleSelection(id, e)}
            onPreview={setPreviewDoc}
        />
    );
  };

  return (
    <div 
        className="flex-1 flex h-full relative"
        onDragEnter={handleDragEnter}
    >
        {isDragging && <DocumentDragOverlay onDrop={handleDrop} onDragLeave={handleDragLeave} />}
        
        <div className={cn("w-64 border-r flex-shrink-0 hidden md:flex", theme.border.default, theme.surface.highlight)}>
            <DocumentFilters currentFolder={currentFolder} setCurrentFolder={setCurrentFolder} />
        </div>

        <div className={cn("flex-1 flex flex-col min-w-0 relative", theme.surface.default)}>
            <DocumentToolbar 
                selectedDocsCount={selectedDocs.length} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                viewMode={viewMode} setViewMode={setViewMode} isDetailsOpen={isDetailsOpen} setIsDetailsOpen={setIsDetailsOpen}
                isProcessingAI={isSummarizing} onBulkSummarize={() => summarizeBatch(selectedDocs)} onClearSelection={clearSelection}
            />
            
            <div className="flex-1 overflow-hidden relative">
                {viewMode === 'list' ? (
                    <DocumentTable 
                        documents={filtered} viewMode={viewMode} selectedDocs={selectedDocs} toggleSelection={toggleSelection}
                        selectAll={selectAll} isAllSelected={isAllSelected} isSelected={isSelected}
                        setSelectedDocForHistory={setSelectedDocForHistory} setTaggingDoc={setTaggingDoc}
                        onRowClick={setPreviewDoc}
                    />
                ) : (
                    <div className={cn("h-full p-4", theme.surface.highlight)}>
                        <VirtualGrid 
                            items={filtered} 
                            height="100%"
                            itemHeight={200} 
                            itemWidth={180} 
                            renderItem={renderGridCell}
                            gap={16}
                            emptyMessage={isLoading ? "Searching documents..." : "No documents found"}
                        />
                    </div>
                )}
            </div>
        </div>

        {isDetailsOpen && previewDoc && (
            <div className={cn("w-96 border-l flex-shrink-0 shadow-xl z-20 absolute right-0 top-0 bottom-0 md:static", theme.surface.default, theme.border.default)}>
                <DocumentPreviewPanel 
                    document={previewDoc} onViewHistory={setSelectedDocForHistory} onUpdate={updateDocument}
                    userRole={currentUserRole} onCloseMobile={() => setIsDetailsOpen(false)}
                />
            </div>
        )}

        {selectedDocForHistory && <DocumentVersions document={selectedDocForHistory} userRole={currentUserRole} onRestore={handleRestore} onClose={() => setSelectedDocForHistory(null)} />}
        {taggingDoc && <TagManagementModal document={taggingDoc} allTags={allTags} onClose={() => setTaggingDoc(null)} onAddTag={addTag} onRemoveTag={removeTag} />}
    </div>
  );
};