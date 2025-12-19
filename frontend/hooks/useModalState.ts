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

/**
 * useMultipleModals - Manage multiple modal states efficiently
 * 
 * @example
 * ```tsx
 * const modals = useMultipleModals(['create', 'edit', 'delete']);
 * 
 * <Button onClick={modals.create.open}>Create</Button>
 * <Modal isOpen={modals.create.isOpen} onClose={modals.create.close}>...</Modal>
 * ```
 */
export const useMultipleModals = <T extends string>(
  modalNames: T[]
): Record<T, UseModalStateReturn> => {
  const modals = {} as Record<T, UseModalStateReturn>;
  
  modalNames.forEach(name => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    modals[name] = useModalState();
  });
  
  return modals;
};
