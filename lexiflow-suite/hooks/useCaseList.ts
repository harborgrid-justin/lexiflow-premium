
import { useState, useMemo, useDeferredValue } from 'react';
import { MOCK_CASES } from '../data/mockCases.ts';

export const useCaseList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Guideline 3 & 4: Defer filter values to keep Select/Input responsive
  // even if the filtering logic is heavy.
  const deferredStatusFilter = useDeferredValue(statusFilter);
  const deferredTypeFilter = useDeferredValue(typeFilter);

  const filteredCases = useMemo(() => {
    return MOCK_CASES.filter(c => {
      const matchesStatus = deferredStatusFilter === 'All' || c.status === deferredStatusFilter;
      const matchesType = deferredTypeFilter === 'All' || c.matterType === deferredTypeFilter;
      return matchesStatus && matchesType;
    });
  }, [deferredStatusFilter, deferredTypeFilter]);

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
    resetFilters
  };
};
