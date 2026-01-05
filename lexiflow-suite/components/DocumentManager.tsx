
import React, { useState, useTransition, useCallback, useDeferredValue, useMemo, Suspense } from 'react';
import { Search, Plus, Share2, Split, Wand2, X, Folder, Layout, ChevronRight, Filter, Info } from 'lucide-react';
import { UserRole, LegalDocument } from '../types.ts';
import { DocumentVersions } from './DocumentVersions.tsx';
import { Button } from './common/Button.tsx';
import { Modal } from './common/Modal.tsx';
import { useDocumentManager } from '../hooks/useDocumentManager.ts';
import { DocumentTable } from './document/DocumentTable.tsx';
import { DocumentFilters } from './document/DocumentFilters.tsx';
import { useSelection } from '../hooks/useSelection.ts';
import { FileIcon, TagList } from './common/Primitives.tsx';
import { PageHeader } from './common/PageHeader.tsx';

interface DocumentManagerProps {
  currentUserRole?: UserRole;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ currentUserRole = 'Associate' }) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedDocForHistory,
    setSelectedDocForHistory,
    isProcessingAI,
    handleRestore,
    handleBulkSummarize,
    addTag,
    removeTag,
    allTags,
    documents,
    currentFolder,
    setCurrentFolder,
    isDetailsOpen,
    setIsDetailsOpen,
    previewDoc,
    setPreviewDoc
  } = useDocumentManager();

  const deferredSearch = useDeferredValue(searchTerm);

  const filtered = useMemo(() => {
    return documents.filter(d => {
        const inFolder = currentFolder === 'root' ? true : d.folderId === currentFolder;
        const lowerTerm = deferredSearch.toLowerCase();
        const matchesSearch = d.title.toLowerCase().includes(lowerTerm) || d.tags.some(t => t.toLowerCase().includes(lowerTerm));
        return matchesSearch && (deferredSearch ? true : inFolder);
    });
  }, [documents, deferredSearch, currentFolder]);

  const {
    selectedIds: selectedDocs,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected
  } = useSelection(filtered);

  const [taggingDoc, setTaggingDoc] = useState<LegalDocument | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [isPending, startTransition] = useTransition();

  const handleFolderChange = useCallback((folder: string) => {
      startTransition(() => {
          setCurrentFolder(folder);
      });
  }, [setCurrentFolder]);

  const handleRowClick = useCallback((doc: LegalDocument) => {
      setPreviewDoc(doc);
  }, [setPreviewDoc]);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in relative">
       {/* Component ID Badge */}
       <div className="absolute top-2 right-6 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl opacity-0 hover:opacity-100 transition-opacity">
          DM-01
        </span>
      </div>

      {selectedDocForHistory && (
        <DocumentVersions 
          document={selectedDocForHistory} 
          userRole={currentUserRole} 
          onRestore={handleRestore}
          onClose={() => setSelectedDocForHistory(null)}
        />
      )}

      <Modal isOpen={!!taggingDoc} onClose={() => { setTaggingDoc(null); setNewTagInput(''); }} title="Manage Document Tags" size="sm">
        <div className="p-6">
            <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Current Tags</label>
                <div className="flex flex-wrap gap-2">
                    {taggingDoc?.tags.length === 0 && <span className="text-sm text-slate-400 italic">No tags assigned.</span>}
                    {taggingDoc?.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm border border-blue-100">
                            {tag}
                            <button onClick={() => removeTag(taggingDoc!.id, tag)} className="ml-2 text-blue-400 hover:text-blue-600"><X className="h-3 w-3"/></button>
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Add New Tag</label>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type new tag name..."
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                    />
                    <Button size="sm" onClick={() => { addTag(taggingDoc!.id, newTagInput); setNewTagInput(''); }} disabled={!newTagInput.trim()}>Add</Button>
                </div>
            </div>
        </div>
      </Modal>

      <div className="px-6 pt-6 pb-2 shrink-0">
          <PageHeader 
              title="Documents" 
              subtitle={
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Folder className="h-3 w-3 mr-1"/>
                    <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => handleFolderChange('root')}>Root</span>
                    {currentFolder !== 'root' && (
                        <>
                            <ChevronRight className="h-3 w-3 mx-1"/>
                            <span className="font-bold text-slate-800 capitalize">{currentFolder}</span>
                        </>
                    )}
                  </div>
              }
              actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Share2} onClick={() => alert("Secure Share Link Generated")}>Share</Button>
                    <Button variant="primary" icon={Plus}>Upload</Button>
                </div>
              }
          />
      </div>

      <div className={`flex-1 min-h-0 overflow-hidden px-6 pb-6 pt-2 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
          <div className="flex gap-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="hidden md:block w-64 border-r border-slate-200 bg-slate-50/30 shrink-0">
                <DocumentFilters 
                    currentFolder={currentFolder} 
                    setCurrentFolder={handleFolderChange} 
                />
            </div>

            <div className={`flex-1 flex flex-col min-w-0 bg-white`}>
                <div className="h-14 px-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                placeholder="Search in current folder..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-3 items-center ml-4">
                        {selectedDocs.length > 0 && (
                            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full border border-blue-100 animate-in fade-in slide-in-from-right-2">
                                <span className="text-xs text-blue-700 font-bold mr-3">{selectedDocs.length} Selected</span>
                                <button className="text-blue-600 hover:text-blue-800 mr-3" title="Compare"><Split className="h-4 w-4"/></button>
                                <button className="text-blue-600 hover:text-blue-800" title="Summarize" onClick={() => { handleBulkSummarize(); clearSelection(); }}>
                                    {isProcessingAI ? <span className="animate-spin text-xs">...</span> : <Wand2 className="h-4 w-4"/>}
                                </button>
                            </div>
                        )}
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <button 
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                            className={`p-1.5 rounded transition-colors ${isDetailsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                            <Layout className="h-4 w-4"/>
                        </button>
                    </div>
                </div>

                <DocumentTable 
                    documents={filtered}
                    selectedDocs={selectedDocs}
                    toggleSelection={toggleSelection}
                    selectAll={selectAll}
                    isAllSelected={isAllSelected}
                    isSelected={isSelected}
                    setSelectedDocForHistory={setSelectedDocForHistory}
                    setTaggingDoc={setTaggingDoc}
                    onRowClick={handleRowClick}
                />
            </div>

            {isDetailsOpen && (
                <aside className="w-80 border-l border-slate-200 bg-slate-50/50 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300 shrink-0">
                    {previewDoc ? (
                        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Inspector...</div>}>
                            <div className="p-5 border-b border-slate-200 bg-white">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                                        <FileIcon type={previewDoc.type} className="h-8 w-8"/>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 text-sm truncate leading-snug">{previewDoc.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{previewDoc.type}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Metadata</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Status</span> <span className="font-medium text-slate-700">{previewDoc.status}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Size</span> <span className="font-medium text-slate-700 font-mono text-xs">{previewDoc.fileSize}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Tags</h4>
                                    <TagList tags={previewDoc.tags} />
                                </div>
                                {previewDoc.summary && (
                                    <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                        <h4 className="text-xs font-bold text-indigo-900 mb-2 flex items-center"><Wand2 className="h-3 w-3 mr-1"/> AI Summary</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">{previewDoc.summary}</p>
                                    </div>
                                )}
                            </div>
                        </Suspense>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center opacity-50">
                            <Info className="h-12 w-12 mb-4 text-slate-300"/>
                            <p className="text-sm font-medium text-slate-600">No document selected</p>
                        </div>
                    )}
                </aside>
            )}
          </div>
      </div>
    </div>
  );
};
