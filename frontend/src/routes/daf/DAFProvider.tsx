/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * DAF (Document Assembly Framework) Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { DAFLoaderData } from './loader';

type AssemblyTemplate = {
  id: string;
  name: string;
  category: string;
  fields: number;
  complexity: 'Simple' | 'Moderate' | 'Complex';
  usageCount: number;
  lastUsed?: string;
};

interface DAFState {
  templates: AssemblyTemplate[];
  complexityFilter: 'all' | 'Simple' | 'Moderate' | 'Complex';
  searchTerm: string;
}

interface DAFContextValue extends DAFState {
  setComplexityFilter: (filter: 'all' | 'Simple' | 'Moderate' | 'Complex') => void;
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const DAFContext = createContext<DAFContextValue | undefined>(undefined);

export interface DAFProviderProps {
  children: React.ReactNode;
  initialData: DAFLoaderData;
}

export function DAFProvider({ children, initialData }: DAFProviderProps) {
  const loaderData = initialData;

  const [complexityFilter, setComplexityFilter] = useState<'all' | 'Simple' | 'Moderate' | 'Complex'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredTemplates = useMemo(() => {
    let result = loaderData.templates;

    if (complexityFilter !== 'all') {
      result = result.filter(t => t.complexity === complexityFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.templates, complexityFilter, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<DAFContextValue>(() => ({
    templates: filteredTemplates,
    complexityFilter,
    searchTerm,
    setComplexityFilter,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredTemplates, complexityFilter, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <DAFContext.Provider value={contextValue}>
      {children}
    </DAFContext.Provider>
  );
}

export function useDAF(): DAFContextValue {
  const context = useContext(DAFContext);
  if (!context) {
    throw new Error('useDAF must be used within DAFProvider');
  }
  return context;
}
