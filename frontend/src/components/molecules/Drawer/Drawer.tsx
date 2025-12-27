/**
 * @module components/common/Drawer
 * @category Common
 * @description Slide-out drawer panel from the right.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, width = 'max-w-md' }) => {
  const { theme } = useTheme();
  const titleId = useId();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className={cn("fixed inset-0 transition-opacity", theme.backdrop)} 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
        "relative w-full h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl", 
        width,
        theme.surface.default
      )}>
        <div className={cn("flex items-center justify-between p-4 border-b", theme.surface.highlight, theme.border.default)}>
          <h3 id={titleId} className={cn("font-bold text-lg", theme.text.primary)}>{title}</h3>
          <button onClick={onClose} className={cn("p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface.default}`)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
