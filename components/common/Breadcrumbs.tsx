/**
 * @module components/common/Breadcrumbs
 * @category Common
 * @description Navigation breadcrumbs with home icon.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const { theme } = useTheme();
  
  return (
    <nav className={cn("flex items-center text-xs mb-4 flex-wrap", theme.text.secondary)} aria-label="Breadcrumb">
      <div className="flex items-center py-1">
         <Home className={cn("h-3 w-3 mr-1", theme.text.tertiary)} />
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className={cn("h-3 w-3 mx-1 shrink-0", theme.text.tertiary)} />
          <button 
            onClick={item.onClick}
            disabled={!item.onClick}
            className={cn(
              "transition-colors py-1 px-1 rounded -ml-1",
              item.onClick 
                ? cn(`hover:${theme.primary.text}`, `hover:${theme.surface.highlight}`)
                : cn("font-semibold cursor-default", theme.text.primary)
            )}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
};
