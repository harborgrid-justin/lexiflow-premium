import { useState, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { Case } from '../types';
import { useQuery } from '../services/queryClient';
import { STORES } from '../services/db';
import { useDebounce } from './useDebounce';

export const useCaseList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return cases.filter(c => {
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesType = typeFilter === 'All' || c.matterType === typeFilter;
      const matchesSearch = lowerSearch === '' || 
        c.title.toLowerCase().includes(lowerSearch) || 
        c.client.toLowerCase().includes(lowerSearch) ||
        c.id.toLowerCase().includes(lowerSearch);
      const matchesDate = (!dateFrom || c.filingDate >= dateFrom) && (!dateTo || c.filingDate <= dateTo);
      return matchesStatus && matchesType && matchesSearch && matchesDate;
    });
  }, [cases, statusFilter, typeFilter, debouncedSearchTerm, dateFrom, dateTo]);

  const resetFilters = () => {
    setStatusFilter('All');
    setTypeFilter('All');
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  return {
    isModalOpen,
    setIsModalOpen,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filteredCases,
    resetFilters,
    isLoading,
    isError
  };
};
