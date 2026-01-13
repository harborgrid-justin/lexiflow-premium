# Enterprise Data Grid Components

Production-ready, type-safe data grid components for LexiFlow Premium v0.5.2 with advanced enterprise features.

## Features

✅ **High Performance**
- Virtualized scrolling with react-window for massive datasets (100,000+ rows)
- Optimized rendering with React.memo and useMemo
- Minimal re-renders through efficient state management
- Smart debouncing for search and filters

✅ **Advanced Sorting**
- Multi-column sorting with visual indicators
- Sort direction toggle (asc → desc → none)
- Custom sort comparators for different data types
- Stable sorting for consistent results

✅ **Powerful Filtering**
- Text filters (contains, case-insensitive)
- Number range filters (min/max)
- Date range filters (before/after/between)
- Select dropdown filters
- Collapsible filter panel with active filter count
- Real-time filter updates

✅ **Enterprise Search with Fuzzy Matching**
- Multiple similarity algorithms (Levenshtein, Damerau-Levenshtein, Trigram)
- Configurable threshold and algorithm selection
- Phonetic matching (Soundex)
- Multi-field weighted search
- Search history with result counts
- Advanced options panel
- Real-time search with debouncing
- Keyboard shortcuts (⌘K to focus)

✅ **Column Management**
- **Drag-to-resize columns** with visual feedback
- Double-click to auto-fit column width
- Min/max width constraints
- Persistent column widths (localStorage)
- Auto-distribute column widths
- Column visibility toggle (planned)

✅ **Export Functionality**
- **Export to CSV** with proper escaping and encoding
- **Export to Excel** with formatting and styles
- **Export to PDF** with tables and pagination
- Export all data or selected rows only
- Configurable export options
- Multiple format batch export
- Automatic filename generation with timestamps

✅ **Row Selection**
- Single or multi-row selection
- Select all functionality
- Visual selection feedback
- Export selected rows

✅ **Inline Editing**
- Click-to-edit cells
- Multiple editor types (text, number, date, select, checkbox, textarea)
- Auto-focus and keyboard shortcuts (Enter to save, Esc to cancel)
- Click outside to save
- Type-safe editing with validation

✅ **Pagination**
- Configurable page sizes (10, 25, 50, 100, 250)
- Page navigation with first/previous/next/last
- Jump to specific page
- Visual page number display with ellipsis for many pages
- Shows current range and total count

✅ **Type Safety**
- Full TypeScript strict mode compliance (100% - zero 'any' types)
- Type-safe column definitions with generics
- IntelliSense for all configuration
- Proper unknown types for dynamic values
- Strict null checks and type guards

## Installation

All dependencies are already installed in the project:
- `react-window` (^2.2.3) - for virtualization
- `jspdf` (^3.0.4) - for PDF export
- `date-fns` (^4.1.0) - for date utilities

## Components

### Core Components

1. **DataGrid** - Main grid component with all features
2. **DataGridColumn** - Column definition types and helpers
3. **DataGridFilters** - Advanced filtering UI
4. **DataGridPagination** - Pagination controls with page jump
5. **DataGridToolbar** - Toolbar with actions and export
6. **InlineEditor** - Inline cell editing component

### New Components (v0.5.2)

7. **DataGridSearch** - Enterprise search with fuzzy matching
8. **DataGridColumnResizer** - Column resizing functionality
9. **DataGridExport** - Export utilities for CSV/Excel/PDF
10. **FuzzySearch** - Advanced fuzzy search algorithms

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
      enableExport
      enableColumnResizing
    />
  );
}
```

### Advanced Example with Search and Export

```tsx
import {
  DataGrid,
  DataGridSearch,
  createColumns,
  textColumn,
  numberColumn,
  dateColumn,
  statusColumn,
  actionColumn,
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
  const [allInvoices, setAllInvoices] = useState<Invoice[]>(invoiceData);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoiceData);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

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

  const handleSearchResults = (results: Invoice[]) => {
    setFilteredInvoices(results);
  };

  const handleCellEdit = (rowId: string | number, columnId: string, value: any) => {
    // Update your data
    console.log(`Edited row ${rowId}, column ${columnId}:`, value);
  };

  return (
    <div className="space-y-4">
      {/* Enterprise Search */}
      <DataGridSearch
        data={allInvoices}
        columns={columns}
        onSearchResults={handleSearchResults}
        placeholder="Search invoices with fuzzy matching..."
        enableHistory
        showAdvancedOptions
        searchOptions={{
          threshold: 0.6,
          algorithm: 'combined',
          usePhonetic: true,
        }}
      />

      {/* DataGrid */}
      <DataGrid
        data={filteredInvoices}
        columns={columns}
        rowIdKey="id"

        // Performance
        enableVirtualization
        height={600}
        rowHeight={48}

        // Features
        enableSorting
        enableFiltering
        enableSelection
        enableInlineEditing
        enablePagination
        enableColumnResizing
        enableExport

        // Selection
        selectionMode="multiple"
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}

        // Editing
        onCellEdit={handleCellEdit}

        // Pagination
        pageSize={50}

        // Styling
        className="w-full"
      />
    </div>
  );
}
```

### Export Examples

```tsx
import { exportToCSV, exportToExcel, exportToPDF } from '@/components/enterprise/data';

// Export to CSV
exportToCSV(data, columns, 'users.csv', {
  delimiter: ',',
  includeHeaders: true,
  encoding: 'utf-8',
});

// Export to Excel
exportToExcel(data, columns, 'users.xlsx', {
  sheetName: 'Users',
  title: 'User Report',
  author: 'LexiFlow',
});

// Export to PDF
exportToPDF(data, columns, 'users.pdf', {
  orientation: 'landscape',
  title: 'User Report',
  subtitle: 'Generated on ' + new Date().toLocaleDateString(),
  pageSize: 'a4',
  showPageNumbers: true,
});

// Export selected rows only
import { exportSelectedRows } from '@/components/enterprise/data';

exportSelectedRows(
  data,
  selectedRowIds,
  columns,
  'pdf',
  'selected_users.pdf',
  'id'
);
```

### Fuzzy Search Examples

```tsx
import { fuzzySearch, createSearchIndex } from '@/components/enterprise/data';

// Basic fuzzy search
const results = fuzzySearch(users, 'jon', ['name', 'email'], {
  threshold: 0.6,
  algorithm: 'combined',
  sortByScore: true,
});

// Advanced search with field weights
const results = fuzzySearch(users, 'engineer', ['name', 'department', 'role'], {
  threshold: 0.5,
  algorithm: 'damerau-levenshtein',
  fieldWeights: {
    name: 2,      // Name matches are twice as important
    department: 1.5,
    role: 1,
  },
  usePhonetic: true,
  includeMatches: true,
});

// Create search index for faster repeated searches
const index = createSearchIndex(users, ['name', 'email', 'department']);
const results = searchIndex(index, 'john', { threshold: 0.7 });
```

### Column Resizing

```tsx
import {
  calculateAutoFitWidth,
  saveColumnWidths,
  loadColumnWidths
} from '@/components/enterprise/data';

// Calculate optimal width for a column
const width = calculateAutoFitWidth(
  data,
  'name',
  (item) => item.name,
  'Name',
  50,   // min width
  500   // max width
);

// Save column widths to localStorage
saveColumnWidths('my-table', { name: 200, email: 250 });

// Load saved column widths
const savedWidths = loadColumnWidths('my-table');
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
| `enableColumnResizing` | `boolean` | `true` | Enable column resizing |
| `enableExport` | `boolean` | `true` | Enable export functionality |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Selection mode |
| `pageSize` | `number` | `50` | Rows per page |
| `height` | `number` | `600` | Grid height in pixels |
| `rowHeight` | `number` | `48` | Row height in pixels |
| `onSelectionChange` | `(rows: Set) => void` | - | Selection callback |
| `onSortChange` | `(state: SortState[]) => void` | - | Sort callback |
| `onFilterChange` | `(filters: Record) => void` | - | Filter callback |
| `onPageChange` | `(page: number) => void` | - | Page change callback |
| `onCellEdit` | `(rowId, col, val) => void` | - | Edit callback |
| `onExport` | `(format) => void` | - | Export callback |

### DataGridSearch Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | Required | Data to search |
| `columns` | `ColumnDefinition<T>[]` | Required | Columns to search in |
| `onSearchResults` | `(results: T[]) => void` | Required | Results callback |
| `searchOptions` | `FuzzySearchOptions` | - | Search configuration |
| `placeholder` | `string` | `'Search...'` | Input placeholder |
| `enableHistory` | `boolean` | `true` | Enable search history |
| `maxHistoryItems` | `number` | `10` | Max history items |
| `debounceDelay` | `number` | `300` | Debounce delay (ms) |
| `showAdvancedOptions` | `boolean` | `false` | Show options panel |

### FuzzySearchOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `0.6` | Min similarity (0-1) |
| `algorithm` | `'levenshtein' \| 'damerau-levenshtein' \| 'trigram' \| 'combined'` | `'combined'` | Search algorithm |
| `ignoreCase` | `boolean` | `true` | Case-insensitive |
| `ignoreAccents` | `boolean` | `true` | Ignore diacritics |
| `usePhonetic` | `boolean` | `false` | Phonetic matching |
| `sortByScore` | `boolean` | `true` | Sort by relevance |
| `limit` | `number` | - | Max results |
| `fieldWeights` | `Record<string, number>` | - | Field importance |

### Column Definition

```typescript
interface ColumnDefinition<T> {
  id: string;                    // Unique column ID
  header: string;                // Display header
  accessorKey?: string;          // Path to data (e.g., 'user.name')
  cell?: (context) => ReactNode; // Custom cell renderer
  width?: number;                // Column width
  minWidth?: number;             // Minimum width
  maxWidth?: number;             // Maximum width
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;            // Enable sorting
  filterable?: boolean;          // Enable filtering
  editable?: boolean;            // Enable editing
  editorType?: EditorType;       // Editor type
  editorOptions?: EditorOption[]; // Options for select editor
  hidden?: boolean;              // Hide column
}
```

## Performance Tips

1. **Use virtualization** for datasets > 100 rows
2. **Memoize data** to prevent unnecessary re-renders
3. **Use pagination** for very large datasets (10,000+ rows)
4. **Create search index** for repeated searches on same dataset
5. **Limit active filters** to maintain performance
6. **Use `rowIdKey`** to ensure stable row identity
7. **Debounce search** to reduce search calls (default 300ms)
8. **Save column widths** to localStorage to preserve user preferences

## Algorithms

### Fuzzy Search Algorithms

1. **Levenshtein Distance**
   - Calculates minimum single-character edits (insertions, deletions, substitutions)
   - Best for: Typos and minor spelling mistakes
   - Time Complexity: O(m×n)

2. **Damerau-Levenshtein Distance**
   - Extends Levenshtein to include transpositions (swapped adjacent characters)
   - Best for: Common typing errors
   - Time Complexity: O(m×n)

3. **Trigram Similarity**
   - Uses 3-character sequences for matching
   - Best for: Substring matching and partial matches
   - Time Complexity: O(m+n)

4. **Combined (Default)**
   - Weighted combination: 60% Levenshtein + 40% Trigram
   - Best for: General-purpose fuzzy matching
   - Balanced precision and recall

5. **Soundex (Phonetic)**
   - Matches words that sound similar
   - Best for: Names and phonetically similar terms
   - Time Complexity: O(n)

## Theme Integration

All components use the theme context from `@/contexts/theme/ThemeContext` for consistent styling across light/dark modes.

## Accessibility

- Full keyboard navigation support
- ARIA labels on all interactive elements
- Focus management for inline editing
- Screen reader friendly
- Keyboard shortcuts (⌘K for search)
- Semantic HTML structure

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Files Structure

```
/frontend/src/components/enterprise/data/
├── DataGrid.tsx                    (660 lines) - Main grid component
├── DataGridColumn.tsx              (426 lines) - Column definitions
├── DataGridFilters.tsx             (419 lines) - Filter components
├── DataGridPagination.tsx          (343 lines) - Pagination controls
├── DataGridToolbar.tsx             (311 lines) - Toolbar with export
├── InlineEditor.tsx                (344 lines) - Cell editor
├── DataGridSearch.tsx              (425 lines) - Search component
├── DataGridColumnResizer.tsx       (358 lines) - Column resizing
├── DataGridExport.ts               (528 lines) - Export utilities
├── FuzzySearch.ts                  (622 lines) - Search algorithms
├── DataGridExample.tsx             (186 lines) - Usage example
├── index.ts                        (201 lines) - Public exports
└── README.md                       (500+ lines) - Documentation

**Total: 5,466 lines of production-ready TypeScript code**
```

## Next Steps

1. ✅ Advanced sorting and filtering - **COMPLETE**
2. ✅ Virtual scrolling - **COMPLETE**
3. ✅ Column resizing - **COMPLETE**
4. ✅ Export to CSV/Excel/PDF - **COMPLETE**
5. ✅ Enterprise search with fuzzy matching - **COMPLETE**
6. ✅ TypeScript strict mode compliance (100% - zero 'any' types) - **COMPLETE**
7. ✅ Performance optimization of fuzzy search algorithms - **COMPLETE**
8. ✅ Proper type safety for all export functions - **COMPLETE**
9. 🔄 Column reordering (drag-and-drop) - **PLANNED**
10. 🔄 Column visibility toggle - **PLANNED**
11. 🔄 Server-side pagination/filtering - **PLANNED**
12. 🔄 Advanced bulk operations - **PLANNED**

## Example Demo

See `DataGridExample.tsx` for a complete working example demonstrating all features with 1,000 rows of mock data.

## License

Part of LexiFlow Premium v0.5.2
