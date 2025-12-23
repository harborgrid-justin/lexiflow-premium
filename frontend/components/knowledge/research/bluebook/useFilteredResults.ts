import { useMemo } from 'react';
import type { FormattingResult, FilterOptions } from './types';

export const useFilteredResults = (
  results: FormattingResult[],
  filters: FilterOptions
): FormattingResult[] => {
  return useMemo(() => {
    let filtered = results;

    if (filters.type !== 'ALL') {
      filtered = filtered.filter(r => r.citation?.type === filters.type);
    }

    if (filters.showOnlyErrors) {
      filtered = filtered.filter(r => !r.isValid);
    }

    return filtered;
  }, [results, filters.type, filters.showOnlyErrors]);
};
