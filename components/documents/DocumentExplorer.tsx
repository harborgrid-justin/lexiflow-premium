
import React, { useState, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import { UserRole, LegalDocument } from '../../types';
import { DocumentVersions } from '../DocumentVersions';
import { Button } from '../common/Button';
import { useDocumentManager } from '../../hooks/useDocumentManager';
import { DocumentTable } from '../document/DocumentTable';
import { DocumentFilters } from '../document/DocumentFilters';
import { DocumentToolbar } from '../document/DocumentToolbar';
import { DocumentDragOverlay } from '../document/DocumentDragOverlay';
import { DocumentPreviewPanel } from '../document/DocumentPreviewPanel';
import { TagManagementModal } from '../document/TagManagementModal';
import { useSelection } from '../../hooks/useSelection';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useNotify } from '../../hooks/useNotify';
import { useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useDocumentDragDrop } from '../../hooks/useDocumentDragDrop';

interface DocumentExplorerProps {
  currentUserRole?: UserRole;
}

export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({ currentUserRole = 'Associate' }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    searchTerm, setSearchTerm, selectedDocForHistory, setSelectedDocForHistory,
    isProcessingAI, handleRestore, handleBulkSummarize: legacySummarize,
    addTag, removeTag, allTags, filtered, currentFolder, setCurrentFolder,
    isDetailsOpen, setIsDetailsOpen, previewDoc, setPreviewDoc, updateDocument
  } = useDocumentManager();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [taggingDoc, setTaggingDoc] = useState<LegalDocument | null>(null);
  
  // Drag & Drop Logic extracted
  const { isDragging, isUploading, setIsUploading, handleDragEnter, handleDragLeave, handleDrop } = useDocumentDragDrop(currentFolder);

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
              queryClient.invalidate([STORES.DOCUMENTS, 'all']);
          }
      }
  );

  return (
    <div 
        className="flex-1 flex h-full relative"
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={e => e.preventDefault()} onDrop={handleDrop}
    >
        {isDragging && <DocumentDragOverlay />}
        
        {/* Left Sidebar: Filters */}
        <div className={cn("w-64 border-r flex-shrink-0 bg-slate-50/50 hidden md:flex", theme.border.default)}>
            <DocumentFilters currentFolder={currentFolder} setCurrentFolder={setCurrentFolder} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            <DocumentToolbar 
                selectedDocsCount={selectedDocs.length} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                viewMode={viewMode} setViewMode={setViewMode} isDetailsOpen={isDetailsOpen} setIsDetailsOpen={setIsDetailsOpen}
                isProcessingAI={isSummarizing} onBulkSummarize={() => summarizeBatch(selectedDocs)} onClearSelection={clearSelection}
            />
            
            <div className="flex-1 overflow-hidden relative">
                <DocumentTable 
                    documents={filtered} viewMode={viewMode} selectedDocs={selectedDocs} toggleSelection={toggleSelection}
                    selectAll={selectAll} isAllSelected={isAllSelected} isSelected={isSelected}
                    setSelectedDocForHistory={setSelectedDocForHistory} setTaggingDoc={setTaggingDoc}
                    onRowClick={setPreviewDoc}
                />
            </div>
        </div>

        {/* Right Sidebar: Preview */}
        {isDetailsOpen && previewDoc && (
            <div className={cn("w-96 border-l flex-shrink-0 bg-white shadow-xl z-20 absolute right-0 top-0 bottom-0 md:static", theme.border.default)}>
                <DocumentPreviewPanel 
                    document={previewDoc} onViewHistory={setSelectedDocForHistory} onUpdate={updateDocument}
                    userRole={currentUserRole} onCloseMobile={() => setIsDetailsOpen(false)}
                />
            </div>
        )}

        {/* Modals */}
        {selectedDocForHistory && <DocumentVersions document={selectedDocForHistory} userRole={currentUserRole} onRestore={handleRestore} onClose={() => setSelectedDocForHistory(null)} />}
        {taggingDoc && <TagManagementModal document={taggingDoc} allTags={allTags} onClose={() => setTaggingDoc(null)} onAddTag={addTag} onRemoveTag={removeTag} />}
    </div>
  );
};
