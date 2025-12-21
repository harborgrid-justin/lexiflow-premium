/**
 * @module hooks/useKeyboardNavigation
 * @category Hooks - Accessibility
 * @description Keyboard navigation hook for docket entries with arrow keys, Enter, and Space
 * WCAG 2.1 AA compliant
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface KeyboardNavigationConfig<T> {
  items: T[];
  onSelect?: (item: T, index: number) => void;
  onActivate?: (item: T, index: number) => void;
  initialIndex?: number;
  enabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export interface KeyboardNavigationResult {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  getFocusProps: (index: number) => {
    tabIndex: number;
    'data-index': number;
    'aria-selected': boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useKeyboardNavigation<T>({
  items,
  onSelect,
  onActivate,
  initialIndex = -1,
  enabled = true,
  containerRef
}: KeyboardNavigationConfig<T>): KeyboardNavigationResult {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const itemsLengthRef = useRef(items.length);
  
  /**
   * Update focused index when items change
   */
  useEffect(() => {
    if (items.length !== itemsLengthRef.current) {
      itemsLengthRef.current = items.length;
      
      // Reset focus if current index is out of bounds
      if (focusedIndex >= items.length) {
        setFocusedIndex(items.length - 1);
      }
    }
  }, [items.length, focusedIndex]);
  
  /**
   * Navigate to next item
   */
  const navigateNext = useCallback(() => {
    setFocusedIndex(prev => {
      const next = Math.min(prev + 1, items.length - 1);
      if (onSelect && next !== prev) {
        onSelect(items[next], next);
      }
      return next;
    });
  }, [items, onSelect]);
  
  /**
   * Navigate to previous item
   */
  const navigatePrevious = useCallback(() => {
    setFocusedIndex(prev => {
      const next = Math.max(prev - 1, 0);
      if (onSelect && next !== prev) {
        onSelect(items[next], next);
      }
      return next;
    });
  }, [items, onSelect]);
  
  /**
   * Navigate to first item
   */
  const navigateFirst = useCallback(() => {
    setFocusedIndex(0);
    if (onSelect && items.length > 0) {
      onSelect(items[0], 0);
    }
  }, [items, onSelect]);
  
  /**
   * Navigate to last item
   */
  const navigateLast = useCallback(() => {
    const lastIndex = items.length - 1;
    setFocusedIndex(lastIndex);
    if (onSelect && lastIndex >= 0) {
      onSelect(items[lastIndex], lastIndex);
    }
  }, [items, onSelect]);
  
  /**
   * Activate current item (Enter or Space)
   */
  const activateCurrent = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length && onActivate) {
      onActivate(items[focusedIndex], focusedIndex);
    }
  }, [focusedIndex, items, onActivate]);
  
  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        navigateNext();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        navigatePrevious();
        break;
        
      case 'Home':
        e.preventDefault();
        navigateFirst();
        break;
        
      case 'End':
        e.preventDefault();
        navigateLast();
        break;
        
      case 'Enter':
      case ' ': // Space
        e.preventDefault();
        activateCurrent();
        break;
        
      case 'PageDown':
        e.preventDefault();
        // Jump 10 items down
        setFocusedIndex(prev => {
          const next = Math.min(prev + 10, items.length - 1);
          if (onSelect && next !== prev) {
            onSelect(items[next], next);
          }
          return next;
        });
        break;
        
      case 'PageUp':
        e.preventDefault();
        // Jump 10 items up
        setFocusedIndex(prev => {
          const next = Math.max(prev - 10, 0);
          if (onSelect && next !== prev) {
            onSelect(items[next], next);
          }
          return next;
        });
        break;
    }
  }, [enabled, navigateNext, navigatePrevious, navigateFirst, navigateLast, activateCurrent, items, onSelect]);
  
  /**
   * Scroll focused item into view
   */
  useEffect(() => {
    if (focusedIndex < 0 || !containerRef?.current) return;
    
    const container = containerRef.current;
    const focusedElement = container.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement;
    
    if (focusedElement) {
      // Check if element is in view
      const containerRect = container.getBoundingClientRect();
      const elementRect = focusedElement.getBoundingClientRect();
      
      const isAbove = elementRect.top < containerRect.top;
      const isBelow = elementRect.bottom > containerRect.bottom;
      
      if (isAbove || isBelow) {
        focusedElement.scrollIntoView({
          behavior: 'smooth',
          block: isAbove ? 'start' : 'end'
        });
      }
      
      // Focus the element for screen readers
      focusedElement.focus();
    }
  }, [focusedIndex, containerRef]);
  
  /**
   * Get props for focusable items
   */
  const getFocusProps = useCallback((index: number) => {
    return {
      tabIndex: index === focusedIndex || (focusedIndex === -1 && index === 0) ? 0 : -1,
      'data-index': index,
      'aria-selected': index === focusedIndex,
      onKeyDown: handleKeyDown
    };
  }, [focusedIndex, handleKeyDown]);
  
  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getFocusProps
  };
}
