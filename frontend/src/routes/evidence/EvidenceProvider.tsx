/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Evidence Management Domain - State Provider
 * Enterprise React Architecture Pattern
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import type { EvidenceLoaderData } from './loader';

type EvidenceItem = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  tags: string[];
  custodian?: string;
  collectedDate: string;
  location?: string;
};

interface EvidenceMetrics {
  total: number;
  reviewed: number;
  pending: number;
}

interface EvidenceState {
  evidence: EvidenceItem[];
  metrics: EvidenceMetrics;
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

interface EvidenceContextValue extends EvidenceState {
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setTypeFilter: (type: string) => void;
  isPending: boolean;
}

const EvidenceContext = createContext<EvidenceContextValue | undefined>(undefined);

export interface EvidenceProviderProps {
  children: React.ReactNode;
  initialData: EvidenceLoaderData;
}

export function EvidenceProvider({ children, initialData }: EvidenceProviderProps) {
  const loaderData = initialData;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo<EvidenceMetrics>(() => ({
    total: loaderData.evidence.length,
    reviewed: loaderData.evidence.filter(e => e.status === 'Reviewed').length,
    pending: loaderData.evidence.filter(e => e.status === 'Pending').length,
  }), [loaderData.evidence]);

  const filteredEvidence = useMemo(() => {
    let result = loaderData.evidence;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(e => e.type === typeFilter);
    }

    return result;
  }, [loaderData.evidence, searchTerm, statusFilter, typeFilter]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<EvidenceContextValue>(() => ({
    evidence: filteredEvidence,
    metrics,
    searchTerm,
    statusFilter,
    typeFilter,
    setSearchTerm: handleSetSearchTerm,
    setStatusFilter,
    setTypeFilter,
    isPending,
  }), [filteredEvidence, metrics, searchTerm, statusFilter, typeFilter, handleSetSearchTerm, isPending]);

  return (
    <EvidenceContext.Provider value={contextValue}>
      {children}
    </EvidenceContext.Provider>
  );
}

export function useEvidence(): EvidenceContextValue {
  const context = useContext(EvidenceContext);
  if (!context) {
    throw new Error('useEvidence must be used within EvidenceProvider');
  }
  return context;
}
