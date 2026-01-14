/**
 * Drafting Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useLoaderData } from 'react-router';
import type { DraftingLoaderData } from './loader';

type DraftDocument = {
  id: string;
  title: string;
  type: string;
  status: 'Draft' | 'Review' | 'Final';
  caseId?: string;
  author: string;
  wordCount: number;
  lastModified: string;
};

interface DraftingState {
  drafts: DraftDocument[];
  statusFilter: 'all' | 'Draft' | 'Review' | 'Final';
  searchTerm: string;
}

interface DraftingMetrics {
  totalDrafts: number;
  inReview: number;
  finalizedCount: number;
}

interface DraftingContextValue extends DraftingState {
  setStatusFilter: (filter: 'all' | 'Draft' | 'Review' | 'Final') => void;
  setSearchTerm: (term: string) => void;
  metrics: DraftingMetrics;
  isPending: boolean;
}

const DraftingContext = createContext<DraftingContextValue | undefined>(undefined);

export function DraftingProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as DraftingLoaderData;

  const [statusFilter, setStatusFilter] = useState<'all' | 'Draft' | 'Review' | 'Final'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredDrafts = useMemo(() => {
    let result = loaderData.drafts;

    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(term) ||
        d.author.toLowerCase().includes(term) ||
        d.type.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.drafts, statusFilter, searchTerm]);

  const metrics = useMemo<DraftingMetrics>(() => ({
    totalDrafts: loaderData.drafts.length,
    inReview: loaderData.drafts.filter(d => d.status === 'Review').length,
    finalizedCount: loaderData.drafts.filter(d => d.status === 'Final').length,
  }), [loaderData.drafts]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<DraftingContextValue>(() => ({
    drafts: filteredDrafts,
    statusFilter,
    searchTerm,
    setStatusFilter,
    setSearchTerm: handleSetSearchTerm,
    metrics,
    isPending,
  }), [filteredDrafts, statusFilter, searchTerm, handleSetSearchTerm, metrics, isPending]);

  return (
    <DraftingContext.Provider value={contextValue}>
      {children}
    </DraftingContext.Provider>
  );
}

export function useDrafting(): DraftingContextValue {
  const context = useContext(DraftingContext);
  if (!context) {
    throw new Error('useDrafting must be used within DraftingProvider');
  }
  return context;
}
