/**
 * Reports & Analytics Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useLoaderData } from 'react-router';
import type { ReportsLoaderData } from './loader';

type Report = {
  id: string;
  name: string;
  type: string;
  description: string;
  lastRun?: string;
  schedule?: string;
  status: string;
};

interface ReportsState {
  reports: Report[];
  recentReports: Report[];
  searchTerm: string;
  typeFilter: string;
}

interface ReportsContextValue extends ReportsState {
  setSearchTerm: (term: string) => void;
  setTypeFilter: (type: string) => void;
  isPending: boolean;
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData() as ReportsLoaderData;

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isPending, startTransition] = useTransition();

  const filteredReports = useMemo(() => {
    let result = loaderData.reports;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(r => r.type === typeFilter);
    }

    return result;
  }, [loaderData.reports, searchTerm, typeFilter]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<ReportsContextValue>(() => ({
    reports: filteredReports,
    recentReports: loaderData.recentReports,
    searchTerm,
    typeFilter,
    setSearchTerm: handleSetSearchTerm,
    setTypeFilter,
    isPending,
  }), [filteredReports, loaderData.recentReports, searchTerm, typeFilter, handleSetSearchTerm, isPending]);

  return (
    <ReportsContext.Provider value={contextValue}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports(): ReportsContextValue {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within ReportsProvider');
  }
  return context;
}
