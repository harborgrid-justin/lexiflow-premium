/**
 * @module hooks/useToggle
 * @category Hooks - UI Utilities
 * 
 * Provides boolean toggle state management with intent-based controls.
 * Commonly used for modals, dropdowns, collapsible sections, and visibility toggles.
 * 
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (isOpen) + declarative actions (open, close, toggle)
 * - NOT action-oriented: Consumers get state + control, not just commands
 * - Stable contract: Return shape never changes, only state value changes
 * 
 * STABLE CONTRACT (G43):
 * - Public API: { isOpen, toggle, open, close }
 * - Implementation can change (useState vs useReducer) without breaking consumers
 * - Referential stability: Callbacks memoized via useCallback
 * 
 * SEMANTIC MEMOIZATION (G53):
 * - useCallback ensures open/close/toggle are referentially stable
 * - NOT for micro-optimization: prevents child re-renders when passed as props
 * - Semantic intent: callback identity should remain stable across renders
 * 
 * CONCURRENCY SAFETY (G49, G50):
 * - Idempotent: Multiple renders don't accumulate side effects
 * - State updates use functional form: safe under concurrent rendering
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
 * G53 (SEMANTIC MEMOIZATION): useCallback ensures referential stability
 * for semantic reasons (prop identity), not performance optimization.
 * 
 * G49 (IDEMPOTENCY): Safe under re-execution - functional state updates
 * prevent accumulation of side effects.
 * 
 * @param initialState - Initial boolean state (default: false)
 * @returns Object with isOpen state and control methods
 */
export function useToggle(initialState: boolean = false): UseToggleReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  // G53: Memoized for semantic stability, not micro-optimization
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, open, close };
}
