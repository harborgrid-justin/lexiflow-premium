/**
 * Modal Context
 * Global modal management system with stacking and data passing
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface Modal<T = any> {
  id: string;
  component: React.ComponentType<ModalProps<T>>;
  props?: T;
  options?: ModalOptions;
}

export interface ModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  data?: T;
}

export interface ModalOptions {
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  backdrop?: boolean;
  animation?: boolean;
  className?: string;
  zIndex?: number;
}

interface ModalContextType {
  modals: Modal[];
  openModal: <T = any>(
    component: React.ComponentType<ModalProps<T>>,
    props?: T,
    options?: ModalOptions
  ) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: <T = any>(id: string, props: Partial<T>) => void;
  isModalOpen: (id: string) => boolean;
  getModalCount: () => number;
  topModalId: string | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const DEFAULT_OPTIONS: ModalOptions = {
  closeOnBackdropClick: true,
  closeOnEscape: true,
  showCloseButton: true,
  size: 'md',
  centered: true,
  backdrop: true,
  animation: true,
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);

  // Open a new modal
  const openModal = useCallback(<T = any>(
    component: React.ComponentType<ModalProps<T>>,
    props?: T,
    options?: ModalOptions
  ): string => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newModal: Modal<T> = {
      id,
      component,
      props,
      options: { ...DEFAULT_OPTIONS, ...options },
    };

    setModals(prev => [...prev, newModal]);

    // Add body class to prevent scrolling
    if (document.body) {
      document.body.style.overflow = 'hidden';
    }

    return id;
  }, []);

  // Close a specific modal
  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const updated = prev.filter(modal => modal.id !== id);

      // Remove body scroll lock if no modals are open
      if (updated.length === 0 && document.body) {
        document.body.style.overflow = '';
      }

      return updated;
    });
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setModals([]);

    // Remove body scroll lock
    if (document.body) {
      document.body.style.overflow = '';
    }
  }, []);

  // Update modal props
  const updateModal = useCallback(<T = any>(id: string, props: Partial<T>) => {
    setModals(prev =>
      prev.map(modal =>
        modal.id === id
          ? { ...modal, props: { ...modal.props, ...props } }
          : modal
      )
    );
  }, []);

  // Check if a modal is open
  const isModalOpen = useCallback((id: string): boolean => {
    return modals.some(modal => modal.id === id);
  }, [modals]);

  // Get the number of open modals
  const getModalCount = useCallback((): number => {
    return modals.length;
  }, [modals]);

  // Get the top modal ID
  const topModalId = useMemo(() => {
    return modals.length > 0 ? modals[modals.length - 1].id : null;
  }, [modals]);

  // Handle escape key to close top modal
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.options?.closeOnEscape !== false) {
          closeModal(topModal.id);
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modals, closeModal]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (document.body) {
        document.body.style.overflow = '';
      }
    };
  }, []);

  // Memoize context value
  const value = useMemo<ModalContextType>(() => ({
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    isModalOpen,
    getModalCount,
    topModalId,
  }), [
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    isModalOpen,
    getModalCount,
    topModalId,
  ]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* Render all open modals */}
      {modals.map((modal, index) => {
        const ModalComponent = modal.component;
        const zIndex = (modal.options?.zIndex || 1000) + index;

        return (
          <div
            key={modal.id}
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex }}
          >
            {/* Backdrop */}
            {modal.options?.backdrop !== false && (
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  if (modal.options?.closeOnBackdropClick !== false) {
                    closeModal(modal.id);
                  }
                }}
              />
            )}

            {/* Modal Content */}
            <div className="relative z-10">
              <ModalComponent
                isOpen={true}
                onClose={() => closeModal(modal.id)}
                data={modal.props}
              />
            </div>
          </div>
        );
      })}
    </ModalContext.Provider>
  );
};

export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
