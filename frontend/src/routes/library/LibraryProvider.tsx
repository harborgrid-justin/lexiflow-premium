/**
 * Library Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useLoaderData } from 'react-router';
import type { LibraryLoaderData } from './loader';

type LibraryItem = {
  id: string;
  title: string;
  type: 'Template' | 'Form' | 'Precedent' | 'Guide';
  category: string;
  description: string;
  lastUsed?: string;
  useCount: number;
};

interface LibraryState {
  items: LibraryItem[];
  typeFilter: 'all' | 'Template' | 'Form' | 'Precedent' | 'Guide';
  searchTerm: string;
}

interface LibraryContextValue extends LibraryState {
  setTypeFilter: (filter: 'all' | 'Template' | 'Form' | 'Precedent' | 'Guide') => void;
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as LibraryLoaderData;

  const [typeFilter, setTypeFilter] = useState<'all' | 'Template' | 'Form' | 'Precedent' | 'Guide'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    let result = loaderData.items;

    if (typeFilter !== 'all') {
      result = result.filter(item => item.type === typeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.items, typeFilter, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<LibraryContextValue>(() => ({
    items: filteredItems,
    typeFilter,
    searchTerm,
    setTypeFilter,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredItems, typeFilter, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <LibraryContext.Provider value={contextValue}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}
