/**
 * Clauses Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useLoaderData } from 'react-router';
import type { ClausesLoaderData } from './loader';

type Clause = {
  id: string;
  title: string;
  category: string;
  text: string;
  language: string;
  tags: string[];
  useCount: number;
  lastUsed?: string;
};

interface ClausesState {
  clauses: Clause[];
  searchTerm: string;
  selectedCategory: string | null;
}

interface ClausesContextValue extends ClausesState {
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
  isPending: boolean;
}

const ClausesContext = createContext<ClausesContextValue | undefined>(undefined);

export function ClausesProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as ClausesLoaderData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categories = useMemo(() => {
    const cats = new Set(loaderData.clauses.map(c => c.category));
    return Array.from(cats).sort();
  }, [loaderData.clauses]);

  const filteredClauses = useMemo(() => {
    let result = loaderData.clauses;

    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.text.toLowerCase().includes(term) ||
        c.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return result;
  }, [loaderData.clauses, selectedCategory, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<ClausesContextValue>(() => ({
    clauses: filteredClauses,
    searchTerm,
    selectedCategory,
    setSearchTerm: handleSetSearchTerm,
    setSelectedCategory,
    categories,
    isPending,
  }), [filteredClauses, searchTerm, selectedCategory, handleSetSearchTerm, categories, isPending]);

  return (
    <ClausesContext.Provider value={contextValue}>
      {children}
    </ClausesContext.Provider>
  );
}

export function useClauses(): ClausesContextValue {
  const context = useContext(ClausesContext);
  if (!context) {
    throw new Error('useClauses must be used within ClausesProvider');
  }
  return context;
}
