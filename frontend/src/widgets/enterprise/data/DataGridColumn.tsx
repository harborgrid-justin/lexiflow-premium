/**
 * @module components/enterprise/data/DataGridColumn
 * @category Enterprise
 * @description Column definition types and helper components for DataGrid.
 *
 * Provides type-safe column definitions with support for:
 * - Custom cell rendering
 * - Sorting configuration
 * - Filtering configuration
 * - Inline editing
 * - Column width and alignment
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ColumnAlignment = 'left' | 'center' | 'right';
export type EditorType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';

export interface CellContext<T, TValue = unknown> {
  value: TValue;
  row: T;
}

export interface EditorOption {
  label: string;
  value: string | number;
}

export interface ColumnDefinition<T extends Record<string, unknown>> {
  // Identification
  id: string;
  header: string;
  accessorKey?: string; // Path to the data (e.g., "user.name")

  // Rendering
  cell?: (context: CellContext<T, unknown>) => React.ReactNode;
  footer?: string | ((rows: T[]) => React.ReactNode);

  // Sizing
  width?: number;
  minWidth?: number;
  maxWidth?: number;

  // Alignment
  align?: ColumnAlignment;

  // Features
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;

  // Editing
  editorType?: EditorType;
  editorOptions?: EditorOption[];

  // Visibility
  hidden?: boolean;

  // Meta
  meta?: Record<string, unknown>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a column definition with type safety
 */
export function createColumn<T extends Record<string, unknown>>(
  definition: ColumnDefinition<T>
): ColumnDefinition<T> {
  return {
    sortable: true,
    filterable: true,
    editable: false,
    align: 'left',
    width: 150,
    ...definition,
  };
}

/**
 * Creates multiple columns with type safety
 */
export function createColumns<T extends Record<string, unknown>>(
  definitions: ColumnDefinition<T>[]
): ColumnDefinition<T>[] {
  return definitions.map(createColumn);
}

// ============================================================================
// PRESET COLUMN TYPES
// ============================================================================

/**
 * Text column preset
 */
export function textColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  accessorKey?: string,
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  return createColumn<T>({
    id,
    header,
    accessorKey: accessorKey || id,
    editorType: 'text',
    ...options,
  });
}

/**
 * Number column preset
 */
export function numberColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  accessorKey?: string,
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  return createColumn<T>({
    id,
    header,
    accessorKey: accessorKey || id,
    align: 'right',
    editorType: 'number',
    cell: ({ value }) => {
      if (value == null) return '';
      return typeof value === 'number'
        ? value.toLocaleString()
        : String(value);
    },
    ...options,
  });
}

/**
 * Currency column preset
 */
export function currencyColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  accessorKey?: string,
  currency: string = 'USD',
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  return createColumn<T>({
    id,
    header,
    accessorKey: accessorKey || id,
    align: 'right',
    editorType: 'number',
    cell: ({ value }) => {
      if (value == null) return '';
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(numValue);
    },
    ...options,
  });
}

/**
 * Date column preset
 */
export function dateColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  accessorKey?: string,
  format: 'short' | 'long' | 'full' = 'short',
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  return createColumn<T>({
    id,
    header,
    accessorKey: accessorKey || id,
    editorType: 'date',
    cell: ({ value }) => {
      if (!value) return '';
      const date = value instanceof Date ? value : new Date(String(value));

      switch (format) {
        case 'short':
          return date.toLocaleDateString();
        case 'long':
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        case 'full':
          return date.toLocaleString();
        default:
          return date.toLocaleDateString();
      }
    },
    ...options,
  });
}

/**
 * Boolean column preset (checkbox)
 */
export function booleanColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  accessorKey?: string,
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  return createColumn<T>({
    id,
    header,
    accessorKey: accessorKey || id,
    align: 'center',
    editorType: 'checkbox',
    cell: ({ value }) => (
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={!!value}
          readOnly
          className="w-4 h-4 rounded pointer-events-none"
        />
      </div>
    ),
    ...options,
  });
}

/**
 * Status badge column preset
 */
export function statusColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  accessorKey?: string,
  statusConfig?: Record<string, { label: string; color: string }>,
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  const defaultConfig = statusConfig || {
    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    error: { label: 'Error', color: 'bg-red-100 text-red-800' },
  };

  return createColumn<T>({
    id,
    header,
    accessorKey: accessorKey || id,
    align: 'center',
    editorType: 'select',
    editorOptions: Object.entries(defaultConfig).map(([value, config]) => ({
      label: config.label,
      value,
    })),
    cell: ({ value }) => {
      const config = defaultConfig[String(value)?.toLowerCase()] || {
        label: String(value),
        color: 'bg-gray-100 text-gray-800',
      };

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        >
          {config.label}
        </span>
      );
    },
    ...options,
  });
}

/**
 * Select column preset
 */
export function selectColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  options: EditorOption[],
  accessorKey?: string,
  columnOptions?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  return createColumn<T>({
    id,
    header,
    accessorKey: accessorKey || id,
    editorType: 'select',
    editorOptions: options,
    cell: ({ value }) => {
      const option = options.find(opt => opt.value === value);
      return option?.label || String(value);
    },
    ...columnOptions,
  });
}

/**
 * Action column preset (for buttons/actions)
 */
export function actionColumn<T extends Record<string, unknown>>(
  id: string,
  header: string,
  render: (row: T) => React.ReactNode,
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  return createColumn<T>({
    id,
    header,
    sortable: false,
    filterable: false,
    editable: false,
    align: 'center',
    width: 100,
    cell: ({ row }) => render(row),
    ...options,
  });
}

/**
 * Index column preset (row number)
 */
export function indexColumn<T extends Record<string, unknown>>(
  header: string = '#',
  options?: Partial<ColumnDefinition<T>>
): ColumnDefinition<T> {
  let currentIndex = 0;

  return createColumn<T>({
    id: '__index__',
    header,
    sortable: false,
    filterable: false,
    editable: false,
    align: 'center',
    width: 60,
    cell: () => {
      return ++currentIndex;
    },
    ...options,
  });
}

// ============================================================================
// COMPONENT PROPS VALIDATOR
// ============================================================================

/**
 * Validates column definitions
 */
export function validateColumns<T extends Record<string, unknown>>(
  columns: ColumnDefinition<T>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for duplicate IDs
  const ids = columns.map(col => col.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate column IDs found: ${duplicates.join(', ')}`);
  }

  // Check for required fields
  columns.forEach((col, index) => {
    if (!col.id) {
      errors.push(`Column at index ${index} is missing required 'id' field`);
    }
    if (!col.header) {
      errors.push(`Column '${col.id}' is missing required 'header' field`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

/**
 * Extract the data type from column definitions
 */
export type InferDataType<Columns extends readonly ColumnDefinition<Record<string, unknown>>[]> =
  Columns extends readonly ColumnDefinition<infer T>[] ? T : never;

/**
 * Type guard for checking if a column is editable
 */
export function isEditableColumn<T extends Record<string, unknown>>(
  column: ColumnDefinition<T>
): column is ColumnDefinition<T> & { editable: true } {
  return column.editable === true;
}

/**
 * Type guard for checking if a column is sortable
 */
export function isSortableColumn<T extends Record<string, unknown>>(
  column: ColumnDefinition<T>
): column is ColumnDefinition<T> & { sortable: true } {
  return column.sortable !== false;
}

/**
 * Type guard for checking if a column is filterable
 */
export function isFilterableColumn<T extends Record<string, unknown>>(
  column: ColumnDefinition<T>
): column is ColumnDefinition<T> & { filterable: true } {
  return column.filterable !== false;
}
