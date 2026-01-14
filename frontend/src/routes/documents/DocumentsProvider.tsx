import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';


export interface Document {
  id: string;
  title: string;
  category: string;
  uploadedAt: string;
  [key: string]: unknown;
}

interface DocumentsContextValue {
  documents: Document[];
  metrics: {
    total: number;
    pleadings: number;
    evidence: number;
    correspondence: number;
  };
  activeView: 'grid' | 'list';
  setActiveView: (view: 'grid' | 'list') => void;
  isPending: boolean;
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({ children, initialDocuments }: { children: React.ReactNode; initialDocuments: Document[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeView, setActiveViewState] = useState<'grid' | 'list'>('grid');

  const metrics = useMemo(() => ({
    total: initialDocuments.length,
    pleadings: initialDocuments.filter(d => d.category === 'pleading').length,
    evidence: initialDocuments.filter(d => d.category === 'evidence').length,
    correspondence: initialDocuments.filter(d => d.category === 'correspondence').length
  }), [initialDocuments]);

  const setActiveView = useCallback((view: 'grid' | 'list') => {
    startTransition(() => setActiveViewState(view));
  }, []);

  const value = useMemo<DocumentsContextValue>(() => ({
    documents: initialDocuments,
    metrics,
    activeView,
    setActiveView,
    isPending
  }), [initialDocuments, metrics, activeView, setActiveView, isPending]);

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) throw new Error('useDocuments must be used within DocumentsProvider');
  return context;
}
