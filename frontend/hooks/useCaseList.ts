
import { useState, useMemo } from 'react';
import { DataService } from '../services/data/dataService';
import { Case } from '../types';
import { useQuery } from '../hooks/useQueryHooks';
import { STORES } from '../services/data/db';
import { useDebounce } from './useDebounce';
import { useModalState } from './useModalState';
import { SEARCH_DEBOUNCE_MS } from '../config/master.config';

export type UseCaseListReturn = ReturnType<typeof useCaseList>;

export const useCaseList = () => {
  const modal = useModalState();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  const { 
    data: casesResponse, 
    isLoading, 
    isError 
  } = useQuery<Case[] | { data: Case[] }>(
    [STORES.CASES, 'all'], 
    () => DataService.cases.getAll(),
    { staleTime: 30000 } 
  );

  // Handle both array and paginated response formats
  const cases = useMemo(() => {
    if (!casesResponse) return [];
    return Array.isArray(casesResponse) ? casesResponse : casesResponse.data || [];
  }, [casesResponse]);

  const filteredCases = useMemo(() => {
    if (!cases || cases.length === 0) return [];
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
    isModalOpen: modal.isOpen,
    openModal: modal.open,
    closeModal: modal.close,
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

