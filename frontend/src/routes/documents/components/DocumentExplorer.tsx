import { useState } from 'react';

import { VirtualGrid } from '@/components/organisms/VirtualGrid/VirtualGrid';
import { useDocumentManager } from '@/hooks/useDocumentManager';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation } from '@/hooks/useQueryHooks';
import { useSelection } from '@/hooks/useSelection';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { type LegalDocument, type UserRole } from '@/types';
import { queryKeys } from '@/utils/queryKeys';

import { DocumentDragOverlay } from './DocumentDragOverlay';
import { DocumentFilters } from './DocumentFilters';
import { DocumentGridCard } from './DocumentGridCard';
import { DocumentToolbar } from './DocumentToolbar';
import { DocumentVersions } from './DocumentVersions';
import { DocumentTable } from './table/DocumentTable';
import { TagManagementModal } from './TagManagementModal';
import { DocumentPreviewPanel } from './viewer/DocumentPreviewPanel';
// ✅ Migrated to backend API (2025-12-21)

interface DocumentExplorerProps {
    currentUserRole?: UserRole;
}

export const DocumentExplorer = ({ currentUserRole = 'Associate' }: DocumentExplorerProps) => {
    const { theme } = useTheme();
    const notify = useNotify();

    // Enhanced useDocumentManager with drag-drop functionality enabled
    const {
        searchTerm, setSearchTerm, selectedDocForHistory, setSelectedDocForHistory,
        handleRestore,
        addTag, removeTag, allTags, filtered, currentFolder, setCurrentFolder,
        isDetailsOpen, setIsDetailsOpen, previewDoc, setPreviewDoc, updateDocument, isLoading,
        isDragging, handleDragEnter, handleDragLeave, handleDrop
    } = useDocumentManager({ enableDragDrop: true });

    // const _deferredSearchTerm = useDeferredValue(searchTerm);

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

    const renderGridCell = (item: unknown) => {
        const doc = item as LegalDocument;
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
