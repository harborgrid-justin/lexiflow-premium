import type { DiscoveryRequest, Evidence, ProductionSet } from '@/types';
import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

interface DiscoveryMetrics {
  totalEvidence: number;
  taggedEvidence: number;
  reviewedEvidence: number;
  pendingRequests: number;
  completedProductions: number;
}

interface DiscoveryContextValue {
  evidence: Evidence[];
  requests: DiscoveryRequest[];
  productions: ProductionSet[];
  metrics: DiscoveryMetrics;
  activeTab: 'evidence' | 'requests' | 'productions';
  filters: { tag?: string; status?: string };
  setActiveTab: (tab: 'evidence' | 'requests' | 'productions') => void;
  setFilters: (filters: { tag?: string; status?: string }) => void;
  isPending: boolean;
}

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

interface DiscoveryProviderProps {
  children: React.ReactNode;
  initialEvidence: Evidence[];
  initialRequests: DiscoveryRequest[];
  initialProductions: ProductionSet[];
}

export function DiscoveryProvider({ children, initialEvidence, initialRequests, initialProductions }: DiscoveryProviderProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useState<'evidence' | 'requests' | 'productions'>('evidence');
  const [filters, setFiltersState] = useState<{ tag?: string; status?: string }>({});

  const metrics = useMemo<DiscoveryMetrics>(() => ({
    totalEvidence: initialEvidence.length,
    taggedEvidence: initialEvidence.filter(e => e.tags && e.tags.length > 0).length,
    reviewedEvidence: initialEvidence.filter(e => e.reviewStatus === 'reviewed').length,
    pendingRequests: initialRequests.filter(r => r.status === 'Draft' || r.status === 'Served').length,
    completedProductions: initialProductions.filter(p => p.status === 'Delivered').length
  }), [initialEvidence, initialRequests, initialProductions]);

  const setActiveTab = useCallback((tab: typeof activeTab) => {
    startTransition(() => setActiveTabState(tab));
  }, []);

  const setFilters = useCallback((newFilters: { tag?: string; status?: string }) => {
    startTransition(() => setFiltersState(prev => ({ ...prev, ...newFilters })));
  }, []);

  const value = useMemo<DiscoveryContextValue>(() => ({
    evidence: initialEvidence,
    requests: initialRequests,
    productions: initialProductions,
    metrics,
    activeTab,
    filters,
    setActiveTab,
    setFilters,
    isPending
  }), [initialEvidence, initialRequests, initialProductions, metrics, activeTab, filters, setActiveTab, setFilters, isPending]);

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>;
}

export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (!context) throw new Error('useDiscovery must be used within DiscoveryProvider');
  return context;
}
