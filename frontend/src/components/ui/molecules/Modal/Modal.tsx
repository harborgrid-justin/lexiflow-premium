/**
 * @module components/common/Modal
 * @category Common Components
 * @description Modal dialog with backdrop and size variants.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useScrollLock } from '@/hooks/ui';

// Utils & Constants
import { cn } from '@/utils/cn';
import { tokens } from '@/components/theme/tokens';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ModalProps {
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Callback when the modal is closed. */
  onClose: () => void;
  /** Modal title. */
  title: React.ReactNode;
  /** Modal content. */
  children: React.ReactNode;
  /** Modal size variant. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Additional CSS classes. */
  className?: string;
  /** Optional footer content. */
  footer?: React.ReactNode;
  /** Whether clicking backdrop closes modal. */
  closeOnBackdrop?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Modal({
    isOpen, onClose, title, children, size = 'md', className = '', footer, closeOnBackdrop = true
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  // React 18: useId generates stable, unique IDs (SSR-safe)
  const titleId = React.useId();
  const modalRef = useRef<HTMLDivElement>(null);

  useScrollLock(titleId, isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus Trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
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
      }
      if (e.key === 'Escape') {
          onClose();
      }
    };

    // Focus first element on open
    if (firstElement) firstElement.focus();

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, onClose]);

  const handleBackdropClick = () => {
      if (closeOnBackdrop) {
          onClose();
      }
  };

  if (!isOpen || !mounted || typeof document === 'undefined' || !document.body) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]'
  };

  const modalContent = (
    <div
        className={cn("fixed inset-0 flex items-center justify-center p-4 sm:p-6", tokens.zIndex.modal)}
        aria-labelledby={titleId}
        role="dialog"
        aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn("absolute inset-0 backdrop-blur-sm transition-opacity animate-in fade-in duration-200", theme.backdrop)}
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Panel */}
      <div
        ref={modalRef}
        className={cn(
        "relative z-10 flex flex-col w-full mx-auto transform transition-all animate-in zoom-in-95 duration-200 border shadow-2xl rounded-xl",
        theme.surface.default,
        theme.border.default,
        sizes[size],
        "max-h-[calc(100dvh-3rem)]",
        className
      )}>
        {/* Header */}
        <div className={cn("flex items-center justify-between px-6 py-4 border-b shrink-0", theme.surface.default, theme.border.default)}>
          <h3 className={cn("text-lg font-bold leading-6 tracking-tight", theme.text.primary)} id={titleId}>
            {title}
          </h3>
          <button
            type="button"
            className={cn("rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500", theme.text.tertiary, `hover:${theme.text.secondary}`, `hover:${theme.surface.highlight}`)}
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className={cn("flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent", theme.text.primary)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn("px-6 py-4 border-t flex justify-end gap-3 shrink-0 bg-slate-50/50 rounded-b-xl", theme.border.default)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
