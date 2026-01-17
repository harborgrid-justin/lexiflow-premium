/**
 * Exhibits Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

import type { ExhibitsLoaderData } from './loader';

type Exhibit = {
  id: string;
  exhibitNumber: string;
  title: string;
  type: 'Document' | 'Photo' | 'Video' | 'Audio' | 'Physical';
  caseId: string;
  admissionStatus: 'Pending' | 'Admitted' | 'Rejected';
  dateSubmitted: string;
  description: string;
};

interface ExhibitsState {
  exhibits: Exhibit[];
  typeFilter: 'all' | 'Document' | 'Photo' | 'Video' | 'Audio' | 'Physical';
  statusFilter: 'all' | 'Pending' | 'Admitted' | 'Rejected';
  searchTerm: string;
}

interface ExhibitsMetrics {
  totalExhibits: number;
  admitted: number;
  pending: number;
}

interface ExhibitsContextValue extends ExhibitsState {
  setTypeFilter: (filter: 'all' | 'Document' | 'Photo' | 'Video' | 'Audio' | 'Physical') => void;
  setStatusFilter: (filter: 'all' | 'Pending' | 'Admitted' | 'Rejected') => void;
  setSearchTerm: (term: string) => void;
  metrics: ExhibitsMetrics;
  isPending: boolean;
}

const ExhibitsContext = createContext<ExhibitsContextValue | undefined>(undefined);

export interface ExhibitsProviderProps {
  children: React.ReactNode;
  initialData: ExhibitsLoaderData;
}

export function ExhibitsProvider({ children, initialData }: ExhibitsProviderProps) {
  const loaderData = initialData;

  const [typeFilter, setTypeFilter] = useState<'all' | 'Document' | 'Photo' | 'Video' | 'Audio' | 'Physical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Admitted' | 'Rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredExhibits = useMemo(() => {
    let result = loaderData.exhibits;

    if (typeFilter !== 'all') {
      result = result.filter(e => e.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(e => e.admissionStatus === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.exhibitNumber.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term)
      );
    }

    return result;
  }, [loaderData.exhibits, typeFilter, statusFilter, searchTerm]);

  const metrics = useMemo<ExhibitsMetrics>(() => ({
    totalExhibits: loaderData.exhibits.length,
    admitted: loaderData.exhibits.filter(e => e.admissionStatus === 'Admitted').length,
    pending: loaderData.exhibits.filter(e => e.admissionStatus === 'Pending').length,
  }), [loaderData.exhibits]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<ExhibitsContextValue>(() => ({
    exhibits: filteredExhibits,
    typeFilter,
    statusFilter,
    searchTerm,
    setTypeFilter,
    setStatusFilter,
    setSearchTerm: handleSetSearchTerm,
    metrics,
    isPending,
  }), [filteredExhibits, typeFilter, statusFilter, searchTerm, handleSetSearchTerm, metrics, isPending]);

  return (
    <ExhibitsContext.Provider value={contextValue}>
      {children}
    </ExhibitsContext.Provider>
  );
}

export function useExhibits(): ExhibitsContextValue {
  const context = useContext(ExhibitsContext);
  if (!context) {
    throw new Error('useExhibits must be used within ExhibitsProvider');
  }
  return context;
}
