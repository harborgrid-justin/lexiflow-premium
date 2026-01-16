/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Litigation Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { LitigationLoaderData } from './loader';

type LitigationMatter = {
  id: string;
  caseId: string;
  caseName: string;
  stage: 'Discovery' | 'Pre-Trial' | 'Trial' | 'Appeal' | 'Closed';
  nextHearing: string;
  strategy: string;
  riskLevel: 'Low' | 'Medium' | 'High';
};

interface LitigationState {
  matters: LitigationMatter[];
  stageFilter: 'all' | 'Discovery' | 'Pre-Trial' | 'Trial' | 'Appeal' | 'Closed';
  riskFilter: 'all' | 'Low' | 'Medium' | 'High';
  searchTerm: string;
}

interface LitigationMetrics {
  totalMatters: number;
  activeMatters: number;
  highRiskCount: number;
}

interface LitigationContextValue extends LitigationState {
  setStageFilter: (filter: 'all' | 'Discovery' | 'Pre-Trial' | 'Trial' | 'Appeal' | 'Closed') => void;
  setRiskFilter: (filter: 'all' | 'Low' | 'Medium' | 'High') => void;
  setSearchTerm: (term: string) => void;
  metrics: LitigationMetrics;
  isPending: boolean;
}

const LitigationContext = createContext<LitigationContextValue | undefined>(undefined);

export interface LitigationProviderProps {
  children: React.ReactNode;
  initialData: LitigationLoaderData;
}

export function LitigationProvider({ children, initialData }: LitigationProviderProps) {
  const loaderData = initialData;

  const [stageFilter, setStageFilter] = useState<'all' | 'Discovery' | 'Pre-Trial' | 'Trial' | 'Appeal' | 'Closed'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredMatters = useMemo(() => {
    let result = loaderData.matters;

    if (stageFilter !== 'all') {
      result = result.filter(m => m.stage === stageFilter);
    }

    if (riskFilter !== 'all') {
      result = result.filter(m => m.riskLevel === riskFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.caseName.toLowerCase().includes(term) ||
        m.strategy.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.matters, stageFilter, riskFilter, searchTerm]);

  const metrics = useMemo<LitigationMetrics>(() => ({
    totalMatters: loaderData.matters.length,
    activeMatters: loaderData.matters.filter(m => m.stage !== 'Closed').length,
    highRiskCount: loaderData.matters.filter(m => m.riskLevel === 'High').length,
  }), [loaderData.matters]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<LitigationContextValue>(() => ({
    matters: filteredMatters,
    stageFilter,
    riskFilter,
    searchTerm,
    setStageFilter,
    setRiskFilter,
    setSearchTerm: handleSetSearchTerm,
    metrics,
    isPending,
  }), [filteredMatters, stageFilter, riskFilter, searchTerm, handleSetSearchTerm, metrics, isPending]);

  return (
    <LitigationContext.Provider value={contextValue}>
      {children}
    </LitigationContext.Provider>
  );
}

export function useLitigation(): LitigationContextValue {
  const context = useContext(LitigationContext);
  if (!context) {
    throw new Error('useLitigation must be used within LitigationProvider');
  }
  return context;
}
