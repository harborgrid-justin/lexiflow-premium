/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Entities Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { EntitiesLoaderData } from './loader';

type Entity = {
  id: string;
  name: string;
  type: 'Person' | 'Organization' | 'Government' | 'Trust';
  jurisdiction: string;
  identificationNumber: string;
  relatedCases: number;
  status: 'Active' | 'Inactive';
};

interface EntitiesState {
  entities: Entity[];
  typeFilter: 'all' | 'Person' | 'Organization' | 'Government' | 'Trust';
  searchTerm: string;
}

interface EntitiesContextValue extends EntitiesState {
  setTypeFilter: (filter: 'all' | 'Person' | 'Organization' | 'Government' | 'Trust') => void;
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const EntitiesContext = createContext<EntitiesContextValue | undefined>(undefined);

export interface EntitiesProviderProps {
  children: React.ReactNode;
  initialData: EntitiesLoaderData;
}

export function EntitiesProvider({ children, initialData }: EntitiesProviderProps) {
  const loaderData = initialData;

  const [typeFilter, setTypeFilter] = useState<'all' | 'Person' | 'Organization' | 'Government' | 'Trust'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredEntities = useMemo(() => {
    let result = loaderData.entities;

    if (typeFilter !== 'all') {
      result = result.filter(e => e.type === typeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(term) ||
        e.identificationNumber.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.entities, typeFilter, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<EntitiesContextValue>(() => ({
    entities: filteredEntities,
    typeFilter,
    searchTerm,
    setTypeFilter,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredEntities, typeFilter, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <EntitiesContext.Provider value={contextValue}>
      {children}
    </EntitiesContext.Provider>
  );
}

export function useEntities(): EntitiesContextValue {
  const context = useContext(EntitiesContext);
  if (!context) {
    throw new Error('useEntities must be used within EntitiesProvider');
  }
  return context;
}
