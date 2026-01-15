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
import { ChevronRight, Home } from 'lucide-react';
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

/**
 * Breadcrumbs - React 18 optimized with React.memo
 */
export const Breadcrumbs = React.memo<{ items: BreadcrumbItem[]; onNavigate?: (path: string) => void }>(({ items, onNavigate }) => {
  const { theme } = useTheme();

  return (
    <nav className={cn("flex items-center text-xs mb-4 flex-wrap", theme.text.secondary)} aria-label="Breadcrumb">
      <div className="flex items-center py-1">
        <Home className={cn("h-3 w-3 mr-1", theme.text.tertiary)} />
      </div>
      {/* IDENTITY-STABLE KEYS: Use label + index for stable reconciliation */}
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center">
          <ChevronRight className={cn("h-3 w-3 mx-1 shrink-0", theme.text.tertiary)} />
          <button
            onClick={() => {
              if (item.onClick) item.onClick();
              else if (onNavigate && item.path) onNavigate(item.path);
            }}
            disabled={!item.onClick && (!onNavigate || !item.path)}
            className={cn(
              "transition-colors py-1 px-1 rounded -ml-1",
              (item.onClick || (onNavigate && item.path))
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
});
