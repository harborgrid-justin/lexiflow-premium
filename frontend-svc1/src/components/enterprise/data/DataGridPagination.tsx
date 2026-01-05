/**
 * @module components/enterprise/data/DataGridPagination
 * @category Enterprise
 * @description Pagination controls for DataGrid with page navigation and size selection.
 *
 * Features:
 * - Page navigation (first, previous, next, last)
 * - Page number display
 * - Total rows and pages display
 * - Page size selection
 * - Jump to page input
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalRows: number;
}

export interface DataGridPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageJumper?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataGridPagination({
  currentPage,
  totalPages,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100, 250],
  showPageSizeSelector = true,
  showPageJumper = true,
}: DataGridPaginationProps) {
  const { theme } = useTheme();
  const [jumpToPage, setJumpToPage] = useState('');

  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);

  const handleFirstPage = useCallback(() => {
    onPageChange(0);
  }, [onPageChange]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleLastPage = useCallback(() => {
    onPageChange(totalPages - 1);
  }, [totalPages, onPageChange]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    onPageSizeChange?.(newSize);
    // Reset to first page when changing page size
    onPageChange(0);
  }, [onPageChange, onPageSizeChange]);

  const handleJumpToPage = useCallback(() => {
    const page = parseInt(jumpToPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page - 1); // Convert to 0-based index
      setJumpToPage('');
    }
  }, [jumpToPage, totalPages, onPageChange]);

  const handleJumpKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  }, [handleJumpToPage]);

  // Generate page numbers to display
  const getPageNumbers = useCallback(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      const leftSiblingIndex = Math.max(currentPage - 1, 0);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages - 1);

      const showLeftDots = leftSiblingIndex > 1;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      // Always show first page
      pages.push(0);

      if (showLeftDots) {
        pages.push('...');
      }

      // Show current page and siblings
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i > 0 && i < totalPages - 1) {
          pages.push(i);
        }
      }

      if (showRightDots) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages - 1);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalRows === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t",
        theme.surface.default,
        theme.border.default
      )}
    >
      {/* Left: Info */}
      <div className="flex items-center gap-4">
        <span className={cn("text-sm", theme.text.secondary)}>
          Showing <span className="font-medium">{startRow}</span> to{' '}
          <span className="font-medium">{endRow}</span> of{' '}
          <span className="font-medium">{totalRows}</span> results
        </span>

        {/* Page Size Selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className={cn("text-sm", theme.text.secondary)}>
              Show:
            </label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
              className={cn(
                "px-2 py-1 text-sm rounded border",
                theme.surface.default,
                theme.border.default,
                theme.text.primary,
                "focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              )}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Center: Page Navigation */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 0}
          className={cn(
            "px-3 py-1 text-sm rounded border transition-colors",
            theme.border.default,
            currentPage === 0
              ? cn("cursor-not-allowed opacity-50", theme.surface.highlight, theme.text.tertiary)
              : cn("hover:bg-opacity-80", theme.surface.default, theme.text.primary)
          )}
          title="First page"
        >
          ⟨⟨
        </button>

        {/* Previous Page */}
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className={cn(
            "px-3 py-1 text-sm rounded border transition-colors",
            theme.border.default,
            currentPage === 0
              ? cn("cursor-not-allowed opacity-50", theme.surface.highlight, theme.text.tertiary)
              : cn("hover:bg-opacity-80", theme.surface.default, theme.text.primary)
          )}
          title="Previous page"
        >
          ⟨
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={cn("px-2 py-1 text-sm", theme.text.tertiary)}
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "px-3 py-1 text-sm rounded border transition-colors min-w-[2.5rem]",
                theme.border.default,
                isActive
                  ? "bg-blue-500 text-white border-blue-500 font-medium"
                  : cn("hover:bg-opacity-80", theme.surface.default, theme.text.primary)
              )}
            >
              {pageNum + 1}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
          className={cn(
            "px-3 py-1 text-sm rounded border transition-colors",
            theme.border.default,
            currentPage >= totalPages - 1
              ? cn("cursor-not-allowed opacity-50", theme.surface.highlight, theme.text.tertiary)
              : cn("hover:bg-opacity-80", theme.surface.default, theme.text.primary)
          )}
          title="Next page"
        >
          ⟩
        </button>

        {/* Last Page */}
        <button
          onClick={handleLastPage}
          disabled={currentPage >= totalPages - 1}
          className={cn(
            "px-3 py-1 text-sm rounded border transition-colors",
            theme.border.default,
            currentPage >= totalPages - 1
              ? cn("cursor-not-allowed opacity-50", theme.surface.highlight, theme.text.tertiary)
              : cn("hover:bg-opacity-80", theme.surface.default, theme.text.primary)
          )}
          title="Last page"
        >
          ⟩⟩
        </button>
      </div>

      {/* Right: Jump to Page */}
      {showPageJumper && totalPages > 1 && (
        <div className="flex items-center gap-2">
          <label className={cn("text-sm", theme.text.secondary)}>
            Go to:
          </label>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyPress={handleJumpKeyPress}
            placeholder="#"
            className={cn(
              "w-16 px-2 py-1 text-sm rounded border",
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
          <button
            onClick={handleJumpToPage}
            className={cn(
              "px-3 py-1 text-sm rounded border transition-colors",
              theme.border.default,
              "hover:bg-opacity-80",
              theme.surface.default,
              theme.text.primary
            )}
          >
            Go
          </button>
        </div>
      )}
    </div>
  );
}
