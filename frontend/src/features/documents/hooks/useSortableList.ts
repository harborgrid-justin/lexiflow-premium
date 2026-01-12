import { useState, useMemo } from 'react';

export interface SortConfig<TField> {
  field: TField;
  order: 'asc' | 'desc';
}

export interface UseSortableListResult<T, TField> {
  sortedItems: T[];
  paginatedItems: T[];
  sortConfig: SortConfig<TField>;
  currentPage: number;
  totalPages: number;
  handleSort: (field: TField) => void;
  setCurrentPage: (page: number) => void;
}

export function useSortableList<T, TField>(
  items: T[],
  defaultSortField: TField,
  itemsPerPage: number,
  sortFunction: (items: T[], field: TField, order: 'asc' | 'desc') => T[]
): UseSortableListResult<T, TField> {
  const [sortField, setSortField] = useState<TField>(defaultSortField);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field: TField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return sortFunction(items, sortField, sortOrder);
  }, [items, sortField, sortOrder, sortFunction]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  return {
    sortedItems,
    paginatedItems,
    sortConfig: { field: sortField, order: sortOrder },
    currentPage,
    totalPages,
    handleSort,
    setCurrentPage
  };
}
