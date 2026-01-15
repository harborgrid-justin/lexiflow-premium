/**
 * Practice Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { PracticeLoaderData } from './loader';

type PracticeArea = {
  id: string;
  name: string;
  category: string;
  activeCases: number;
  specialists: string[];
  description: string;
};

interface PracticeState {
  areas: PracticeArea[];
  searchTerm: string;
}

interface PracticeContextValue extends PracticeState {
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const PracticeContext = createContext<PracticeContextValue | undefined>(undefined);

export interface PracticeProviderProps {
  children: React.ReactNode;
  initialData: PracticeLoaderData;
}

export function PracticeProvider({ children, initialData }: PracticeProviderProps) {
  const loaderData = initialData;

  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredAreas = useMemo(() => {
    if (!searchTerm) return loaderData.areas;

    const term = searchTerm.toLowerCase();
    return loaderData.areas.filter(area =>
      area.name.toLowerCase().includes(term) ||
      area.category.toLowerCase().includes(term) ||
      area.description.toLowerCase().includes(term)
    );
  }, [loaderData.areas, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<PracticeContextValue>(() => ({
    areas: filteredAreas,
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredAreas, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <PracticeContext.Provider value={contextValue}>
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice(): PracticeContextValue {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within PracticeProvider');
  }
  return context;
}
