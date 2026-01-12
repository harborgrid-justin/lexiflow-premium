/**
 * @module components/enterprise/data/DataGridToolbar
 * @category Enterprise
 * @description Toolbar component for DataGrid with actions and export functionality.
 *
 * Features:
 * - Export to CSV
 * - Export to Excel
 * - Custom action buttons
 * - Search/filter toggle
 * - Column visibility toggle
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface DataGridToolbarProps {
  enableFiltering?: boolean;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  actions?: ToolbarAction[];
  title?: string;
  description?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataGridToolbar({
  onExport,
  actions = [],
  title,
  description,
}: DataGridToolbarProps) {
  const { theme } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    onExport?.(format);
    setShowExportMenu(false);
  }, [onExport]);

  // Don't render toolbar if no features are enabled
  if (!onExport && actions.length === 0 && !title) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b",
        theme.surface.default,
        theme.border.default
      )}
    >
      {/* Left: Title and Description */}
      <div className="flex flex-col gap-1">
        {title && (
          <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
            {title}
          </h3>
        )}
        {description && (
          <p className={cn("text-sm", theme.text.secondary)}>
            {description}
          </p>
        )}
      </div>

      {/* Right: Actions and Export */}
      <div className="flex items-center gap-2">
        {/* Custom Actions */}
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors",
              theme.border.default,
              action.disabled && "opacity-50 cursor-not-allowed",
              !action.disabled && "hover:opacity-80",
              getActionVariantClasses(action.variant || 'secondary', theme)
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}

        {/* Export Button */}
        {onExport && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded border transition-colors",
                theme.border.default,
                theme.surface.default,
                theme.text.primary,
                "hover:opacity-80"
              )}
            >
              <ExportIcon />
              Export
              <ChevronDownIcon className={cn("transition-transform", showExportMenu && "rotate-180")} />
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />

                {/* Menu */}
                <div
                  className={cn(
                    "absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-20",
                    theme.surface.default,
                    theme.border.default
                  )}
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                        theme.text.primary,
                        `hover:${theme.surface.highlight}`
                      )}
                    >
                      <CsvIcon />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                        theme.text.primary,
                        `hover:${theme.surface.highlight}`
                      )}
                    >
                      <ExcelIcon />
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                        theme.text.primary,
                        `hover:${theme.surface.highlight}`
                      )}
                    >
                      <PdfIcon />
                      Export as PDF
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

DataGridToolbar.displayName = 'DataGridToolbar';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getActionVariantClasses(variant: 'primary' | 'secondary' | 'danger', theme: ReturnType<typeof useTheme>['theme']): string {
  switch (variant) {
    case 'primary':
      return 'bg-blue-500 text-white border border-blue-500 hover:bg-blue-600';
    case 'danger':
      return 'bg-red-500 text-white border border-red-500 hover:bg-red-600';
    case 'secondary':
    default:
      return cn(
        'border',
        theme.surface.default,
        theme.text.primary,
        theme.border.default
      );
  }
}

// ============================================================================
// ICONS
// ============================================================================

function ExportIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function CsvIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
