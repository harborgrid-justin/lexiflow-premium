/**
 * @module hooks/useKeyboardNav
 * @category Hooks - Keyboard Navigation
 * @description Keyboard navigation hook for dropdown/list components with arrow keys, Enter to select,
 * and Escape to close. Manages active index state with circular navigation and auto-reset on list
 * changes. Provides handleKeyDown callback for event binding.
 * 
 * NO THEME USAGE: Utility hook for keyboard interaction logic
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Props for useKeyboardNav
 */
interface UseKeyboardNavProps<T> {
  /** Items to navigate */
  items: T[];
  /** Whether list is open */
  isOpen: boolean;
  /** Select callback */
  onSelect: (item: T) => void;
  /** Close callback */
  onClose: () => void;
}

/**
 * Return type for useKeyboardNav hook
 */
export interface UseKeyboardNavReturn {
  /** Active index */
  activeIndex: number;
  /** Set active index */
  setActiveIndex: (index: number) => void;
  /** Keyboard event handler */
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Keyboard navigation for dropdown/list components.
 * 
 * @param props - Configuration options
 * @returns Object with active index and keyboard handler
 */
export function useKeyboardNav<T>({
  items,
  isOpen,
  onSelect,
  onClose
}: UseKeyboardNavProps<T>): UseKeyboardNavReturn {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Reset index when list changes or closes
  useEffect(() => {
    setActiveIndex(isOpen && items.length > 0 ? 0 : -1);
  }, [isOpen, items]); // Dependency on items ensures we reset if search results change

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          onSelect(items[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, items, activeIndex, onSelect, onClose]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown
  };
};
