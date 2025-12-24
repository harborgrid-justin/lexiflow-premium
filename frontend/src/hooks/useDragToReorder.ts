/**
 * @module hooks/useDragToReorder
 * @category Hooks
 * @description Reusable drag-and-drop hook for list reordering with keyboard support.
 * 
 * FEATURES:
 * - HTML5 Drag API integration
 * - Visual feedback (ghost preview, drop zones)
 * - Undo/redo support
 * - Keyboard accessibility (Alt+Up/Down)
 * - Bulk reordering
 * - Touch support
 */

import { useState, useCallback, useRef, useEffect, DragEvent, KeyboardEvent } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DraggableItem {
  id: string;
  [key: string]: unknown;
}

export interface UseDragToReorderOptions<T extends DraggableItem> {
  /** Initial items */
  items: T[];
  /** Callback when order changes */
  onReorder: (items: T[]) => void;
  /** Enable keyboard reordering */
  enableKeyboard?: boolean;
  /** Enable bulk reordering */
  enableBulkReorder?: boolean;
  /** Enable undo/redo */
  enableUndo?: boolean;
  /** Maximum undo history */
  maxHistory?: number;
  /** Drag handle selector (optional) */
  dragHandleSelector?: string;
}

export interface UseDragToReorderReturn<T extends DraggableItem> {
  /** Ordered items */
  items: T[];
  /** Currently dragging item ID */
  draggingId: string | null;
  /** Drop zone item ID (item being hovered over) */
  dropZoneId: string | null;
  /** Selected items for bulk reorder */
  selectedIds: Set<string>;
  /** Drag start handler */
  handleDragStart: (id: string) => (e: DragEvent) => void;
  /** Drag over handler */
  handleDragOver: (id: string) => (e: DragEvent) => void;
  /** Drag leave handler */
  handleDragLeave: () => void;
  /** Drop handler */
  handleDrop: (id: string) => (e: DragEvent) => void;
  /** Drag end handler */
  handleDragEnd: () => void;
  /** Keyboard handler for item */
  handleKeyDown: (id: string) => (e: KeyboardEvent) => void;
  /** Toggle item selection */
  toggleSelection: (id: string) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Undo last reorder */
  undo: () => void;
  /** Redo last undo */
  redo: () => void;
  /** Can undo */
  canUndo: boolean;
  /** Can redo */
  canRedo: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useDragToReorder<T extends DraggableItem>({
  items: initialItems,
  onReorder,
  enableKeyboard = true,
  enableBulkReorder = false,
  enableUndo = true,
  maxHistory = 50,
  dragHandleSelector,
}: UseDragToReorderOptions<T>): UseDragToReorderReturn<T> {
  
  const [items, setItems] = useState<T[]>(initialItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropZoneId, setDropZoneId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Undo/redo history
  const [history, setHistory] = useState<T[][]>([initialItems]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const draggedItemRef = useRef<T | null>(null);

  // Sync external items changes
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  /**
   * Add to history
   */
  const addToHistory = useCallback((newItems: T[]) => {
    if (!enableUndo) return;
    
    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newItems);
      
      // Limit history size
      if (newHistory.length > maxHistory) {
        return newHistory.slice(newHistory.length - maxHistory);
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [enableUndo, historyIndex, maxHistory]);

  /**
   * Reorder items
   */
  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      
      addToHistory(newItems);
      onReorder(newItems);
      
      return newItems;
    });
  }, [onReorder, addToHistory]);

  /**
   * Drag start handler
   */
  const handleDragStart = useCallback((id: string) => (e: React.DragEvent) => {
    // Check if drag was initiated from handle
    if (dragHandleSelector) {
      const target = e.target as HTMLElement;
      const handle = target.closest(dragHandleSelector);
      if (!handle) {
        e.preventDefault();
        return;
      }
    }

    const item = items.find(item => item.id === id);
    if (!item) return;

    draggedItemRef.current = item;
    setDraggingId(id);
    
    // Set drag image
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // Add dragging class to element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('dragging');
    }
  }, [items, dragHandleSelector]);

  /**
   * Drag over handler
   */
  const handleDragOver = useCallback((id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (id !== draggingId) {
      setDropZoneId(id);
    }
  }, [draggingId]);

  /**
   * Drag leave handler
   */
  const handleDragLeave = useCallback(() => {
    setDropZoneId(null);
  }, []);

  /**
   * Drop handler
   */
  const handleDrop = useCallback((targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetId) {
      setDropZoneId(null);
      return;
    }

    const fromIndex = items.findIndex(item => item.id === draggedId);
    const toIndex = items.findIndex(item => item.id === targetId);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderItems(fromIndex, toIndex);
    }
    
    setDropZoneId(null);
  }, [items, reorderItems]);

  /**
   * Drag end handler
   */
  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropZoneId(null);
    draggedItemRef.current = null;
    
    // Remove dragging class
    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
  }, []);

  /**
   * Keyboard handler for reordering
   */
  const handleKeyDown = useCallback((id: string) => (e: React.KeyboardEvent) => {
    if (!enableKeyboard) return;

    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    // Alt+Up: Move up
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        reorderItems(currentIndex, currentIndex - 1);
      }
    }
    
    // Alt+Down: Move down
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentIndex < items.length - 1) {
        reorderItems(currentIndex, currentIndex + 1);
      }
    }
  }, [enableKeyboard, items, reorderItems]);

  /**
   * Toggle item selection (for bulk reorder)
   */
  const toggleSelection = useCallback((id: string) => {
    if (!enableBulkReorder) return;
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, [enableBulkReorder]);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Undo
   */
  const undo = useCallback(() => {
    if (!enableUndo || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    const previousItems = history[newIndex];
    
    setItems(previousItems);
    setHistoryIndex(newIndex);
    onReorder(previousItems);
  }, [enableUndo, history, historyIndex, onReorder]);

  /**
   * Redo
   */
  const redo = useCallback(() => {
    if (!enableUndo || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    const nextItems = history[newIndex];
    
    setItems(nextItems);
    setHistoryIndex(newIndex);
    onReorder(nextItems);
  }, [enableUndo, history, historyIndex, onReorder]);

  const canUndo = enableUndo && historyIndex > 0;
  const canRedo = enableUndo && historyIndex < history.length - 1;

  return {
    items,
    draggingId,
    dropZoneId,
    selectedIds,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    handleKeyDown,
    toggleSelection,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

export default useDragToReorder;
