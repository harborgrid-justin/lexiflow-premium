'use client';

/**
 * Modal/Dialog Component - Overlay dialog for modals
 */

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  isOpen,
  title,
  children,
  footer,
  onClose,
  size = 'md',
  closeButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-white dark:bg-slate-900 rounded-lg shadow-xl
          border border-slate-200 dark:border-slate-800
          w-full mx-4
          ${sizeStyles[size]}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closeButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            {title && (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h2>
            )}
            {closeButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
