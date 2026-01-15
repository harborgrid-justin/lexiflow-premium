/**
 * @module components/common/FilterPanel
 * @category Common
 * @description Collapsible filter panel with grid layout.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useId } from 'react';
import { X } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface FilterPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  onClear?: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * FilterPanel - React 18 optimized with React.memo
 * Prevents unnecessary re-renders of filter content
 */
export const FilterPanel = React.memo<FilterPanelProps>(({ isOpen, onClose, onClear, children, title = "Filters", className = "" }) => {
  const { theme } = useTheme();
  const panelId = useId();

  if (!isOpen) return null;

  return (
    <div 
      role="region"
      aria-labelledby={panelId}
      className={cn(
      "border rounded-lg p-4 animate-in slide-in-from-top-2 mb-4 shadow-sm",
      theme.surface.default,
      theme.border.default,
      className
    )}>
      <div className={cn("flex justify-between items-center mb-4 border-b pb-2", theme.border.default)}>
        <h4 id={panelId} className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>{title}</h4>
        <div className="flex items-center gap-3">
          {onClear && (
            <button 
              onClick={onClear} 
              className={cn("text-xs hover:underline font-medium", theme.primary.text)}
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className={cn("transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`)}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
});
