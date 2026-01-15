/**
 * @module hooks/useModalState
 * @category Hooks - UI State
 * 
 * Provides modal state management with intent-based controls.
 * Lightweight alternative to useModal without data payload support.
 * 
 * @example
 * ```typescript
 * const createModal = useModalState();
 * const editModal = useModalState();
 * 
 * <Button onClick={createModal.open}>Create</Button>
 * <Modal isOpen={createModal.isOpen} onClose={createModal.close}>
 *   Create form content
 * </Modal>
 * ```
 */

import { useState, useCallback } from 'react';

/**
 * Return type for useModalState hook
 */
export interface UseModalStateReturn {
  /** Whether modal is currently open */
  isOpen: boolean;
  /** Open modal */
  open: () => void;
  /** Close modal */
  close: () => void;
  /** Toggle modal open/closed */
  toggle: () => void;
}

/**
 * Manages modal open/closed state.
 * 
 * @param initialState - Initial open state (default: false)
 * @returns Object with isOpen state and control methods
 */
export function useModalState(initialState = false): UseModalStateReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}
