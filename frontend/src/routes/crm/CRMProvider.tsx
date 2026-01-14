import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

interface CRMContextValue {
  clients: any[];
  contacts: any[];
  opportunities: any[];
  metrics: {
    totalClients: number;
    activeClients: number;
    totalContacts: number;
    openOpportunities: number;
  };
  activeTab: 'clients' | 'contacts' | 'opportunities';
  setActiveTab: (tab: 'clients' | 'contacts' | 'opportunities') => void;
  isPending: boolean;
}

const CRMContext = createContext<CRMContextValue | null>(null);

export function CRMProvider({ children, initialClients, initialContacts, initialOpportunities }: {
  children: React.ReactNode;
  initialClients: any[];
  initialContacts: any[];
  initialOpportunities: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useState<'clients' | 'contacts' | 'opportunities'>('clients');

  const metrics = useMemo(() => ({
    totalClients: initialClients.length,
    activeClients: initialClients.filter(c => c.status === 'active').length,
    totalContacts: initialContacts.length,
    openOpportunities: initialOpportunities.filter(o => o.status === 'open').length
  }), [initialClients, initialContacts, initialOpportunities]);

  const setActiveTab = useCallback((tab: typeof activeTab) => {
    startTransition(() => setActiveTabState(tab));
  }, []);

  const value = useMemo<CRMContextValue>(() => ({
    clients: initialClients,
    contacts: initialContacts,
    opportunities: initialOpportunities,
    metrics,
    activeTab,
    setActiveTab,
    isPending
  }), [initialClients, initialContacts, initialOpportunities, metrics, activeTab, setActiveTab, isPending]);

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
}
