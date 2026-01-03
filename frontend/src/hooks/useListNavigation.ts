/**
 * @module hooks/useListNavigation
 * @category Hooks - Keyboard Navigation
 * 
 * Unified keyboard navigation for dropdowns and WCAG 2.1 AA compliant lists.
 * Supports simple mode (arrow keys, Enter, Escape) and full mode (all keyboard shortcuts).
 * 
 * @example
 * ```typescript
 * // Simple mode for dropdown
 * const nav = useListNavigation({
 *   items: options,
 *   mode: 'simple',
 *   onActivate: (item) => selectOption(item),
 *   onClose: () => setIsOpen(false)
 * });
 * 
 * <div onKeyDown={nav.handleKeyDown}>
 *   {options.map((opt) => (
 *     <div key={i} className={nav.focusedIndex === i ? 'focused' : ''}>
 *       {opt.label}
 *     </div>
 *   ))}
 * </div>
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Navigation mode
 */
export type NavigationMode = 'simple' | 'full';

/**
 * Configuration for useListNavigation hook
 */
export interface UseListNavigationConfig<T> {
  /** Array of items to navigate through */
  items: T[];
  /** Navigation mode: 'simple' for dropdowns, 'full' for WCAG-compliant lists */
  mode?: NavigationMode;
  /** Called when item is selected (arrow key navigation) */
  onSelect?: (item: T, index: number) => void;
  /** Called when item is activated (Enter/Space key) */
  onActivate?: (item: T, index: number) => void;
  /** Called when Escape is pressed (simple mode only) */
  onClose?: () => void;
  /** Whether the list is currently open (simple mode only) */
  isOpen?: boolean;
  /** Initial focused index (-1 for none) */
  initialIndex?: number;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
  /** Container ref for scroll management (full mode only) */
  containerRef?: React.RefObject<HTMLElement>;
  /** Use circular navigation (simple mode wraps around) */
  circular?: boolean;
}

export interface UseListNavigationResult {
  /** Currently focused/active index */
  focusedIndex: number;
  /** Manually set focused index */
  setFocusedIndex: (index: number) => void;
  /** Keyboard event handler to attach to list or items */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Get props for focusable items (full mode only) */
  getFocusProps?: (index: number) => {
    tabIndex: number;
    'data-index': number;
    'aria-selected': boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useListNavigation<T>({
  items,
  mode = 'simple',
  onSelect,
  onActivate,
  onClose,
  isOpen = true,
  initialIndex = -1,
  enabled = true,
  containerRef,
  circular = true
}: UseListNavigationConfig<T>): UseListNavigationResult {
  const [focusedIndex, setFocusedIndex] = useState<number>(initialIndex);
  const itemsLengthRef = useRef(items.length);

  // Simple mode: Reset index when list opens/closes or items change
  useEffect(() => {
    if (mode === 'simple') {
      setFocusedIndex(isOpen && items.length > 0 ? 0 : -1);
    }
  }, [isOpen, items.length, mode]);

  // Full mode: Update focused index when items change
  useEffect(() => {
    if (mode === 'full' && items.length !== itemsLengthRef.current) {
      itemsLengthRef.current = items.length;
      
      // Reset focus if current index is out of bounds
      if (focusedIndex >= items.length) {
        setFocusedIndex(items.length - 1);
      }
    }
  }, [items.length, focusedIndex, mode]);

  // Navigation helpers
  const navigateNext = useCallback(() => {
    setFocusedIndex(prev => {
      let next: number;
      if (circular && mode === 'simple') {
        next = (prev + 1) % items.length;
      } else {
        next = Math.min(prev + 1, items.length - 1);
      }
      if (onSelect && next !== prev) {
        onSelect(items[next], next);
      }
      return next;
    });
  }, [items, onSelect, circular, mode]);

  const navigatePrevious = useCallback(() => {
    setFocusedIndex(prev => {
      let next: number;
      if (circular && mode === 'simple') {
        next = (prev - 1 + items.length) % items.length;
      } else {
        next = Math.max(prev - 1, 0);
      }
      if (onSelect && next !== prev) {
        onSelect(items[next], next);
      }
      return next;
    });
  }, [items, onSelect, circular, mode]);

  const navigateFirst = useCallback(() => {
    setFocusedIndex(0);
    if (onSelect && items.length > 0) {
      onSelect(items[0], 0);
    }
  }, [items, onSelect]);

  const navigateLast = useCallback(() => {
    const lastIndex = items.length - 1;
    setFocusedIndex(lastIndex);
    if (onSelect && lastIndex >= 0) {
      onSelect(items[lastIndex], lastIndex);
    }
  }, [items, onSelect]);

  const activateCurrent = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length) {
      if (onActivate) {
        onActivate(items[focusedIndex], focusedIndex);
      } else if (onSelect) {
        // Fallback to onSelect if onActivate not provided
        onSelect(items[focusedIndex], focusedIndex);
      }
    }
  }, [focusedIndex, items, onActivate, onSelect]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled || (mode === 'simple' && !isOpen)) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        navigateNext();
        break;

      case 'ArrowUp':
        e.preventDefault();
        navigatePrevious();
        break;

      case 'Enter':
        e.preventDefault();
        activateCurrent();
        break;

      case 'Escape':
        if (mode === 'simple' && onClose) {
          e.preventDefault();
          onClose();
        }
        break;

      // Full mode additional keys
      case ' ': // Space
        if (mode === 'full') {
          e.preventDefault();
          activateCurrent();
        }
        break;

      case 'Home':
        if (mode === 'full') {
          e.preventDefault();
          navigateFirst();
        }
        break;

      case 'End':
        if (mode === 'full') {
          e.preventDefault();
          navigateLast();
        }
        break;

      case 'PageDown':
        if (mode === 'full') {
          e.preventDefault();
          // Jump 10 items down
          setFocusedIndex(prev => {
            const next = Math.min(prev + 10, items.length - 1);
            if (onSelect && next !== prev) {
              onSelect(items[next], next);
            }
            return next;
          });
        }
        break;

      case 'PageUp':
        if (mode === 'full') {
          e.preventDefault();
          // Jump 10 items up
          setFocusedIndex(prev => {
            const next = Math.max(prev - 10, 0);
            if (onSelect && next !== prev) {
              onSelect(items[next], next);
            }
            return next;
          });
        }
        break;
    }
  }, [
    enabled,
    isOpen,
    mode,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    activateCurrent,
    onClose,
    items,
    onSelect
  ]);

  // Full mode: Scroll focused item into view
  useEffect(() => {
    if (mode !== 'full' || focusedIndex < 0 || !containerRef?.current) return;

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
  }, [focusedIndex, containerRef, mode]);

  // Get props for focusable items (full mode only)
  const getFocusProps = useCallback((index: number): {
    tabIndex: number;
    'data-index': number;
    'aria-selected': boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
  } | undefined => {
    if (mode !== 'full') return undefined;

    return {
      tabIndex: index === focusedIndex || (focusedIndex === -1 && index === 0) ? 0 : -1,
      'data-index': index,
      'aria-selected': index === focusedIndex,
      onKeyDown: handleKeyDown
    };
  }, [focusedIndex, handleKeyDown, mode]);

  const result: UseListNavigationResult = {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown
  };

  if (mode === 'full') {
    result.getFocusProps = getFocusProps as (index: number) => {
      tabIndex: number;
      'data-index': number;
      'aria-selected': boolean;
      onKeyDown: (e: React.KeyboardEvent) => void;
    };
  }

  return result;
}

// ============================================================================
// LEGACY COMPATIBILITY EXPORTS
// ============================================================================

/**
 * @deprecated Use useListNavigation with mode='simple' instead
 * This is a compatibility wrapper for useKeyboardNav
 */
export function useKeyboardNav<T>(config: {
  items: T[];
  isOpen: boolean;
  onSelect: (item: T) => void;
  onClose: () => void;
}) {
  const { focusedIndex: activeIndex, setFocusedIndex: setActiveIndex, handleKeyDown } = useListNavigation({
    items: config.items,
    mode: 'simple',
    isOpen: config.isOpen,
    onSelect: (item) => config.onSelect(item),
    onClose: config.onClose,
    circular: true
  });

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown
  };
}

/**
 * @deprecated Use useListNavigation with mode='full' instead
 * This is a compatibility wrapper for useKeyboardNavigation
 */
export function useKeyboardNavigation<T>(config: {
  items: T[];
  onSelect?: (item: T, index: number) => void;
  onActivate?: (item: T, index: number) => void;
  initialIndex?: number;
  enabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}) {
  return useListNavigation({
    ...config,
    mode: 'full',
    circular: false
  });
}
