/**
 * @module components/enterprise/data/DataGrid
 * @category Enterprise
 * @description Advanced enterprise data grid with virtualization, sorting, filtering, and inline editing.
 *
 * Features:
 * - Virtualized scrolling for large datasets (react-window)
 * - Multi-column sorting
 * - Advanced filtering (text, date, number ranges)
 * - Row selection (single/multi)
 * - Inline editing
 * - Column resizing and reordering
 * - Pagination
 * - Export to CSV/Excel
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { DataGridColumn, ColumnDefinition } from './DataGridColumn';
import { DataGridFilters, FilterValue, FilterConfig } from './DataGridFilters';
import { DataGridPagination, PaginationState } from './DataGridPagination';
import { DataGridToolbar } from './DataGridToolbar';
import { InlineEditor, CellEditorProps } from './InlineEditor';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState<T> {
  columnId: keyof T | string;
  direction: SortDirection;
}

export interface RowSelectionState {
  selectedRows: Set<string | number>;
  selectAll: boolean;
}

export interface EditingCell {
  rowId: string | number;
  columnId: string;
}

export interface DataGridProps<T extends Record<string, any>> {
  // Data
  data: T[];
  columns: ColumnDefinition<T>[];

  // Identification
  rowIdKey?: keyof T;

  // Features
  enableVirtualization?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  enableInlineEditing?: boolean;
  enablePagination?: boolean;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;

  // Multi-select
  selectionMode?: 'single' | 'multiple';
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedRows: Set<string | number>) => void;

  // Sorting
  sortState?: SortState<T>[];
  onSortChange?: (sortState: SortState<T>[]) => void;

  // Filtering
  filters?: Record<string, FilterValue>;
  onFilterChange?: (filters: Record<string, FilterValue>) => void;

  // Pagination
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;

  // Editing
  onCellEdit?: (rowId: string | number, columnId: string, value: any) => void;

  // Export
  onExport?: (format: 'csv' | 'excel') => void;

  // Styling
  className?: string;
  height?: number;
  rowHeight?: number;

  // Empty state
  emptyMessage?: string;

  // Loading
  loading?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNestedValue<T>(obj: T, path: string): any {
  return path.split('.').reduce((acc: any, part) => acc?.[part], obj);
}

function compareValues(a: any, b: any, direction: SortDirection): number {
  if (direction === null) return 0;

  // Handle null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return direction === 'asc' ? -1 : 1;
  if (b == null) return direction === 'asc' ? 1 : -1;

  // Handle different types
  if (typeof a === 'string' && typeof b === 'string') {
    return direction === 'asc'
      ? a.localeCompare(b)
      : b.localeCompare(a);
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return direction === 'asc'
      ? a.getTime() - b.getTime()
      : b.getTime() - a.getTime();
  }

  // Fallback to string comparison
  const aStr = String(a);
  const bStr = String(b);
  return direction === 'asc'
    ? aStr.localeCompare(bStr)
    : bStr.localeCompare(aStr);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataGrid<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  rowIdKey = 'id' as keyof T,
  enableVirtualization = true,
  enableSorting = true,
  enableFiltering = true,
  enableSelection = false,
  enableInlineEditing = false,
  enablePagination = true,
  enableColumnResizing = true,
  enableColumnReordering = false,
  selectionMode = 'multiple',
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  sortState: controlledSortState,
  onSortChange,
  filters: controlledFilters,
  onFilterChange,
  pageSize = 50,
  currentPage: controlledCurrentPage = 0,
  onPageChange,
  onCellEdit,
  onExport,
  className,
  height = 600,
  rowHeight = 48,
  emptyMessage = 'No data available',
  loading = false,
}: DataGridProps<T>) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Internal state (when not controlled)
  const [internalSelectedRows, setInternalSelectedRows] = useState<Set<string | number>>(new Set());
  const [internalSortState, setInternalSortState] = useState<SortState<T>[]>([]);
  const [internalFilters, setInternalFilters] = useState<Record<string, FilterValue>>({});
  const [internalCurrentPage, setInternalCurrentPage] = useState(0);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [columns, setColumns] = useState(initialColumns);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // Use controlled or internal state
  const selectedRows = controlledSelectedRows ?? internalSelectedRows;
  const setSelectedRows = onSelectionChange ?? setInternalSelectedRows;
  const sortState = controlledSortState ?? internalSortState;
  const setSortState = onSortChange ?? setInternalSortState;
  const filters = controlledFilters ?? internalFilters;
  const setFilters = onFilterChange ?? setInternalFilters;
  const currentPage = controlledCurrentPage ?? internalCurrentPage;
  const setCurrentPage = onPageChange ?? setInternalCurrentPage;

  // Measure container width for column sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);

    return () => observer.disconnect();
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    if (!enableFiltering || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter((row) => {
      return Object.entries(filters).every(([columnId, filterValue]) => {
        if (!filterValue) return true;

        const column = columns.find(col => col.id === columnId);
        if (!column) return true;

        const cellValue = getNestedValue(row, column.accessorKey || columnId);

        // Handle different filter types
        if (typeof filterValue === 'object' && 'type' in filterValue) {
          const filter = filterValue as FilterConfig;

          switch (filter.type) {
            case 'text':
              if (!filter.value) return true;
              return String(cellValue || '').toLowerCase().includes(String(filter.value).toLowerCase());

            case 'number':
              const numValue = Number(cellValue);
              if (filter.min !== undefined && numValue < filter.min) return false;
              if (filter.max !== undefined && numValue > filter.max) return false;
              return true;

            case 'date':
              const dateValue = new Date(cellValue);
              if (filter.min && dateValue < new Date(filter.min)) return false;
              if (filter.max && dateValue > new Date(filter.max)) return false;
              return true;

            case 'select':
              if (!filter.value) return true;
              return cellValue === filter.value;

            default:
              return true;
          }
        }

        // Simple string filter fallback
        return String(cellValue || '').toLowerCase().includes(String(filterValue).toLowerCase());
      });
    });
  }, [data, filters, columns, enableFiltering]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!enableSorting || sortState.length === 0) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      for (const sort of sortState) {
        const column = columns.find(col => col.id === sort.columnId);
        if (!column) continue;

        const aValue = getNestedValue(a, column.accessorKey || String(sort.columnId));
        const bValue = getNestedValue(b, column.accessorKey || String(sort.columnId));

        const comparison = compareValues(aValue, bValue, sort.direction);
        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  }, [filteredData, sortState, columns, enableSorting]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!enablePagination) {
      return sortedData;
    }

    const start = currentPage * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  // Display data (what actually gets rendered)
  const displayData = paginatedData;
  const totalRows = sortedData.length;
  const totalPages = enablePagination ? Math.ceil(totalRows / pageSize) : 1;

  // Handle sorting
  const handleSort = useCallback((columnId: keyof T | string) => {
    if (!enableSorting) return;

    setSortState((prev) => {
      const existingIndex = prev.findIndex(s => s.columnId === columnId);

      if (existingIndex === -1) {
        // Add new sort
        return [...prev, { columnId, direction: 'asc' as SortDirection }];
      }

      const existing = prev[existingIndex];
      const newDirection: SortDirection =
        existing.direction === 'asc' ? 'desc' :
        existing.direction === 'desc' ? null :
        'asc';

      if (newDirection === null) {
        // Remove sort
        return prev.filter((_, i) => i !== existingIndex);
      }

      // Update sort direction
      const newSort = [...prev];
      newSort[existingIndex] = { columnId, direction: newDirection };
      return newSort;
    });
  }, [enableSorting, setSortState]);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (!enableSelection) return;

    if (selectedRows.size === displayData.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(displayData.map(row => row[rowIdKey]));
      setSelectedRows(allIds);
    }
  }, [enableSelection, selectedRows.size, displayData, rowIdKey, setSelectedRows]);

  const handleSelectRow = useCallback((rowId: string | number) => {
    if (!enableSelection) return;

    const newSelected = new Set(selectedRows);

    if (selectionMode === 'single') {
      newSelected.clear();
      newSelected.add(rowId);
    } else {
      if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
      } else {
        newSelected.add(rowId);
      }
    }

    setSelectedRows(newSelected);
  }, [enableSelection, selectedRows, selectionMode, setSelectedRows]);

  // Handle cell editing
  const handleCellClick = useCallback((rowId: string | number, columnId: string, column: ColumnDefinition<T>) => {
    if (!enableInlineEditing || !column.editable) return;
    setEditingCell({ rowId, columnId });
  }, [enableInlineEditing]);

  const handleCellSave = useCallback((value: any) => {
    if (!editingCell) return;

    onCellEdit?.(editingCell.rowId, editingCell.columnId, value);
    setEditingCell(null);
  }, [editingCell, onCellEdit]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  // Calculate column widths
  const calculatedColumnWidths = useMemo(() => {
    const totalWidth = containerWidth - (enableSelection ? 48 : 0); // Reserve space for checkbox
    const definedWidths = columns.reduce((sum, col) => {
      return sum + (columnWidths[col.id] || col.width || 150);
    }, 0);

    const widths: Record<string, number> = {};
    columns.forEach(col => {
      widths[col.id] = columnWidths[col.id] || col.width || 150;
    });

    return widths;
  }, [columns, containerWidth, enableSelection, columnWidths]);

  // Render header
  const renderHeader = () => (
    <div
      className={cn(
        "flex border-b sticky top-0 z-10",
        theme.surface.highlight,
        theme.border.default
      )}
      style={{ minWidth: 'max-content' }}
    >
      {enableSelection && (
        <div
          className={cn("flex items-center justify-center border-r", theme.border.default)}
          style={{ width: 48, flexShrink: 0 }}
        >
          {selectionMode === 'multiple' && (
            <input
              type="checkbox"
              checked={selectedRows.size === displayData.length && displayData.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
          )}
        </div>
      )}

      {columns.map((column) => {
        const sortInfo = sortState.find(s => s.columnId === column.id);
        const width = calculatedColumnWidths[column.id] || 150;

        return (
          <div
            key={column.id}
            className={cn(
              "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r select-none",
              theme.text.secondary,
              theme.border.default,
              enableSorting && column.sortable !== false && "cursor-pointer hover:bg-opacity-80"
            )}
            style={{
              width,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={() => column.sortable !== false && handleSort(column.id)}
          >
            <span className="truncate">{column.header}</span>
            {sortInfo && (
              <span className="ml-2 flex-shrink-0">
                {sortInfo.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  // Render row
  const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = displayData[index];
    const rowId = row[rowIdKey];
    const isSelected = selectedRows.has(rowId);

    return (
      <div
        style={style}
        className={cn(
          "flex border-b transition-colors",
          theme.border.subtle,
          isSelected && theme.surface.highlight,
          !isSelected && `hover:${theme.surface.highlight}`
        )}
      >
        {enableSelection && (
          <div
            className={cn("flex items-center justify-center border-r", theme.border.subtle)}
            style={{ width: 48, flexShrink: 0 }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectRow(rowId)}
              className="w-4 h-4 rounded cursor-pointer"
            />
          </div>
        )}

        {columns.map((column) => {
          const width = calculatedColumnWidths[column.id] || 150;
          const cellValue = getNestedValue(row, column.accessorKey || column.id);
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === column.id;

          return (
            <div
              key={column.id}
              className={cn(
                "px-4 py-3 text-sm border-r truncate",
                theme.text.primary,
                theme.border.subtle,
                enableInlineEditing && column.editable && "cursor-pointer"
              )}
              style={{
                width,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => handleCellClick(rowId, column.id, column)}
            >
              {isEditing ? (
                <InlineEditor
                  value={cellValue}
                  type={column.editorType || 'text'}
                  options={column.editorOptions}
                  onSave={handleCellSave}
                  onCancel={handleCellCancel}
                />
              ) : (
                <span className="truncate">
                  {column.cell ? column.cell({ value: cellValue, row }) : String(cellValue ?? '')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Handle export
  const handleExport = useCallback((format: 'csv' | 'excel') => {
    onExport?.(format);
  }, [onExport]);

  if (loading) {
    return (
      <div
        className={cn("flex items-center justify-center", theme.surface.default)}
        style={{ height }}
      >
        <div className={cn("text-sm", theme.text.secondary)}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", theme.surface.default, className)} ref={containerRef}>
      {/* Toolbar */}
      {(enableFiltering || onExport) && (
        <DataGridToolbar
          enableFiltering={enableFiltering}
          onExport={onExport ? handleExport : undefined}
        />
      )}

      {/* Filters */}
      {enableFiltering && (
        <DataGridFilters
          columns={columns}
          filters={filters}
          onFilterChange={setFilters}
        />
      )}

      {/* Grid */}
      <div
        className={cn("border rounded-lg overflow-hidden", theme.border.default)}
        style={{ height: enablePagination ? height - 60 : height }}
      >
        {displayData.length === 0 ? (
          <div
            className={cn("flex items-center justify-center h-full", theme.text.tertiary)}
          >
            {emptyMessage}
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {renderHeader()}

            {enableVirtualization ? (
              <List
                height={height - rowHeight - (enablePagination ? 60 : 0)}
                itemCount={displayData.length}
                itemSize={rowHeight}
                width="100%"
                overscanCount={5}
              >
                {renderRow}
              </List>
            ) : (
              <div className="overflow-auto flex-1">
                {displayData.map((_, index) => renderRow({
                  index,
                  style: { height: rowHeight }
                }))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {enablePagination && totalRows > 0 && (
        <DataGridPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRows={totalRows}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

DataGrid.displayName = 'DataGrid';
