
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useWindow } from '../../context/WindowContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import { tokens } from '../../theme/tokens';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', className = '', footer }) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const modalId = React.useId();
  
  useScrollLock(modalId, isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

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
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn("absolute inset-0 backdrop-blur-sm transition-opacity animate-in fade-in duration-200", theme.backdrop)}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        "relative z-10 flex flex-col w-full mx-auto transform transition-all animate-in zoom-in-95 duration-200 border shadow-2xl rounded-xl",
        theme.surface.default,
        theme.border.default,
        sizes[size],
        "max-h-[calc(100dvh-3rem)]",
        className
      )}>
        {/* Header */}
        <div className={cn("flex items-center justify-between px-6 py-4 border-b shrink-0", theme.surface.default, theme.border.default)}>
          <h3 className={cn("text-lg font-bold leading-6 tracking-tight", theme.text.primary)} id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className={cn("rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500", theme.text.tertiary, `hover:${theme.text.secondary}`, `hover:${theme.surface.highlight}`)}
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
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
};