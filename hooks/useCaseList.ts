
import { useState, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { Case } from '../types';
import { useQuery } from '../services/queryClient';
import { STORES } from '../services/db';

export const useCaseList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Enterprise Pattern: Use Query Hook for data fetching
  // Explicit arrow function wrapper ensures 'this' context is preserved for DataService.cases
  const { 
    data: cases = [], 
    isLoading, 
    isError 
  } = useQuery<Case[]>(
    [STORES.CASES, 'all'], 
    () => DataService.cases.getAll(),
    { staleTime: 30000 } 
  );

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    return cases.filter(c => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesType = typeFilter === 'All' || c.matterType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [cases, statusFilter, typeFilter]);

  const resetFilters = () => {
    setStatusFilter('All');
    setTypeFilter('All');
  };

  return {
    isModalOpen,
    setIsModalOpen,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredCases,
    resetFilters,
    isLoading,
    isError
  };
};
