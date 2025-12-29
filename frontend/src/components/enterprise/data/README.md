# Enterprise Data Grid Components

Production-ready, type-safe data grid components for LexiFlow Premium v0.5.2.

## Features

✅ **High Performance**
- Virtualized scrolling with react-window for large datasets (10,000+ rows)
- Optimized rendering with React.memo and useMemo
- Minimal re-renders through efficient state management

✅ **Advanced Sorting**
- Multi-column sorting with visual indicators
- Sort direction toggle (asc → desc → none)
- Custom sort comparators for different data types

✅ **Powerful Filtering**
- Text filters (contains, case-insensitive)
- Number range filters (min/max)
- Date range filters (before/after/between)
- Select dropdown filters
- Collapsible filter panel with active filter count

✅ **Row Selection**
- Single or multi-row selection
- Select all functionality
- Visual selection feedback

✅ **Inline Editing**
- Click-to-edit cells
- Multiple editor types (text, number, date, select, checkbox, textarea)
- Auto-focus and keyboard shortcuts (Enter to save, Esc to cancel)

✅ **Pagination**
- Configurable page sizes
- Page navigation with first/previous/next/last
- Jump to specific page
- Visual page number display with ellipsis for many pages

✅ **Export Functionality**
- Export to CSV (ready for implementation)
- Export to Excel (ready for implementation)
- Extensible toolbar for custom actions

✅ **Type Safety**
- Full TypeScript support with generics
- Type-safe column definitions
- IntelliSense for column configuration

## Installation

All dependencies are already installed in the project:
- `react-window` (^2.2.3) - for virtualization

## Components

### Core Components

1. **DataGrid** - Main grid component with all features
2. **DataGridColumn** - Column definition types and helpers
3. **DataGridFilters** - Advanced filtering UI
4. **DataGridPagination** - Pagination controls
5. **DataGridToolbar** - Toolbar with actions and export
6. **InlineEditor** - Inline cell editing component

## Usage Examples

### Basic Example

```tsx
import { DataGrid, createColumns, textColumn, numberColumn } from '@/components/enterprise/data';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, role: 'User' },
  // ... more users
];

function UserTable() {
  const columns = createColumns<User>([
    textColumn('name', 'Name'),
    textColumn('email', 'Email'),
    numberColumn('age', 'Age'),
    textColumn('role', 'Role'),
  ]);

  return (
    <DataGrid
      data={users}
      columns={columns}
      enableVirtualization
      enableSorting
      enableFiltering
      enablePagination
    />
  );
}
```

### Advanced Example with All Features

```tsx
import {
  DataGrid,
  createColumns,
  textColumn,
  numberColumn,
  dateColumn,
  statusColumn,
  actionColumn,
  type ColumnDefinition,
} from '@/components/enterprise/data';

interface Invoice {
  id: number;
  invoiceNumber: string;
  client: string;
  amount: number;
  date: Date;
  status: 'paid' | 'pending' | 'overdue';
}

function InvoiceTable() {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  const columns = createColumns<Invoice>([
    textColumn('invoiceNumber', 'Invoice #', undefined, { width: 120 }),
    textColumn('client', 'Client', undefined, {
      width: 200,
      editable: true
    }),
    numberColumn('amount', 'Amount', undefined, {
      width: 150,
      editable: true,
      cell: ({ value }) => `$${value.toFixed(2)}`
    }),
    dateColumn('date', 'Date', undefined, 'short', { width: 120 }),
    statusColumn('status', 'Status', undefined, {
      paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
    }, { width: 120 }),
    actionColumn('actions', 'Actions', (row) => (
      <button onClick={() => handleView(row.id)}>View</button>
    ), { width: 100 }),
  ]);

  const handleExport = (format: 'csv' | 'excel') => {
    // Implement export logic
    console.log(`Exporting to ${format}`);
  };

  const handleCellEdit = (rowId: string | number, columnId: string, value: any) => {
    // Update your data
    console.log(`Edited row ${rowId}, column ${columnId}:`, value);
  };

  return (
    <DataGrid
      data={invoices}
      columns={columns}
      rowIdKey="id"

      // Virtualization
      enableVirtualization
      height={600}
      rowHeight={48}

      // Sorting
      enableSorting

      // Filtering
      enableFiltering

      // Selection
      enableSelection
      selectionMode="multiple"
      selectedRows={selectedRows}
      onSelectionChange={setSelectedRows}

      // Editing
      enableInlineEditing
      onCellEdit={handleCellEdit}

      // Pagination
      enablePagination
      pageSize={50}
      currentPage={currentPage}
      onPageChange={setCurrentPage}

      // Export
      onExport={handleExport}

      // Styling
      className="w-full"
    />
  );
}
```

### Custom Column Renderers

```tsx
const columns = createColumns<User>([
  {
    id: 'avatar',
    header: 'Avatar',
    accessorKey: 'avatarUrl',
    cell: ({ value, row }) => (
      <img
        src={value}
        alt={row.name}
        className="w-8 h-8 rounded-full"
      />
    ),
    width: 80,
    sortable: false,
  },
  {
    id: 'fullName',
    header: 'Full Name',
    cell: ({ row }) => `${row.firstName} ${row.lastName}`,
    sortable: true,
  },
]);
```

### Column Presets

The library includes several column presets for common data types:

```tsx
import {
  textColumn,      // Text data
  numberColumn,    // Numeric data with formatting
  currencyColumn,  // Currency with locale formatting
  dateColumn,      // Date with various formats
  booleanColumn,   // Checkbox display
  statusColumn,    // Colored status badges
  selectColumn,    // Dropdown selection
  actionColumn,    // Custom action buttons
  indexColumn,     // Row number
} from '@/components/enterprise/data';

const columns = [
  indexColumn(),
  textColumn('name', 'Name'),
  currencyColumn('price', 'Price', undefined, 'USD'),
  dateColumn('createdAt', 'Created', undefined, 'long'),
  booleanColumn('active', 'Active'),
  statusColumn('status', 'Status'),
  actionColumn('actions', '', (row) => <ActionButtons row={row} />),
];
```

## API Reference

### DataGrid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | Required | Array of data objects |
| `columns` | `ColumnDefinition<T>[]` | Required | Column definitions |
| `rowIdKey` | `keyof T` | `'id'` | Property to use as row ID |
| `enableVirtualization` | `boolean` | `true` | Enable virtualized scrolling |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `enableFiltering` | `boolean` | `true` | Enable filtering |
| `enableSelection` | `boolean` | `false` | Enable row selection |
| `enableInlineEditing` | `boolean` | `false` | Enable inline editing |
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Selection mode |
| `pageSize` | `number` | `50` | Rows per page |
| `height` | `number` | `600` | Grid height in pixels |
| `rowHeight` | `number` | `48` | Row height in pixels |
| `onSelectionChange` | `(rows: Set) => void` | - | Selection callback |
| `onSortChange` | `(state: SortState[]) => void` | - | Sort callback |
| `onFilterChange` | `(filters: Record) => void` | - | Filter callback |
| `onPageChange` | `(page: number) => void` | - | Page change callback |
| `onCellEdit` | `(rowId, col, val) => void` | - | Edit callback |
| `onExport` | `(format: 'csv' \| 'excel') => void` | - | Export callback |

### Column Definition

```typescript
interface ColumnDefinition<T> {
  id: string;                    // Unique column ID
  header: string;                // Display header
  accessorKey?: string;          // Path to data (e.g., 'user.name')
  cell?: (context) => ReactNode; // Custom cell renderer
  width?: number;                // Column width
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;            // Enable sorting
  filterable?: boolean;          // Enable filtering
  editable?: boolean;            // Enable editing
  editorType?: EditorType;       // Editor type
  editorOptions?: EditorOption[]; // Options for select editor
}
```

## Performance Tips

1. **Use virtualization** for datasets > 100 rows
2. **Memoize data** to prevent unnecessary re-renders
3. **Use pagination** for very large datasets (10,000+ rows)
4. **Limit active filters** to maintain performance
5. **Use `rowIdKey`** to ensure stable row identity

## Theme Integration

All components use the theme context from `@/providers/ThemeContext` for consistent styling across light/dark modes.

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus management for inline editing
- Screen reader friendly

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Files Created

- `/frontend/src/components/enterprise/data/DataGrid.tsx` (626 lines)
- `/frontend/src/components/enterprise/data/DataGridColumn.tsx` (426 lines)
- `/frontend/src/components/enterprise/data/DataGridFilters.tsx` (419 lines)
- `/frontend/src/components/enterprise/data/DataGridPagination.tsx` (343 lines)
- `/frontend/src/components/enterprise/data/DataGridToolbar.tsx` (282 lines)
- `/frontend/src/components/enterprise/data/InlineEditor.tsx` (344 lines)
- `/frontend/src/components/enterprise/data/index.ts` (133 lines)

**Total: 2,573 lines of production-ready TypeScript code**

## Next Steps

1. Implement actual CSV/Excel export logic in your application
2. Add custom toolbar actions as needed
3. Customize theme colors via ThemeContext
4. Add additional column presets for your specific use cases
5. Implement server-side pagination/filtering for very large datasets

## License

Part of LexiFlow Premium v0.5.2
