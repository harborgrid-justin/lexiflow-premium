/**
 * @module hooks/useSelection
 * @category Hooks - UI Utilities
 * @description Multi-select hook with single toggle, range selection (Shift+Click), and select all
 * functionality. Tracks selected IDs, last selected item for range calculations, and provides
 * selection state helpers (isSelected, isAllSelected, isIndeterminate).
 * 
 * NO THEME USAGE: Utility hook for selection state management
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useCallback } from 'react';

// ============================================================================
// HOOK
// ============================================================================
export const useSelection = <T extends Record<string, any>>(items: T[], idKey: keyof T = 'id' as keyof T) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string, originalEvent?: React.MouseEvent | React.ChangeEvent) => {
    const isSelectedBeforeToggle = selectedIds.includes(id);

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
    setLastSelectedId(id); // Update last clicked for next shift-click
    setSelectedIds(prev => {
      if (isSelectedBeforeToggle) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, [items, idKey, lastSelectedId, selectedIds]);

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