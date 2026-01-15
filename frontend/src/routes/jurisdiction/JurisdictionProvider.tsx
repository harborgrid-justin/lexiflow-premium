/**
 * Jurisdiction Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { JurisdictionLoaderData } from './loader';

type Jurisdiction = {
  id: string;
  name: string;
  type: 'Federal' | 'State' | 'Local';
  court: string;
  rules: string[];
  filingRequirements: string[];
};

interface JurisdictionState {
  jurisdictions: Jurisdiction[];
  typeFilter: 'all' | 'Federal' | 'State' | 'Local';
  searchTerm: string;
}

interface JurisdictionContextValue extends JurisdictionState {
  setTypeFilter: (filter: 'all' | 'Federal' | 'State' | 'Local') => void;
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const JurisdictionContext = createContext<JurisdictionContextValue | undefined>(undefined);

export function JurisdictionProvider({
  initialData,
  children,
}: {
  initialData: JurisdictionLoaderData;
  children: React.ReactNode;
}) {
  const [jurisdictions] = useState(() => initialData.jurisdictions);
  const [typeFilter, setTypeFilter] = useState<'all' | 'Federal' | 'State' | 'Local'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredJurisdictions = useMemo(() => {
    let result = jurisdictions;

    if (typeFilter !== 'all') {
      result = result.filter(j => j.type === typeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(j =>
        j.name.toLowerCase().includes(term) ||
        j.court.toLowerCase().includes(term)
      );
    }

    return result;
  }, [jurisdictions, typeFilter, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<JurisdictionContextValue>(() => ({
    jurisdictions: filteredJurisdictions,
    typeFilter,
    searchTerm,
    setTypeFilter,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredJurisdictions, typeFilter, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <JurisdictionContext.Provider value={contextValue}>
      {children}
    </JurisdictionContext.Provider>
  );
}

export function useJurisdiction(): JurisdictionContextValue {
  const context = useContext(JurisdictionContext);
  if (!context) {
    throw new Error('useJurisdiction must be used within JurisdictionProvider');
  }
  return context;
}
