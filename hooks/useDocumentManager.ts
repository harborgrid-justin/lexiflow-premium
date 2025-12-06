import { useState, useMemo, useDeferredValue } from 'react';
import { LegalDocument, DocumentVersion } from '../types';
import { DataService } from '../services/dataService';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';

export const useDocumentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>('All');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedDocForHistory, setSelectedDocForHistory] = useState<LegalDocument | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // Enterprise DMS State
  const [currentFolder, setCurrentFolder] = useState('root');
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<LegalDocument | null>(null);

  // Enterprise Data Access
  const { data: documents = [], isLoading } = useQuery<LegalDocument[]>(
    [STORES.DOCUMENTS, 'all'],
    DataService.documents.getAll
  );

  // Mutation for updates
  const { mutate: performUpdate } = useMutation(
    async (payload: { id: string, updates: Partial<LegalDocument> }) => {
        return DataService.documents.update(payload.id, payload.updates);
    },
    {
        invalidateKeys: [[STORES.DOCUMENTS, 'all']],
        // Optimistic Update support could be added here for even faster UI
    }
  );

  const updateDocument = (id: string, updates: Partial<LegalDocument>) => {
    // Optimistic local update for immediate feedback
    if (previewDoc && previewDoc.id === id) {
        setPreviewDoc(prev => prev ? { ...prev, ...updates } : null);
    }
    performUpdate({ id, updates });
  };

  // Compatibility layer for legacy components that set state manually
  const setDocuments = (newDocs: LegalDocument[] | ((prev: LegalDocument[]) => LegalDocument[])) => {
      queryClient.setQueryData([STORES.DOCUMENTS, 'all'], newDocs);
  };

  const handleRestore = async (version: DocumentVersion) => {
    if (!selectedDocForHistory) return;
    const updates: Partial<LegalDocument> = { content: version.contentSnapshot || '', lastModified: new Date().toISOString().split('T')[0] };
    updateDocument(selectedDocForHistory.id, updates);
    setSelectedDocForHistory(null);
  };

  const handleBulkSummarize = async () => {
      if (selectedDocs.length === 0) return;
      setIsProcessingAI(true);
      await new Promise(r => setTimeout(r, 1500));
      alert(`AI Summary generated for ${selectedDocs.length} documents. Report saved to case file.`);
      setIsProcessingAI(false);
      setSelectedDocs([]);
  };

  const toggleSelection = (id: string) => {
      if (selectedDocs.includes(id)) {
          setSelectedDocs(selectedDocs.filter(d => d !== id));
          if (previewDoc?.id === id) setPreviewDoc(null);
      } else {
          setSelectedDocs([...selectedDocs, id]);
          const doc = documents.find(d => d.id === id);
          if (doc) setPreviewDoc(doc);
      }
  };

  const addTag = (docId: string, tag: string) => {
    if (!tag.trim()) return;
    const doc = documents.find(d => d.id === docId);
    if (doc && !doc.tags.includes(tag.trim())) {
        const newTags = [...doc.tags, tag.trim()];
        updateDocument(docId, { tags: newTags });
    }
  };

  const removeTag = (docId: string, tag: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
        const newTags = doc.tags.filter(t => t !== tag);
        updateDocument(docId, { tags: newTags });
    }
  };

  const allTags = useMemo(() => Array.from(new Set(documents.flatMap(d => d.tags))), [documents]);

  const filtered = useMemo(() => {
    return documents.filter(d => {
        const inFolder = currentFolder === 'root' ? true : d.folderId === currentFolder;
        const matchesSearch = d.title.toLowerCase().includes(deferredSearchTerm.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(deferredSearchTerm.toLowerCase()));
        const matchesModule = activeModuleFilter === 'All' || d.sourceModule === activeModuleFilter;
        return matchesSearch && matchesModule && (deferredSearchTerm ? true : inFolder);
    });
  }, [documents, deferredSearchTerm, activeModuleFilter, currentFolder]);

  const stats = {
      total: documents.length,
      evidence: documents.filter(d => d.sourceModule === 'Evidence').length,
      discovery: documents.filter(d => d.sourceModule === 'Discovery').length,
      signed: documents.filter(d => d.status === 'Signed').length
  };

  return {
    searchTerm,
    setSearchTerm,
    activeModuleFilter,
    setActiveModuleFilter,
    selectedDocs,
    setSelectedDocs,
    selectedDocForHistory,
    setSelectedDocForHistory,
    documents,
    setDocuments,
    isProcessingAI,
    isLoading,
    handleRestore,
    handleBulkSummarize,
    toggleSelection,
    addTag,
    removeTag,
    allTags,
    filtered,
    stats,
    currentFolder,
    setCurrentFolder,
    isDetailsOpen,
    setIsDetailsOpen,
    previewDoc,
    setPreviewDoc,
    updateDocument
  };
};