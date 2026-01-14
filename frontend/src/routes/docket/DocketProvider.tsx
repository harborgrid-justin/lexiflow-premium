import React, { createContext, useContext, useMemo } from 'react';


export interface DocketEntry {
  id: string;
  filingDate: string;
  status: string;
  entryNumber: string | number;
  description: string;
  [key: string]: unknown;
}

interface DocketContextValue {
  entries: DocketEntry[];
  metrics: {
    total: number;
    thisWeek: number;
    pending: number;
  };
}

const DocketContext = createContext<DocketContextValue | null>(null);

export function DocketProvider({ children, initialEntries }: { children: React.ReactNode; initialEntries: DocketEntry[] }) {
  const metrics = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return {
      total: initialEntries.length,
      thisWeek: initialEntries.filter(e => new Date(e.filingDate) >= weekAgo).length,
      pending: initialEntries.filter(e => e.status === 'pending').length
    };
  }, [initialEntries]);

  const value = useMemo<DocketContextValue>(() => ({
    entries: initialEntries,
    metrics
  }), [initialEntries, metrics]);

  return <DocketContext.Provider value={value}>{children}</DocketContext.Provider>;
}

export function useDocket() {
  const context = useContext(DocketContext);
  if (!context) throw new Error('useDocket must be used within DocketProvider');
  return context;
}
