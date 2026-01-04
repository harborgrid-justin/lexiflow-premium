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
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface BreadcrumbItem {
  label: string;
export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

/**
 * Breadcrumbs - React 18 optimized with React.memo
 */
export const Breadcrumbs = React.memo<{ items: BreadcrumbItem[] }>(({ items }) => {
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
});
