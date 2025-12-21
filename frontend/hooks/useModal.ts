/**
 * @module hooks/useModal
 * @category Hooks - UI Utilities
 * @description Modal state hook with typed data payload support. Manages isOpen state and optional
 * data associated with the modal (e.g., editing entity, confirmation dialog data). Provides open,
 * close, and data setter methods with stable callback references.
 * 
 * NO THEME USAGE: Utility hook for modal state management
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback } from 'react';

// ============================================================================
// HOOK
// ============================================================================
export const useModal = <T = any>(initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    if (modalData) setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, open, close, data, setData };
};
