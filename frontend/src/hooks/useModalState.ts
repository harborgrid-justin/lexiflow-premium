/**
 * useModalState.ts
 * 
 * Reusable hook for managing modal open/close state
 * Replaces 50+ instances of useState(false) for modals
 */

import { useState, useCallback } from 'react';

export interface UseModalStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * useModalState - Unified modal state management
 * 
 * @example
 * ```tsx
 * const createModal = useModalState();
 * const editModal = useModalState();
 * const deleteModal = useModalState();
 * 
 * <Button onClick={createModal.open}>Create</Button>
 * <Modal isOpen={createModal.isOpen} onClose={createModal.close}>...</Modal>
 * ```
 */
export const useModalState = (initialState = false): UseModalStateReturn => {
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
};
