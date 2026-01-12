/**
 * @module components/common/Pagination
 * @category Common
 * @description Pagination controls with page navigation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination - React 18 optimized with React.memo
 * Prevents unnecessary re-renders when parent state changes
 */
export const Pagination = React.memo<PaginationProps>(({ currentPage, totalPages, onPageChange, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("flex items-center justify-between border-t px-4 py-3 sm:px-6", theme.surface.default, theme.border.default, className)}>
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className={cn("text-sm", theme.text.secondary)}>
            Page <span className={cn("font-medium", theme.text.primary)}>{currentPage}</span> of <span className={cn("font-medium", theme.text.primary)}>{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={cn(
                "relative inline-flex items-center rounded-l-md px-3 py-2 ring-1 ring-inset focus:z-20 focus:outline-offset-0 disabled:opacity-50 min-h-[44px] min-w-[44px] justify-center transition-colors",
                theme.border.default,
                theme.surface.default,
                theme.text.secondary,
                `hover:${theme.surface.highlight}`
              )}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              aria-current="page"
              className={cn(
                "relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 min-h-[44px]",
                theme.primary.DEFAULT,
                theme.text.inverse
              )}
            >
              {currentPage}
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "relative inline-flex items-center rounded-r-md px-3 py-2 ring-1 ring-inset focus:z-20 focus:outline-offset-0 disabled:opacity-50 min-h-[44px] min-w-[44px] justify-center transition-colors",
                theme.border.default,
                theme.surface.default,
                theme.text.secondary,
                `hover:${theme.surface.highlight}`
              )}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
});
Pagination.displayName = 'Pagination';
