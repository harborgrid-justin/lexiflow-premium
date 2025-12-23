# Case Management Hub - Enterprise SaaS Documentation

## Overview

The **Case Management Hub** is an enterprise-grade centralized system for managing legal cases within LexiFlow. It consolidates all case-related operations into a unified, production-ready interface with advanced features for filtering, search, bulk operations, and analytics.

## Architecture

### Component Structure

```
frontend/
├── components/
│   ├── case-management/
│   │   └── CaseManagementHub.tsx  # Main hub component (800+ LOC)
│   └── case-list/
│       └── FederalLitigationCaseForm.tsx  # Specialized form for federal cases
└── config/
    ├── modules.tsx          # Module registration
    ├── paths.config.ts      # Route definitions
    └── nav.config.ts        # Navigation sidebar config
```

### Technology Stack

- **Framework**: React 18 with TypeScript (strict mode)
- **State Management**: React Query via custom `useQuery` hook
- **Data Layer**: Backend-first via `DataService.cases` facade
- **Backend API**: NestJS + PostgreSQL
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React

## Features

### 1. **Unified Case Dashboard**

#### Analytics Metrics
- **Total Cases**: Overall case count
- **Active Cases**: Currently active litigation
- **Pending Cases**: Open but not yet active
- **Closed Cases**: Completed matters
- **This Month**: New cases created in current month

Real-time metrics are computed client-side using `useMemo` for performance optimization.

#### View Modes
- **List View**: Tabular display with sortable columns
- **Grid View**: Card-based layout for visual browsing

### 2. **Advanced Filtering System**

#### Simple Filters
- **Status Filter**: Active, Open, Closed, Settled, On Hold
- **Type Filter**: Civil, Criminal, Family, Bankruptcy
- **Search**: Real-time text search across:
  - Case title
  - Case number
  - Court name
  - Description

#### Filter Panel States
- `none`: No filters visible
- `simple`: Basic status/type filters
- `advanced`: (Future) Additional filters like attorney assignment, date ranges, practice areas

#### Filter Implementation
```typescript
const filteredCases = useMemo(() => {
  let filtered = [...cases];
  
  // Search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(term) ||
      c.caseNumber?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.court?.toLowerCase().includes(term)
    );
  }
  
  // Status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(c => c.status === statusFilter);
  }
  
  // Type filter
  if (typeFilter !== 'all') {
    filtered = filtered.filter(c => c.type === (typeFilter as unknown as string));
  }
  
  return filtered;
}, [cases, searchTerm, statusFilter, typeFilter]);
```

### 3. **Bulk Operations**

#### Selection Management
- **Individual Selection**: Checkbox per case in list view
- **Select All**: Master checkbox in table header
- **Selection State**: Tracked via `Set<string>` for O(1) lookups

#### Bulk Actions
- **Bulk Delete**: Delete multiple cases with confirmation
- **Bulk Export**: (Future) Export selected cases to JSON/CSV

```typescript
const handleBulkDelete = useCallback(async () => {
  if (confirm(`Delete ${selectedCases.size} cases?`)) {
    try {
      await Promise.all(
        Array.from(selectedCases).map(id => DataService.cases.delete(id))
      );
      await refetch();
      setSelectedCases(new Set());
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  }
}, [selectedCases, refetch]);
```

### 4. **Case Creation & Editing**

#### Create New Case
- Modal-based form overlay
- **Federal Litigation Form**: Full-featured form with:
  - Court autocomplete (searchable dropdown)
  - Jurisdiction autocomplete
  - Party management with quick-add modal
  - Case metadata (status, priority, type)
  - Filing dates and deadlines
  - Description and notes

#### Edit Existing Case
- Click "Edit" action button on any case
- Pre-fills form with existing case data
- Updates via `DataService.cases.update()`

### 5. **Case Actions**

#### Per-Case Actions
- **View**: Navigate to case detail page (`#/cases/{id}`)
- **Edit**: Open edit modal with pre-filled data
- **Delete**: Delete case with confirmation

#### Action Buttons
```tsx
<button onClick={() => onViewCase(caseItem)} title="View">
  <Eye className="w-4 h-4" />
</button>
<button onClick={() => onEditCase(caseItem)} title="Edit">
  <Edit className="w-4 h-4" />
</button>
<button onClick={() => onDeleteCase(caseItem.id)} title="Delete">
  <Trash2 className="w-4 h-4" />
</button>
```

### 6. **Export Functionality**

Export filtered cases to JSON:
```typescript
const handleExport = useCallback(() => {
  const dataStr = JSON.stringify(filteredCases, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cases-export-${new Date().toISOString()}.json`;
  link.click();
}, [filteredCases]);
```

## Component API

### Props

```typescript
interface CaseManagementHubProps {
  /** Initial view mode (default: 'list') */
  defaultViewMode?: 'grid' | 'list';
  
  /** Enable bulk operations (default: true) */
  enableBulkOps?: boolean;
  
  /** Enable analytics dashboard (default: true) */
  showAnalytics?: boolean;
}
```

### Usage

```tsx
import { CaseManagementHub } from './components/case-management/CaseManagementHub';

function App() {
  return (
    <CaseManagementHub
      defaultViewMode="list"
      enableBulkOps={true}
      showAnalytics={true}
    />
  );
}
```

## Data Flow

### Backend Integration

```
CaseManagementHub
  ↓
useQuery(queryKeys.cases.all())
  ↓
DataService.cases.getAll()
  ↓
Backend API: GET /api/cases
  ↓
PostgreSQL Database
```

### State Management

```typescript
// Query hook with automatic caching and refetching
const { data: cases = [], isLoading, error, refetch } = useQuery<Case[]>(
  queryKeys.cases.all(),
  () => DataService.cases.getAll()
);

// Local UI state
const [viewMode, setViewMode] = useState<ViewMode>('list');
const [searchTerm, setSearchTerm] = useState('');
const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
```

### CRUD Operations

```typescript
// CREATE
await DataService.cases.add(newCase);
await refetch(); // Refresh list

// UPDATE (via edit modal)
await DataService.cases.update(caseId, updates);
await refetch();

// DELETE
await DataService.cases.delete(caseId);
await refetch();
```

## Routing Integration

### Module Registration

File: `frontend/config/modules.tsx`

```typescript
const CaseManagementHub = lazyWithPreload(
  () => import('../components/case-management/CaseManagementHub')
);

const COMPONENT_MAP: Record<string, React.LazyExoticComponent<unknown>> = {
  [PATHS.CASE_MANAGEMENT]: CaseManagementHub,
  // ... other modules
};
```

### Navigation Configuration

File: `frontend/config/nav.config.ts`

```typescript
export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // CASE WORK
  { 
    id: PATHS.CASE_MANAGEMENT, 
    label: 'Case Management Hub', 
    icon: Briefcase, 
    category: 'Case Work' 
  },
  // ... other items
];
```

### Route Paths

File: `frontend/config/paths.config.ts`

```typescript
export const PATHS = {
  CASE_MANAGEMENT: 'case-management',
  CASES: 'cases',
  CREATE_CASE: 'cases/create',
  // ... other paths
} as const;
```

## Styling & Design System

### Color Scheme

#### Status Badge Colors
```typescript
const configs: Record<string, { icon, color }> = {
  [CaseStatus.Active]: { 
    icon: CheckCircle, 
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
  },
  [CaseStatus.Open]: { 
    icon: Clock, 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
  },
  [CaseStatus.Closed]: { 
    icon: Archive, 
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' 
  },
  [CaseStatus.Settled]: { 
    icon: CheckCircle, 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
  },
  [CaseStatus.OnHold]: { 
    icon: AlertCircle, 
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
  },
};
```

#### Metric Card Colors
- **Blue**: Total Cases
- **Emerald**: Active Cases
- **Amber**: Pending Cases
- **Slate**: Closed Cases
- **Purple**: This Month

### Dark Mode Support

All components use Tailwind's `dark:` variant for automatic dark mode support:

```tsx
className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
```

### Responsive Design

- **Mobile**: Single column grid, stacked filters
- **Tablet (md)**: 2-column grid, horizontal filters
- **Desktop (lg)**: 3-column grid, full toolbar

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Accessibility

### WCAG 2.1 AA Compliance

#### Semantic HTML
- Proper heading hierarchy (`<h1>`, `<h2>`, `<h3>`)
- Semantic table structure with `<thead>`, `<tbody>`
- Form labels associated with inputs

#### ARIA Attributes
```tsx
<button aria-label="Create new case" title="Create new case">
  <Plus className="w-4 h-4 mr-2" />
  New Case
</button>

<input 
  type="checkbox" 
  aria-label="Select all cases" 
  title="Select all cases"
/>

<select id="case-status-filter" aria-labelledby="status-label">
  <option value="all">All Statuses</option>
</select>
```

#### Keyboard Navigation
- Tab order follows visual flow
- Enter/Space activate buttons
- Arrow keys navigate select dropdowns

#### Focus Indicators
Tailwind's `focus:ring-2 focus:ring-blue-500` provides clear focus states.

## Performance Optimization

### React.memo & useMemo

```typescript
// Memoized child components
const CaseListView = React.memo(({ cases, ... }) => { /* ... */ });
const CaseGridView = React.memo(({ cases, ... }) => { /* ... */ });

// Memoized computed values
const filteredCases = useMemo(() => {
  // Heavy filtering logic
}, [cases, searchTerm, statusFilter, typeFilter]);

const metrics = useMemo(() => ({
  total: cases.length,
  active: cases.filter(c => c.status === CaseStatus.Active).length,
  // ...
}), [cases]);
```

### useCallback Hooks

```typescript
const handleSelectCase = useCallback((caseId: string) => {
  setSelectedCases(prev => {
    const newSet = new Set(prev);
    if (newSet.has(caseId)) {
      newSet.delete(caseId);
    } else {
      newSet.add(caseId);
    }
    return newSet;
  });
}, []);
```

### Lazy Loading

Module is lazy-loaded via `React.lazy()` with preload capability:

```typescript
const CaseManagementHub = lazyWithPreload(() => 
  import('../components/case-management/CaseManagementHub')
);

// Preload on navigation item hover
CaseManagementHub.preload();
```

## Testing Strategy

### Unit Tests (Future)

```typescript
describe('CaseManagementHub', () => {
  it('renders analytics metrics correctly', () => {
    // Test metric calculations
  });
  
  it('filters cases by search term', () => {
    // Test search filtering
  });
  
  it('handles bulk delete operations', () => {
    // Test bulk delete with confirmation
  });
});
```

### E2E Tests (Future)

```typescript
describe('Case Management Workflow', () => {
  it('creates a new federal litigation case', () => {
    // Fill out form, submit, verify in list
  });
  
  it('filters cases by status and exports results', () => {
    // Apply filters, verify count, export JSON
  });
});
```

## Error Handling

### Loading States

```tsx
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-slate-600 dark:text-slate-400">Loading cases...</p>
  </div>
) : /* ... */}
```

### Error States

```tsx
{error ? (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Failed to load cases
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
        {error instanceof Error ? error.message : 'Unknown error'}
      </p>
      <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
        Retry
      </button>
    </div>
  </div>
) : /* ... */}
```

### Empty States

```tsx
{filteredCases.length === 0 ? (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center">
    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
      No cases found
    </h3>
    <p className="text-slate-600 dark:text-slate-400 mb-6">
      {searchTerm || filterPanel !== 'none'
        ? 'Try adjusting your filters or search terms'
        : 'Get started by creating your first case'}
    </p>
    <button onClick={() => setShowCreateModal(true)}>
      Create Case
    </button>
  </div>
) : /* ... */}
```

## Future Enhancements

### Planned Features

1. **Advanced Filtering**
   - Attorney assignment filter
   - Date range picker
   - Practice area filter
   - Custom field filters

2. **Bulk Operations**
   - Bulk status update
   - Bulk assignment
   - Bulk export (CSV, Excel, PDF)
   - Bulk archive/unarchive

3. **Analytics Dashboard**
   - Case aging report
   - Attorney workload distribution
   - Win/loss statistics
   - Revenue by case type

4. **Customization**
   - Saved filter presets
   - Custom column configuration
   - Dashboard widget layout

5. **Collaboration**
   - In-line case notes
   - @mentions for team members
   - Activity feed
   - Real-time collaboration indicators

6. **Integrations**
   - Calendar sync
   - Email integration
   - Document management system sync
   - Court docket updates

## Troubleshooting

### Common Issues

#### Issue: "Cases not loading"
**Solution**: Check backend API connection. Verify `DataService.cases.getAll()` is not throwing errors. Check browser console for network errors.

#### Issue: "Filters not working"
**Solution**: Ensure `filteredCases` `useMemo` dependency array includes all filter state variables. Check that filter predicates match your data structure.

#### Issue: "Dark mode colors incorrect"
**Solution**: Verify Tailwind's `dark:` variants are applied. Check `ThemeContext` is properly wrapping the component tree.

#### Issue: "TypeScript errors after backend changes"
**Solution**: Regenerate backend types. Update `Case` interface in `types/models.ts`. Run `npm run typecheck` to validate.

## Deployment Checklist

- [ ] Run TypeScript typecheck: `npm run typecheck`
- [ ] Run ESLint: `npm run lint`
- [ ] Build production bundle: `npm run build`
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test dark mode
- [ ] Verify backend API connectivity
- [ ] Load test with 10,000+ cases
- [ ] Verify accessibility with screen reader
- [ ] Check console for errors/warnings

## Support & Maintenance

### Code Owners
- **Primary**: Case Management Team
- **Secondary**: Frontend Architecture Team

### Documentation Links
- [Backend API Documentation](./BACKEND_API_ENDPOINTS_INVENTORY.md)
- [Data Service Documentation](./API_CONSOLIDATION_COMPLETE.md)
- [Federal Litigation Form](./FRONTEND_LOADING_TRACE.md)

### Change Log
- **2025-01-XX**: Initial release of Case Management Hub
- **Future**: Advanced filtering, bulk operations expansion

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Status**: Production-Ready
