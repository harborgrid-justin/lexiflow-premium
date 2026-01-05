
import { useState, useCallback } from 'react';

export const useSelection = <T>(items: T[], idKey: keyof T = 'id' as keyof T) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    // @ts-ignore
    const allIds = items.map(item => String(item[idKey]));
    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
  }, [items, idKey]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);
  
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate
  };
};
