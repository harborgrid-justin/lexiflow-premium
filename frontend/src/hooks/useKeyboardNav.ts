/**
 * @module hooks/useKeyboardNav
 * @category Hooks - Keyboard Navigation
 * @description Keyboard navigation hook for dropdown/list components with arrow keys, Enter to select,
 * and Escape to close. Manages active index state with circular navigation and auto-reset on list
 * changes. Provides handleKeyDown callback for event binding.
 *
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (activeIndex) + actions (setActiveIndex, handleKeyDown)
 * - Declarative: Consumers query current index and invoke navigation
 *
 * LIFECYCLE ASSUMPTIONS (G58):
 * - activeIndex starts: -1 when closed, 0 when opened
 * - activeIndex resets: When isOpen changes or items change
 * - activeIndex cycles: Via modulo arithmetic (circular navigation)
 * - activeIndex persists: Until list closes or changes
 *
 * PURE COMPUTATION (G42):
 * - Navigation logic: Synchronous index arithmetic
 * - No side effects in calculations
 *
 * SEMANTIC MEMOIZATION (G53):
 * - useCallback on handleKeyDown for referential stability
 * - Prevents parent re-renders from recreating handler
 *
 * CONCURRENCY SAFETY (G49, G50):
 * - Idempotent: State updates use functional form
 * - Render-count independent: No render counting
 *
 * DOMAIN PRIMITIVE (G48):
 * - Encodes keyboard navigation semantics
 * - Abstracts arrow key, Enter, Escape patterns
 *
 * NO THEME USAGE: Utility hook for keyboard interaction logic
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useEffect, useState } from "react";

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
  onClose,
}: UseKeyboardNavProps<T>): UseKeyboardNavReturn {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // G58 (LIFECYCLE): Reset index when list changes or closes
  useEffect(() => {
    setActiveIndex(isOpen && items.length > 0 ? 0 : -1);
    // CAUSAL DEPENDENCIES (G46):
    // - isOpen: Changes trigger reset to initial state
    // - items: Changes (search results) trigger reset to first item
  }, [isOpen, items]);

  // G53 (SEMANTIC MEMOIZATION): Stable handler for event binding
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          // G42 (PURE COMPUTATION): Circular navigation via modulo
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          // G42 (PURE COMPUTATION): Reverse circular navigation
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Enter":
          e.preventDefault();
          // G54 (FAIL-FAST): Boundary check before selection
          if (activeIndex >= 0 && activeIndex < items.length) {
            const item = items[activeIndex];
            if (item) onSelect(item);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    // CAUSAL DEPENDENCIES (G46):
    // - isOpen: Guard condition depends on open state
    // - items: Navigation operates on items array
    // - activeIndex: Enter key uses current index
    // - onSelect/onClose: Callbacks invoked on actions
    [isOpen, items, activeIndex, onSelect, onClose]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}
