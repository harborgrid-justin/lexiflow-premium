/**
 * KeyboardNav.tsx
 * Keyboard navigation helpers and utilities
 * Provides arrow key navigation, shortcuts, and keyboard interactions
 */

import React, { useEffect, useCallback, useRef, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface KeyboardNavProps {
  children: ReactNode;
  onNavigate?: (direction: Direction) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
  className?: string;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

// ============================================================================
// KeyboardNav Component
// ============================================================================

export const KeyboardNav: React.FC<KeyboardNavProps> = ({
  children,
  onNavigate,
  onEnter,
  onEscape,
  enabled = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate?.('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate?.('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate?.('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate?.('right');
          break;
        case 'Enter':
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    };

    const container = containerRef.current;
    container?.addEventListener('keydown', handleKeyDown);

    return () => {
      container?.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onNavigate, onEnter, onEscape]);

  return (
    <div ref={containerRef} tabIndex={0} className={className}>
      {children}
    </div>
  );
};

// ============================================================================
// useKeyboardShortcuts Hook
// ============================================================================

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const matches =
          e.key === shortcut.key &&
          (shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey) &&
          (shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey) &&
          (shortcut.altKey === undefined || e.altKey === shortcut.altKey) &&
          (shortcut.metaKey === undefined || e.metaKey === shortcut.metaKey);

        if (matches) {
          e.preventDefault();
          shortcut.handler(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

// ============================================================================
// useArrowNavigation Hook (for lists)
// ============================================================================

export function useArrowNavigation(itemCount: number, loop: boolean = true) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const navigate = useCallback(
    (direction: Direction) => {
      setSelectedIndex(current => {
        let next = current;

        if (direction === 'up' || direction === 'left') {
          next = current - 1;
          if (next < 0) {
            next = loop ? itemCount - 1 : 0;
          }
        } else if (direction === 'down' || direction === 'right') {
          next = current + 1;
          if (next >= itemCount) {
            next = loop ? 0 : itemCount - 1;
          }
        }

        return next;
      });
    },
    [itemCount, loop]
  );

  const reset = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  const selectIndex = useCallback((index: number) => {
    setSelectedIndex(Math.max(0, Math.min(index, itemCount - 1)));
  }, [itemCount]);

  return {
    selectedIndex,
    navigate,
    reset,
    selectIndex,
  };
}

// ============================================================================
// useGridNavigation Hook (for 2D grids)
// ============================================================================

export function useGridNavigation(rows: number, columns: number) {
  const [selectedRow, setSelectedRow] = React.useState(0);
  const [selectedCol, setSelectedCol] = React.useState(0);

  const navigate = useCallback(
    (direction: Direction) => {
      switch (direction) {
        case 'up':
          setSelectedRow(row => Math.max(0, row - 1));
          break;
        case 'down':
          setSelectedRow(row => Math.min(rows - 1, row + 1));
          break;
        case 'left':
          setSelectedCol(col => Math.max(0, col - 1));
          break;
        case 'right':
          setSelectedCol(col => Math.min(columns - 1, col + 1));
          break;
      }
    },
    [rows, columns]
  );

  const reset = useCallback(() => {
    setSelectedRow(0);
    setSelectedCol(0);
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedRow(Math.max(0, Math.min(row, rows - 1)));
    setSelectedCol(Math.max(0, Math.min(col, columns - 1)));
  }, [rows, columns]);

  return {
    selectedRow,
    selectedCol,
    navigate,
    reset,
    selectCell,
  };
}

// ============================================================================
// useKeyPress Hook
// ============================================================================

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = React.useState(false);

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}

// ============================================================================
// useKeyCombo Hook (for key combinations)
// ============================================================================

export function useKeyCombo(
  keys: string[],
  callback: () => void,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMatch = keys.includes(e.key);
      const modifiersMatch =
        (options.ctrlKey === undefined || e.ctrlKey === options.ctrlKey) &&
        (options.shiftKey === undefined || e.shiftKey === options.shiftKey) &&
        (options.altKey === undefined || e.altKey === options.altKey) &&
        (options.metaKey === undefined || e.metaKey === options.metaKey);

      if (keyMatch && modifiersMatch) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, callback, options]);
}

// ============================================================================
// Roving Tabindex Hook (for accessible list navigation)
// ============================================================================

export function useRovingTabIndex(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback((index: number) => {
    return (element: HTMLElement | null) => {
      itemsRef.current[index] = element;
    };
  }, []);

  const getTabIndex = useCallback(
    (index: number) => {
      return index === focusedIndex ? 0 : -1;
    },
    [focusedIndex]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let newIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = index > 0 ? index - 1 : itemCount - 1;
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          newIndex = index < itemCount - 1 ? index + 1 : 0;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = itemCount - 1;
          break;
        default:
          return;
      }

      setFocusedIndex(newIndex);
      itemsRef.current[newIndex]?.focus();
    },
    [focusedIndex, itemCount]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    setItemRef,
    getTabIndex,
    handleKeyDown,
  };
}

// ============================================================================
// Common Keyboard Shortcuts
// ============================================================================

export const CommonShortcuts = {
  save: {
    key: 's',
    ctrlKey: true,
    description: 'Save',
  },
  undo: {
    key: 'z',
    ctrlKey: true,
    description: 'Undo',
  },
  redo: {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    description: 'Redo',
  },
  copy: {
    key: 'c',
    ctrlKey: true,
    description: 'Copy',
  },
  paste: {
    key: 'v',
    ctrlKey: true,
    description: 'Paste',
  },
  cut: {
    key: 'x',
    ctrlKey: true,
    description: 'Cut',
  },
  selectAll: {
    key: 'a',
    ctrlKey: true,
    description: 'Select All',
  },
  find: {
    key: 'f',
    ctrlKey: true,
    description: 'Find',
  },
  print: {
    key: 'p',
    ctrlKey: true,
    description: 'Print',
  },
};

export default KeyboardNav;
