/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Pleadings Domain - Context
 * Enterprise React Architecture Pattern
 */

import React, { createContext, useCallback, useMemo, useState, useTransition } from 'react';
import type { PleadingsLoaderData } from './loader';

type Pleading = {
  id: string;
  title: string;
  type: string;
  caseId: string;
  filedDate: string;
  status: 'Draft' | 'Filed' | 'Approved' | 'Rejected';
  documentId?: string;
};

interface PleadingsState {
  pleadings: Pleading[];
  statusFilter: 'all' | 'Draft' | 'Filed' | 'Approved' | 'Rejected';
  searchTerm: string;
}

interface PleadingsMetrics {
  totalPleadings: number;
  draftCount: number;
  filedCount: number;
}

interface PleadingsContextValue extends PleadingsState {
  setStatusFilter: (filter: 'all' | 'Draft' | 'Filed' | 'Approved' | 'Rejected') => void;
  setSearchTerm: (term: string) => void;
  metrics: PleadingsMetrics;
  isPending: boolean;
}

const PleadingsContext = createContext<PleadingsContextValue | undefined>(undefined);

export { PleadingsContext };

export interface PleadingsProviderProps {
  children: React.ReactNode;
  initialData: PleadingsLoaderData;
}

export function PleadingsProvider({ children, initialData }: PleadingsProviderProps) {
  const loaderData = initialData;

  const [statusFilter, setStatusFilter] = useState<'all' | 'Draft' | 'Filed' | 'Approved' | 'Rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredPleadings = useMemo(() => {
    let result = loaderData.pleadings;

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.pleadings, statusFilter, searchTerm]);

  const metrics = useMemo<PleadingsMetrics>(() => ({
    totalPleadings: loaderData.pleadings.length,
    draftCount: loaderData.pleadings.filter(p => p.status === 'Draft').length,
    filedCount: loaderData.pleadings.filter(p => p.status === 'Filed').length,
  }), [loaderData.pleadings]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<PleadingsContextValue>(() => ({
    pleadings: filteredPleadings,
    statusFilter,
    searchTerm,
    setStatusFilter,
    setSearchTerm: handleSetSearchTerm,
    metrics,
    isPending,
  }), [filteredPleadings, statusFilter, searchTerm, handleSetSearchTerm, metrics, isPending]);

  return (
    <PleadingsContext.Provider value={contextValue}>
      {children}
    </PleadingsContext.Provider>
  );
}
