/**
 * Selection Context
 * Multi-select state management for bulk operations
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface SelectionItem {
  id: string;
  type?: string;
  data?: any;
}

interface SelectionContextType<T = any> {
  // Selected items
  selectedItems: Map<string, SelectionItem>;
  selectedIds: string[];
  selectedCount: number;
  isSelected: (id: string) => boolean;
  getSelected: (id: string) => SelectionItem | undefined;
  getAllSelected: () => SelectionItem[];

  // Selection operations
  select: (id: string, item?: Partial<SelectionItem>) => void;
  deselect: (id: string) => void;
  toggle: (id: string, item?: Partial<SelectionItem>) => void;
  selectMultiple: (ids: string[], items?: Partial<SelectionItem>[]) => void;
  deselectMultiple: (ids: string[]) => void;
  selectAll: (items: SelectionItem[]) => void;
  deselectAll: () => void;
  selectRange: (startId: string, endId: string, allIds: string[]) => void;

  // Filtering
  getSelectedByType: (type: string) => SelectionItem[];
  hasSelectedType: (type: string) => boolean;

  // Last selected
  lastSelectedId: string | null;
  setLastSelectedId: (id: string | null) => void;

  // Selection mode
  selectionMode: 'single' | 'multiple';
  setSelectionMode: (mode: 'single' | 'multiple') => void;

  // Bulk operations
  performBulkOperation: <R = any>(
    operation: (items: SelectionItem[]) => Promise<R>,
    clearAfter?: boolean
  ) => Promise<R>;

  // State management
  hasSelection: boolean;
  canSelectMore: boolean;
  maxSelections?: number;
  setMaxSelections: (max: number | undefined) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{
  children: ReactNode;
  maxSelections?: number;
  defaultMode?: 'single' | 'multiple';
}> = ({ children, maxSelections: initialMax, defaultMode = 'multiple' }) => {
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectionItem>>(new Map());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>(defaultMode);
  const [maxSelections, setMaxSelections] = useState<number | undefined>(initialMax);

  // Derived values
  const selectedIds = useMemo(() => Array.from(selectedItems.keys()), [selectedItems]);
  const selectedCount = useMemo(() => selectedItems.size, [selectedItems]);
  const hasSelection = useMemo(() => selectedItems.size > 0, [selectedItems]);
  const canSelectMore = useMemo(
    () => !maxSelections || selectedItems.size < maxSelections,
    [selectedItems, maxSelections]
  );

  // Check if item is selected
  const isSelected = useCallback((id: string): boolean => {
    return selectedItems.has(id);
  }, [selectedItems]);

  // Get selected item
  const getSelected = useCallback((id: string): SelectionItem | undefined => {
    return selectedItems.get(id);
  }, [selectedItems]);

  // Get all selected items
  const getAllSelected = useCallback((): SelectionItem[] => {
    return Array.from(selectedItems.values());
  }, [selectedItems]);

  // Select an item
  const select = useCallback((id: string, item?: Partial<SelectionItem>) => {
    setSelectedItems(prev => {
      const next = new Map(prev);

      // In single mode, clear previous selection
      if (selectionMode === 'single') {
        next.clear();
      }

      // Check max selections
      if (maxSelections && next.size >= maxSelections && !next.has(id)) {
        console.warn(`Cannot select more than ${maxSelections} items`);
        return prev;
      }

      next.set(id, { id, ...item });
      return next;
    });
    setLastSelectedId(id);
  }, [selectionMode, maxSelections]);

  // Deselect an item
  const deselect = useCallback((id: string) => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    if (lastSelectedId === id) {
      setLastSelectedId(null);
    }
  }, [lastSelectedId]);

  // Toggle selection
  const toggle = useCallback((id: string, item?: Partial<SelectionItem>) => {
    if (isSelected(id)) {
      deselect(id);
    } else {
      select(id, item);
    }
  }, [isSelected, select, deselect]);

  // Select multiple items
  const selectMultiple = useCallback((ids: string[], items?: Partial<SelectionItem>[]) => {
    setSelectedItems(prev => {
      const next = new Map(prev);

      // In single mode, only select the last item
      if (selectionMode === 'single') {
        const lastId = ids[ids.length - 1];
        const lastItem = items?.[items.length - 1];
        next.clear();
        next.set(lastId, { id: lastId, ...lastItem });
        setLastSelectedId(lastId);
        return next;
      }

      // Check max selections
      const availableSlots = maxSelections ? maxSelections - next.size : Infinity;
      const idsToAdd = ids.slice(0, availableSlots);

      idsToAdd.forEach((id, index) => {
        const item = items?.[index];
        next.set(id, { id, ...item });
      });

      if (idsToAdd.length > 0) {
        setLastSelectedId(idsToAdd[idsToAdd.length - 1]);
      }

      return next;
    });
  }, [selectionMode, maxSelections]);

  // Deselect multiple items
  const deselectMultiple = useCallback((ids: string[]) => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });

    if (lastSelectedId && ids.includes(lastSelectedId)) {
      setLastSelectedId(null);
    }
  }, [lastSelectedId]);

  // Select all items
  const selectAll = useCallback((items: SelectionItem[]) => {
    if (selectionMode === 'single') {
      console.warn('Cannot select all in single selection mode');
      return;
    }

    const itemsToSelect = maxSelections ? items.slice(0, maxSelections) : items;

    setSelectedItems(new Map(itemsToSelect.map(item => [item.id, item])));

    if (itemsToSelect.length > 0) {
      setLastSelectedId(itemsToSelect[itemsToSelect.length - 1].id);
    }
  }, [selectionMode, maxSelections]);

  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedItems(new Map());
    setLastSelectedId(null);
  }, []);

  // Select range of items
  const selectRange = useCallback((startId: string, endId: string, allIds: string[]) => {
    if (selectionMode === 'single') {
      select(endId);
      return;
    }

    const startIndex = allIds.indexOf(startId);
    const endIndex = allIds.indexOf(endId);

    if (startIndex === -1 || endIndex === -1) return;

    const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
    const rangeIds = allIds.slice(from, to + 1);

    selectMultiple(rangeIds);
  }, [selectionMode, select, selectMultiple]);

  // Get selected items by type
  const getSelectedByType = useCallback((type: string): SelectionItem[] => {
    return Array.from(selectedItems.values()).filter(item => item.type === type);
  }, [selectedItems]);

  // Check if has selected items of type
  const hasSelectedType = useCallback((type: string): boolean => {
    return Array.from(selectedItems.values()).some(item => item.type === type);
  }, [selectedItems]);

  // Perform bulk operation
  const performBulkOperation = useCallback(async <R = any>(
    operation: (items: SelectionItem[]) => Promise<R>,
    clearAfter: boolean = true
  ): Promise<R> => {
    const items = getAllSelected();

    if (items.length === 0) {
      throw new Error('No items selected for bulk operation');
    }

    try {
      const result = await operation(items);

      if (clearAfter) {
        deselectAll();
      }

      return result;
    } catch (error) {
      console.error('Bulk operation failed:', error);
      throw error;
    }
  }, [getAllSelected, deselectAll]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to deselect all
      if (event.key === 'Escape' && hasSelection) {
        deselectAll();
      }

      // Ctrl+A to select all (prevent default browser behavior)
      if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        // Dispatch custom event for components to handle
        window.dispatchEvent(new CustomEvent('selection:select-all'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSelection, deselectAll]);

  // Memoize context value
  const value = useMemo<SelectionContextType>(() => ({
    selectedItems,
    selectedIds,
    selectedCount,
    isSelected,
    getSelected,
    getAllSelected,
    select,
    deselect,
    toggle,
    selectMultiple,
    deselectMultiple,
    selectAll,
    deselectAll,
    selectRange,
    getSelectedByType,
    hasSelectedType,
    lastSelectedId,
    setLastSelectedId,
    selectionMode,
    setSelectionMode,
    performBulkOperation,
    hasSelection,
    canSelectMore,
    maxSelections,
    setMaxSelections,
  }), [
    selectedItems,
    selectedIds,
    selectedCount,
    isSelected,
    getSelected,
    getAllSelected,
    select,
    deselect,
    toggle,
    selectMultiple,
    deselectMultiple,
    selectAll,
    deselectAll,
    selectRange,
    getSelectedByType,
    hasSelectedType,
    lastSelectedId,
    setLastSelectedId,
    selectionMode,
    setSelectionMode,
    performBulkOperation,
    hasSelection,
    canSelectMore,
    maxSelections,
    setMaxSelections,
  ]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

export const useSelectionContext = <T = any,>(): SelectionContextType<T> => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelectionContext must be used within a SelectionProvider');
  }
  return context as SelectionContextType<T>;
};

export default SelectionContext;
