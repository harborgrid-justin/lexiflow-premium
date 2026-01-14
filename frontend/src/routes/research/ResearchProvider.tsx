/**
 * Legal Research Domain - State Provider
 * Enterprise React Architecture Pattern
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useLoaderData } from 'react-router';
import type { Citation, ResearchQuery } from '../../types';
import type { ResearchLoaderData } from './loader';

interface ResearchMetrics {
  totalSearches: number;
  savedQueries: number;
  totalCitations: number;
}

interface ResearchState {
  recentSearches: ResearchQuery[];
  savedResearch: ResearchQuery[];
  citations: Citation[];
  metrics: ResearchMetrics;
  activeView: 'search' | 'history' | 'citations';
  searchQuery: string;
}

interface ResearchContextValue extends ResearchState {
  setActiveView: (view: 'search' | 'history' | 'citations') => void;
  setSearchQuery: (query: string) => void;
  isPending: boolean;
}

const ResearchContext = createContext<ResearchContextValue | undefined>(undefined);

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as ResearchLoaderData;

  const [activeView, setActiveView] = useState<'search' | 'history' | 'citations'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo<ResearchMetrics>(() => ({
    totalSearches: loaderData.recentSearches.length,
    savedQueries: loaderData.savedResearch.length,
    totalCitations: loaderData.citations.length,
  }), [loaderData]);

  const handleSetSearchQuery = useCallback((query: string) => {
    startTransition(() => {
      setSearchQuery(query);
    });
  }, []);

  const contextValue = useMemo<ResearchContextValue>(() => ({
    recentSearches: loaderData.recentSearches,
    savedResearch: loaderData.savedResearch,
    citations: loaderData.citations,
    metrics,
    activeView,
    searchQuery,
    setActiveView,
    setSearchQuery: handleSetSearchQuery,
    isPending,
  }), [loaderData, metrics, activeView, searchQuery, handleSetSearchQuery, isPending]);

  return (
    <ResearchContext.Provider value={contextValue}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch(): ResearchContextValue {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within ResearchProvider');
  }
  return context;
}
