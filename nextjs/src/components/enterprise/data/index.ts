/**
 * @module components/enterprise/data
 * @category Enterprise
 * @description Enterprise data grid and table components with advanced features.
 *
 * This module provides a comprehensive data grid solution with:
 * - Virtualized scrolling for large datasets
 * - Multi-column sorting
 * - Advanced filtering (text, number, date, select)
 * - Row selection (single/multi)
 * - Inline editing
 * - Pagination controls
 * - Column resizing and reordering
 * - Export to CSV/Excel
 *
 * @example
 * ```tsx
 * import { DataGrid, createColumns, textColumn, numberColumn } from '@/components/enterprise/data';
 *
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 *   age: number;
 * }
 *
 * const columns = createColumns<User>([
 *   textColumn('name', 'Name'),
 *   textColumn('email', 'Email'),
 *   numberColumn('age', 'Age'),
 * ]);
 *
 * function MyComponent() {
 *   const users: User[] = [...];
 *
 *   return (
 *     <DataGrid
 *       data={users}
 *       columns={columns}
 *       enableVirtualization
 *       enableSorting
 *       enableFiltering
 *       enablePagination
 *     />
 *   );
 * }
 * ```
 */

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

export { DataGrid } from './DataGrid';
export type {
  DataGridProps,
  SortDirection,
  SortState,
  RowSelectionState,
  EditingCell,
} from './DataGrid';

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

export type {
  ColumnDefinition,
  ColumnAlignment,
  EditorType,
  CellContext,
  EditorOption,
  InferDataType,
} from './DataGridColumn';

export {
  createColumn,
  createColumns,
  textColumn,
  numberColumn,
  currencyColumn,
  dateColumn,
  booleanColumn,
  statusColumn,
  selectColumn,
  actionColumn,
  indexColumn,
  validateColumns,
  isEditableColumn,
  isSortableColumn,
  isFilterableColumn,
} from './DataGridColumn';

// ============================================================================
// FILTERS
// ============================================================================

export { DataGridFilters } from './DataGridFilters';
export type {
  FilterType,
  FilterConfig,
  FilterValue,
  DataGridFiltersProps,
} from './DataGridFilters';

// ============================================================================
// PAGINATION
// ============================================================================

export { DataGridPagination } from './DataGridPagination';
export type {
  PaginationState,
  DataGridPaginationProps,
} from './DataGridPagination';

// ============================================================================
// TOOLBAR
// ============================================================================

export { DataGridToolbar } from './DataGridToolbar';
export type {
  ToolbarAction,
  DataGridToolbarProps,
} from './DataGridToolbar';

// ============================================================================
// INLINE EDITOR
// ============================================================================

export { InlineEditor } from './InlineEditor';
export type {
  CellEditorProps,
} from './InlineEditor';

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToMultipleFormats,
  exportSelectedRows,
} from './DataGridExport';
export type {
  ExportOptions,
  CSVExportOptions,
  ExcelExportOptions,
  PDFExportOptions,
} from './DataGridExport';

// ============================================================================
// FUZZY SEARCH
// ============================================================================

export {
  fuzzySearch,
  createSearchIndex,
  searchIndex,
  levenshteinDistance,
  levenshteinSimilarity,
  damerauLevenshteinDistance,
  damerauLevenshteinSimilarity,
  trigramSimilarity,
  soundex,
  highlightMatches,
} from './FuzzySearch';
export type {
  FuzzySearchOptions,
  SearchResult,
  MatchInfo,
  SearchIndex,
} from './FuzzySearch';

// ============================================================================
// SEARCH COMPONENT
// ============================================================================

export { DataGridSearch } from './DataGridSearch';
export type {
  DataGridSearchProps,
} from './DataGridSearch';

// ============================================================================
// COLUMN RESIZER
// ============================================================================

export {
  ColumnResizer,
  useColumnResizer,
  calculateAutoFitWidth,
  distributeColumnWidths,
  saveColumnWidths,
  loadColumnWidths,
  resetColumnWidths,
} from './DataGridColumnResizer';
export type {
  ColumnResizerProps,
  UseColumnResizerOptions,
} from './DataGridColumnResizer';
