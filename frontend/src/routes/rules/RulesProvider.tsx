/**
 * Rules Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { RulesLoaderData } from './loader';

type CourtRule = {
  id: string;
  number: string;
  title: string;
  court: string;
  jurisdiction: string;
  category: string;
  text: string;
  lastUpdated: string;
};

interface RulesState {
  rules: CourtRule[];
  searchTerm: string;
  selectedJurisdiction: string | null;
}

interface RulesContextValue extends RulesState {
  setSearchTerm: (term: string) => void;
  setSelectedJurisdiction: (jurisdiction: string | null) => void;
  jurisdictions: string[];
  isPending: boolean;
}

const RulesContext = createContext<RulesContextValue | undefined>(undefined);

export interface RulesProviderProps {
  children: React.ReactNode;
  initialData: RulesLoaderData;
}

export function RulesProvider({ children, initialData }: RulesProviderProps) {
  const loaderData = initialData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const jurisdictions = useMemo(() => {
    const juris = new Set(loaderData.rules.map(r => r.jurisdiction));
    return Array.from(juris).sort();
  }, [loaderData.rules]);

  const filteredRules = useMemo(() => {
    let result = loaderData.rules;

    if (selectedJurisdiction) {
      result = result.filter(r => r.jurisdiction === selectedJurisdiction);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.number.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.text.toLowerCase().includes(term) ||
        r.court.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.rules, selectedJurisdiction, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<RulesContextValue>(() => ({
    rules: filteredRules,
    searchTerm,
    selectedJurisdiction,
    setSearchTerm: handleSetSearchTerm,
    setSelectedJurisdiction,
    jurisdictions,
    isPending,
  }), [filteredRules, searchTerm, selectedJurisdiction, handleSetSearchTerm, jurisdictions, isPending]);

  return (
    <RulesContext.Provider value={contextValue}>
      {children}
    </RulesContext.Provider>
  );
}

export function useRules(): RulesContextValue {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error('useRules must be used within RulesProvider');
  }
  return context;
}
