
import React, { useState, useCallback } from 'react';

export const useSelection = <T extends Record<string, any>>(items: T[], idKey: keyof T = 'id' as keyof T) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string, originalEvent?: React.MouseEvent | React.ChangeEvent) => {
    // Handle Range Selection (Shift Key). Type-safe check for shiftKey property.
    if (originalEvent && 'shiftKey' in originalEvent && originalEvent.shiftKey && lastSelectedId) {
        const lastIndex = items.findIndex(item => String(item[idKey]) === lastSelectedId);
        const currentIndex = items.findIndex(item => String(item[idKey]) === id);

        if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeIds = items.slice(start, end + 1).map(item => String(item[idKey]));
            
            // Merge range into current selection
            setSelectedIds(prev => Array.from(new Set([...prev, ...rangeIds])));
            return;
        }
    }

    // Standard Toggle
    setSelectedIds(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) return prev.filter(item => item !== id);
      setLastSelectedId(id);
      return [...prev, id];
    });
  }, [items, idKey, lastSelectedId]);

  const selectAll = useCallback(() => {
    const allIds = items.map(item => String(item[idKey]));
    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
  }, [items, idKey]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedId(null);
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
