/**
 * @module hooks/useToggle
 * @category Hooks - UI Utilities
 * 
 * Provides boolean toggle state management with intent-based controls.
 * Commonly used for modals, dropdowns, collapsible sections, and visibility toggles.
 * 
 * @example
 * ```typescript
 * const drawer = useToggle(false);
 * 
 * <button onClick={drawer.open}>Open Drawer</button>
 * <Drawer isOpen={drawer.isOpen} onClose={drawer.close} />
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useToggle hook
 * Provides boolean state and intent-based control methods
 */
export interface UseToggleReturn {
  /** Current toggle state */
  isOpen: boolean;
  /** Toggle between true/false */
  toggle: () => void;
  /** Set to true */
  open: () => void;
  /** Set to false */
  close: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages boolean toggle state with stable callback references.
 * 
 * @param initialState - Initial boolean state (default: false)
 * @returns Object with isOpen state and control methods
 */
export function useToggle(initialState: boolean = false): UseToggleReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, open, close };
}
