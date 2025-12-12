/**
 * FocusTrap.tsx
 * Modal focus management to trap keyboard focus within a container
 * Essential for accessible modals, dialogs, and popovers
 */

import React, { useEffect, useRef, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  initialFocus?: HTMLElement | null;
  returnFocus?: boolean;
  allowOutsideClick?: boolean;
  onEscape?: () => void;
  className?: string;
}

// ============================================================================
// Focusable Elements Selector
// ============================================================================

const FOCUSABLE_ELEMENTS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ============================================================================
// FocusTrap Component
// ============================================================================

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  initialFocus,
  returnFocus = true,
  allowOutsideClick = false,
  onEscape,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ============================================================================
  // Get Focusable Elements
  // ============================================================================

  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll(FOCUSABLE_ELEMENTS);
    return Array.from(elements) as HTMLElement[];
  };

  // ============================================================================
  // Focus First Element
  // ============================================================================

  const focusFirstElement = () => {
    if (initialFocus) {
      initialFocus.focus();
      return;
    }

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };

  // ============================================================================
  // Handle Tab Key
  // ============================================================================

  const handleTab = (e: KeyboardEvent) => {
    if (!active) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // ============================================================================
  // Handle Escape Key
  // ============================================================================

  const handleEscape = (e: KeyboardEvent) => {
    if (!active) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
    }
  };

  // ============================================================================
  // Handle Outside Click
  // ============================================================================

  const handleOutsideClick = (e: MouseEvent) => {
    if (!active || allowOutsideClick) return;

    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // ============================================================================
  // Setup and Cleanup
  // ============================================================================

  useEffect(() => {
    if (!active) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first element
    setTimeout(focusFirstElement, 0);

    // Add event listeners
    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      // Remove event listeners
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);

      // Return focus to previous element
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, returnFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// ============================================================================
// useFocusTrap Hook
// ============================================================================

export function useFocusTrap(active: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // Store previous focus
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = container.querySelectorAll(FOCUSABLE_ELEMENTS);
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const elements = Array.from(container.querySelectorAll(FOCUSABLE_ELEMENTS)) as HTMLElement[];
      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active]);

  return containerRef;
}

// ============================================================================
// FocusLock Component (alternative API)
// ============================================================================

export interface FocusLockProps {
  children: ReactNode;
  disabled?: boolean;
  returnFocus?: boolean;
}

export const FocusLock: React.FC<FocusLockProps> = ({
  children,
  disabled = false,
  returnFocus = true,
}) => {
  const ref = useFocusTrap(!disabled);

  return <div ref={ref}>{children}</div>;
};

// ============================================================================
// Modal Focus Guard (for modal dialogs)
// ============================================================================

export interface ModalFocusGuardProps {
  children: ReactNode;
  open: boolean;
  onClose?: () => void;
  className?: string;
}

export const ModalFocusGuard: React.FC<ModalFocusGuardProps> = ({
  children,
  open,
  onClose,
  className = '',
}) => {
  return (
    <FocusTrap
      active={open}
      returnFocus={true}
      onEscape={onClose}
      className={className}
    >
      {children}
    </FocusTrap>
  );
};

// ============================================================================
// useReturnFocus Hook
// ============================================================================

export function useReturnFocus(shouldReturn: boolean = true) {
  const previousElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store current focus
    previousElement.current = document.activeElement as HTMLElement;

    return () => {
      // Return focus on unmount
      if (shouldReturn && previousElement.current) {
        previousElement.current.focus();
      }
    };
  }, [shouldReturn]);
}

// ============================================================================
// useFocusOnMount Hook
// ============================================================================

export function useFocusOnMount(elementRef: React.RefObject<HTMLElement>, delay: number = 0) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      elementRef.current?.focus();
    }, delay);

    return () => clearTimeout(timeout);
  }, [elementRef, delay]);
}

export default FocusTrap;
