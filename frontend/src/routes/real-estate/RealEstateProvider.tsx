/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Real Estate Domain - State Provider
 */

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

import type { RealEstateLoaderData } from './loader';

type RealEstateProperty = {
  id: string;
  address: string;
  type: 'Residential' | 'Commercial' | 'Industrial' | 'Land';
  status: 'Active' | 'Pending' | 'Closed' | 'Disputed';
  value: number;
  caseId?: string;
  documents: string[];
  lastUpdated: string;
};

interface RealEstateState {
  properties: RealEstateProperty[];
  typeFilter: 'all' | 'Residential' | 'Commercial' | 'Industrial' | 'Land';
  statusFilter: 'all' | 'Active' | 'Pending' | 'Closed' | 'Disputed';
  searchTerm: string;
}

interface RealEstateContextValue extends RealEstateState {
  setTypeFilter: (filter: 'all' | 'Residential' | 'Commercial' | 'Industrial' | 'Land') => void;
  setStatusFilter: (filter: 'all' | 'Active' | 'Pending' | 'Closed' | 'Disputed') => void;
  setSearchTerm: (term: string) => void;
  isPending: boolean;
}

const RealEstateContext = createContext<RealEstateContextValue | undefined>(undefined);

export interface RealEstateProviderProps {
  children: React.ReactNode;
  initialData: RealEstateLoaderData;
}

export function RealEstateProvider({ children, initialData }: RealEstateProviderProps) {
  const loaderData = initialData;

  const [typeFilter, setTypeFilter] = useState<'all' | 'Residential' | 'Commercial' | 'Industrial' | 'Land'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Pending' | 'Closed' | 'Disputed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredProperties = useMemo(() => {
    let result = loaderData.properties;

    if (typeFilter !== 'all') {
      result = result.filter(p => p.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => p.address.toLowerCase().includes(term));
    }

    return result;
  }, [loaderData.properties, typeFilter, statusFilter, searchTerm]);

  const handleSetSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  }, []);

  const contextValue = useMemo<RealEstateContextValue>(() => ({
    properties: filteredProperties,
    typeFilter,
    statusFilter,
    searchTerm,
    setTypeFilter,
    setStatusFilter,
    setSearchTerm: handleSetSearchTerm,
    isPending,
  }), [filteredProperties, typeFilter, statusFilter, searchTerm, handleSetSearchTerm, isPending]);

  return (
    <RealEstateContext.Provider value={contextValue}>
      {children}
    </RealEstateContext.Provider>
  );
}

export function useRealEstate(): RealEstateContextValue {
  const context = useContext(RealEstateContext);
  if (!context) {
    throw new Error('useRealEstate must be used within RealEstateProvider');
  }
  return context;
}
