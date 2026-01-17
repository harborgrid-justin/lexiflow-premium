/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Citations Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

import type { CitationsLoaderData } from './loader';

type Citation = {
  id: string;
  caseTitle: string;
  citation: string;
  year: number;
  court: string;
  jurisdiction: string;
  summary: string;
  relevance: 'High' | 'Medium' | 'Low';
  tags: string[];
};

interface CitationsState {
  citations: Citation[];
  relevanceFilter: 'all' | 'High' | 'Medium' | 'Low';
  searchTerm: string;
}

interface CitationsContextValue extends CitationsState {
  setRelevanceFilter: (filter: 'all' | 'High' | 'Medium' | 'Low') => void;
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const CitationsContext = createContext<CitationsContextValue | undefined>(undefined);

export interface CitationsProviderProps {
  children: React.ReactNode;
  initialData: CitationsLoaderData;
}

export function CitationsProvider({ children, initialData }: CitationsProviderProps) {
  const loaderData = initialData;

  const [relevanceFilter, setRelevanceFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredCitations = useMemo(() => {
    let result = loaderData.citations;

    if (relevanceFilter !== 'all') {
      result = result.filter(c => c.relevance === relevanceFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.caseTitle.toLowerCase().includes(term) ||
        c.citation.toLowerCase().includes(term) ||
        c.summary.toLowerCase().includes(term) ||
        c.court.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.citations, relevanceFilter, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<CitationsContextValue>(() => ({
    citations: filteredCitations,
    relevanceFilter,
    searchTerm,
    setRelevanceFilter,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredCitations, relevanceFilter, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <CitationsContext.Provider value={contextValue}>
      {children}
    </CitationsContext.Provider>
  );
}

export function useCitations(): CitationsContextValue {
  const context = useContext(CitationsContext);
  if (!context) {
    throw new Error('useCitations must be used within CitationsProvider');
  }
  return context;
}
