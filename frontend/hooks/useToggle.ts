/**
 * @module hooks/useToggle
 * @category Hooks - UI Utilities
 * @description Simple boolean toggle hook with convenience methods for open, close, and toggle
 * actions. Provides stable callback references via useCallback. Commonly used for modals,
 * dropdowns, and collapsible sections.
 * 
 * NO THEME USAGE: Utility hook for boolean state management
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback } from 'react';

// ============================================================================
// HOOK
// ============================================================================
export const useToggle = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, open, close, setIsOpen };
};
