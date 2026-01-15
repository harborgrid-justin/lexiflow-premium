// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - DOCUMENTS DOMAIN
// ================================================================================
//
// CANONICAL STRUCTURE:
// ├── Types
// ├── State Shape
// ├── Actions (Domain Methods)
// ├── Context
// ├── Provider
// └── Public Hooks
//
// POSITION IN ARCHITECTURE:
//   DataService → Documents Provider → Document Components
//
// RULES ENFORCED:
//   ✓ Domain-scoped state only (documents)
//   ✓ Uses DataService for backend/local routing
//   ✓ No direct API calls (uses DataService.documents)
//   ✓ Upload progress tracking
//   ✓ Memoized context values
//   ✓ Split state/actions contexts
//
// DATA FLOW:
// Backend API → DataService → DocumentsProvider → Consumer Components
//
// ================================================================================

/**
 * Documents Provider
 *
 * Manages document data state and operations for the application.
 * Handles file uploads with progress tracking, document metadata,
 * and integrates with backend API via DataService.
 *
 * @module providers/data/documentsprovider
 */

import { DocumentsActionsContext, DocumentsStateContext } from '@/lib/documents/contexts';
import type { DocumentsActionsValue, DocumentsProviderProps, DocumentsStateValue } from '@/lib/documents/types';
import { DataService } from '@/services/data/dataService';
import type { LegalDocument } from '@/types/documents';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// PROVIDER IMPLEMENTATION
// ============================================================================

export function DocumentsProvider({ children, initialDocuments, caseId }: DocumentsProviderProps) {
  const [documents, setDocuments] = useState<LegalDocument[]>(initialDocuments || []);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeDocument, setActiveDocumentState] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const loadDocuments = useCallback(async (filterCaseId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = filterCaseId ? { caseId: filterCaseId } : {};
      const loadedDocs = await (DataService.documents as unknown as { getAll: (params?: unknown) => Promise<LegalDocument[]> }).getAll(params);
      setDocuments(loadedDocs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load documents'));
      console.error('[DocumentsProvider] Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDocumentById = useCallback(async (id: string): Promise<LegalDocument | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const doc = await (DataService.documents as unknown as { getById: (id: string) => Promise<LegalDocument> }).getById(id);
      // Update cache
      setDocuments(prev => {
        const exists = prev.find(d => d.id === id);
        if (exists) {
          return prev.map(d => d.id === id ? doc : d);
        }
        return [...prev, doc];
      });
      return doc;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load document ${id}`));
      console.error('[DocumentsProvider] Failed to load document:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, metadata: Partial<LegalDocument>): Promise<LegalDocument> => {
    const fileId = `${file.name}-${Date.now()}`;
    setIsLoading(true);
    setError(null);
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // Simulate upload progress (in real implementation, use XHR or fetch with progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [fileId]: current + 10 };
        });
      }, 200);

      // Upload via DataService
      const newDoc = await (DataService.documents as unknown as {
        upload: (file: File, metadata: Partial<LegalDocument>) => Promise<LegalDocument>
      }).upload(file, metadata);

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      setDocuments(prev => [...prev, newDoc]);

      // Clean up progress after delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);

      return newDoc;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload document'));
      console.error('[DocumentsProvider] Failed to upload document:', err);
      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<LegalDocument>): Promise<LegalDocument> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await (DataService.documents as unknown as {
        update: (id: string, data: Partial<LegalDocument>) => Promise<LegalDocument>
      }).update(id, updates);

      setDocuments(prev => prev.map(d => d.id === id ? updated : d));
      if (activeDocumentId === id) {
        setActiveDocumentState(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update document ${id}`));
      console.error('[DocumentsProvider] Failed to update document:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeDocumentId]);

  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await (DataService.documents as unknown as { delete: (id: string) => Promise<void> }).delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocumentId === id) {
        setActiveDocumentId(null);
        setActiveDocumentState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete document ${id}`));
      console.error('[DocumentsProvider] Failed to delete document:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeDocumentId]);

  const setActiveDocument = useCallback((id: string | null) => {
    setActiveDocumentId(id);
    if (id) {
      const found = documents.find(d => d.id === id);
      setActiveDocumentState(found || null);
      if (!found) {
        loadDocumentById(id).then(loaded => {
          if (loaded) setActiveDocumentState(loaded);
        });
      }
    } else {
      setActiveDocumentState(null);
    }
  }, [documents, loadDocumentById]);

  const searchDocuments = useCallback(async (query: string, filterCaseId?: string): Promise<LegalDocument[]> => {
    if (!query.trim()) return documents;

    const lowerQuery = query.toLowerCase();
    let filtered = documents.filter(d =>
      d.title?.toLowerCase().includes(lowerQuery) ||
      d.description?.toLowerCase().includes(lowerQuery) ||
      d.filename?.toLowerCase().includes(lowerQuery)
    );

    if (filterCaseId) {
      filtered = filtered.filter(d => d.caseId === filterCaseId);
    }

    return filtered;
  }, [documents]);

  const downloadDocument = useCallback(async (id: string): Promise<Blob> => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await (DataService.documents as unknown as { download: (id: string) => Promise<Blob> }).download(id);
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to download document ${id}`));
      console.error('[DocumentsProvider] Failed to download document:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDocuments = useCallback(async () => {
    await loadDocuments(caseId);
  }, [loadDocuments, caseId]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!initialDocuments) {
      loadDocuments(caseId);
    }
  }, [initialDocuments, caseId, loadDocuments]);

  useEffect(() => {
    if (activeDocumentId) {
      const found = documents.find(d => d.id === activeDocumentId);
      if (found) {
        setActiveDocumentState(found);
      }
    }
  }, [activeDocumentId, documents]);

  // ============================================================================
  // CONTEXT VALUES
  // ============================================================================

  const stateValue = useMemo<DocumentsStateValue>(() => ({
    documents,
    activeDocumentId,
    activeDocument,
    isLoading,
    error,
    uploadProgress,
  }), [documents, activeDocumentId, activeDocument, isLoading, error, uploadProgress]);

  const actionsValue = useMemo<DocumentsActionsValue>(() => ({
    loadDocuments,
    loadDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument,
    setActiveDocument,
    searchDocuments,
    downloadDocument,
    refreshDocuments,
  }), [loadDocuments, loadDocumentById, uploadDocument, updateDocument, deleteDocument, setActiveDocument, searchDocuments, downloadDocument, refreshDocuments]);

  return (
    <DocumentsStateContext.Provider value={stateValue}>
      <DocumentsActionsContext.Provider value={actionsValue}>
        {children}
      </DocumentsActionsContext.Provider>
    </DocumentsStateContext.Provider>
  );
}

// ============================================================================
// PUBLIC HOOKS
// ============================================================================

export function useDocumentsState(): DocumentsStateValue {
  const context = useContext(DocumentsStateContext);
  if (!context) {
    throw new Error('useDocumentsState must be used within DocumentsProvider');
  }
  return context;
}

export function useDocumentsActions(): DocumentsActionsValue {
  const context = useContext(DocumentsActionsContext);
  if (!context) {
    throw new Error('useDocumentsActions must be used within DocumentsProvider');
  }
  return context;
}

export function useDocuments() {
  return {
    state: useDocumentsState(),
    actions: useDocumentsActions(),
  };
}
