# Frontend Architecture Overview

## Directory Structure (Updated: December 28, 2025)

```
frontend/src/
├── api/                    # Backend API services (90+ domain services)
│   ├── domains/           # Domain-organized API modules
│   │   ├── auth.api.ts
│   │   ├── litigation.api.ts
│   │   ├── discovery.api.ts
│   │   ├── billing.api.ts
│   │   └── ... (12 domain modules)
│   ├── types/             # API-specific types and DTOs
│   └── index.ts           # Consolidated API barrel export
├── components/            # React components (domain-organized)
│   ├── admin/            # Admin & settings components
│   ├── analytics/        # Analytics & reporting components
│   ├── billing/          # Billing & time tracking components
│   ├── calendar/         # Calendar & scheduling components
│   ├── case-detail/      # Case detail views
│   ├── case-list/        # Case list & overview
│   ├── common/           # Shared UI components
│   ├── compliance/       # Compliance management components
│   ├── correspondence/   # Email & correspondence components
│   ├── dashboard/        # Dashboard components
│   ├── discovery/        # Discovery workspace components
│   ├── docket/           # Docket management components
│   ├── documents/        # Document management components
│   ├── drafting/         # Document drafting components
│   ├── evidence/         # Evidence vault components
│   ├── hr/               # HR management components
│   ├── integrations/     # Integration configuration components
│   ├── jurisdiction/     # Jurisdiction management components
│   ├── layout/           # Layout components (Sidebar, TopBar)
│   ├── legal-research/   # Legal research components
│   ├── litigation/       # Litigation management components
│   ├── matter/           # Matter management components
│   ├── operations/       # Operations management components
│   ├── pleadings/        # Pleadings management components
│   ├── profile/          # User profile components
│   ├── quality/          # Quality assurance components
│   ├── reporting/        # Report generation components
│   ├── security/         # Security management components
│   ├── strategy/         # Strategy canvas components
│   ├── templates/        # Template management components
│   ├── trial/            # Trial preparation components
│   └── workflow/         # Workflow builder components
├── config/               # Application configuration
│   ├── modules.tsx       # Module registry & lazy loading
│   ├── nav.config.ts     # Navigation configuration
│   ├── paths.config.ts   # Path constants
│   ├── prefetchConfig.ts # Prefetch configuration
│   └── tabs.config.ts    # Tab configuration
├── features/             # Feature modules (cross-cutting concerns)
│   ├── admin/            # Admin features
│   ├── drafting/         # Drafting dashboard
│   └── ... (feature-specific modules)
├── hooks/                # Custom React hooks
│   ├── index.ts          # Hooks barrel export
│   ├── useAppController.ts
│   ├── useAutoSave.ts
│   ├── useBackendHealth.ts
│   ├── useCaseDetail.ts
│   ├── useDebounce.ts
│   ├── useListNavigation.ts
│   ├── useOptimizedFilter.ts
│   └── ... (60+ custom hooks)
├── providers/            # React context providers
│   ├── AppProviders.tsx  # Root provider composition
│   ├── DataSourceContext.tsx
│   ├── ThemeContext.tsx
│   ├── ToastContext.tsx
│   ├── WindowContext.tsx
│   └── index.ts          # Providers barrel export
├── services/             # Business logic & data layer
│   ├── ai/               # AI service modules
│   ├── core/             # Core infrastructure (Repository, ORM)
│   ├── data/             # Data layer (DataService, repositories)
│   ├── domain/           # Domain-specific services
│   ├── features/         # Feature-specific services
│   │   ├── analysis/
│   │   ├── bluebook/
│   │   ├── calendar/
│   │   ├── discovery/
│   │   ├── documents/
│   │   ├── legal/
│   │   └── research/
│   ├── infrastructure/   # Infrastructure services
│   ├── integration/      # Integration & orchestration
│   ├── search/           # Search services
│   ├── validation/       # Validation schemas & sanitizers
│   ├── workers/          # Web workers
│   └── index.ts          # Services barrel export
├── types/                # TypeScript type definitions
│   ├── index.ts          # Types barrel export
│   ├── models.ts         # Core data models
│   ├── enums.ts          # Enumerations
│   ├── ai.ts             # AI-related types
│   ├── analytics.ts      # Analytics types
│   ├── case.ts           # Case types
│   ├── discovery.ts      # Discovery types
│   ├── documents.ts      # Document types
│   └── ... (30+ type modules)
├── utils/                # Utility functions
│   ├── datastructures/   # Advanced data structures
│   ├── index.ts          # Utils barrel export
│   ├── apiUtils.ts
│   ├── formatters.ts
│   ├── validation.ts
│   └── ... (40+ utility modules)
├── index.tsx             # Application entry point
└── types.ts              # Root type barrel (re-exports from types/)
```

## Import Path Conventions

### Path Aliases (Configured in tsconfig.json & vite.config.ts)

```typescript
// ✅ CORRECT - Use @ prefix for all module imports
import { DataService } from '@/services';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/utils';
import { Case } from '@/types';
import { api } from '@/api';
import { useTheme } from '@/providers';

// ❌ INCORRECT - Do NOT use these patterns
import { DataService } from '@services/data/dataService';  // Missing slash
import { useDebounce } from '@hooks/useDebounce';          // Missing slash
import { formatDate } from 'utils/formatters';             // Missing @/
import { Case } from '../../../types';                     // Relative path
```

### Barrel Exports

All major directories have an `index.ts` barrel export file:

- **`@/services`** - All service classes and functions
- **`@/hooks`** - All custom React hooks
- **`@/utils`** - All utility functions
- **`@/types`** - All TypeScript types
- **`@/api`** - All API services
- **`@/providers`** - All React context providers

**Best Practice**: Import from the barrel export, not individual files:

```typescript
// ✅ CORRECT
import { DataService, useDebounce, formatDate } from '@/services';

// ⚠️ ACCEPTABLE (when avoiding conflicts)
import { litigationApi } from '@/api/domains/litigation.api';

// ❌ AVOID (bypasses barrel exports)
import { DataService } from '@/services/data/dataService';
```

## Data Architecture

### Backend-First Pattern (as of December 18, 2025)

```typescript
// Primary data access layer - routes to backend API by default
import { DataService } from '@/services';

// DataService automatically routes based on configuration:
// - Production: PostgreSQL + NestJS backend (default)
// - Development: Backend with fallback to IndexedDB (deprecated)

const cases = await DataService.cases.getAll();
const case = await DataService.cases.add(newCase);
```

### Data Access Layers

1. **DataService Facade** (`services/data/dataService.ts`)
   - Unified API for all data operations
   - Automatic backend/IndexedDB routing
   - Integration event publishing
   - LRU caching layer

2. **Backend API Services** (`api/index.ts`)
   - 90+ domain-organized services
   - Direct REST API communication
   - Type-safe DTOs
   - Swagger documentation at `/api/docs`

3. **Legacy IndexedDB** (`services/data/db.ts`)
   - Deprecated fallback layer
   - Only for development debugging
   - Enable via `localStorage.VITE_USE_INDEXEDDB='true'`

### Available DataService Domains

```typescript
DataService.cases          // Case management
DataService.docket         // Docket entries
DataService.evidence       // Evidence vault
DataService.documents      // Document management
DataService.pleadings      // Pleadings
DataService.hr             // Human resources
DataService.workflow       // Workflow automation
DataService.billing        // Time & billing
DataService.discovery      // Discovery management
DataService.trial          // Trial preparation
DataService.compliance     // Compliance tracking
DataService.admin          // Admin operations
DataService.correspondence // Communications
DataService.quality        // Quality assurance
DataService.catalog        // Data catalog
DataService.backup         // Backup management
DataService.profile        // User profiles
DataService.marketing      // Marketing automation
DataService.jurisdiction   // Jurisdiction management
DataService.knowledge      // Knowledge management
DataService.crm            // Client relationship mgmt
DataService.analytics      // Analytics & reporting
DataService.operations     // Operations management
DataService.security       // Security management
```

## Component Organization

### Module Registration Pattern

All components are lazy-loaded via `config/modules.tsx`:

```typescript
import { lazyWithPreload } from '@/utils/lazyWithPreload';

const Dashboard = lazyWithPreload(() => import('@/components/dashboard/Dashboard'));
const CaseList = lazyWithPreload(() => import('@/components/case-list/CaseList'));

// Registration in module registry
export const modules = {
  dashboard: Dashboard,
  caseList: CaseList,
  // ... all modules
};
```

### Component File Naming

- **Components**: PascalCase (e.g., `CaseList.tsx`, `DocumentViewer.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useDebounce.ts`, `useCaseDetail.ts`)
- **Utilities**: camelCase (e.g., `formatters.ts`, `validation.ts`)
- **Types**: camelCase or kebab-case (e.g., `models.ts`, `case-types.ts`)

## State Management

### React Query Implementation

Custom implementation in `services/infrastructure/queryClient.ts`:

```typescript
import { useQuery, useMutation, queryClient } from '@/services';

// Query
const { data, isLoading } = useQuery(['cases'], () => DataService.cases.getAll());

// Mutation with cache invalidation
const mutation = useMutation(
  (newCase) => DataService.cases.add(newCase),
  {
    onSuccess: () => {
      queryClient.invalidate(['cases']);
    }
  }
);
```

### Context Providers

```typescript
// Theme context
import { useTheme } from '@/providers';
const { mode, toggleTheme, theme } = useTheme();

// Toast notifications
import { useToast } from '@/providers';
const toast = useToast();
toast.success('Case created successfully');

// Window management (holographic routing)
import { useWindow } from '@/providers';
const { openWindow, minimizeWindow } = useWindow();
```

## Performance Patterns

### React 18 Optimizations

```typescript
import { useTransition, useDeferredValue, useMemo, useCallback } from 'react';

// Heavy filtering with useTransition
const [isPending, startTransition] = useTransition();

const handleSearch = (value: string) => {
  startTransition(() => {
    setSearchTerm(value); // Non-blocking update
  });
};

// Memoize expensive computations
const metrics = useMemo(() => ({
  total: cases.length,
  active: cases.filter(c => c.status === 'Active').length
}), [cases]);

// Stable callbacks
const handleClick = useCallback((id: string) => {
  navigate(`/case/${id}`);
}, [navigate]);
```

### Custom Performance Hooks

```typescript
import { useOptimizedFilter, useMultiFilter } from '@/hooks';

// Concurrent filtering with transitions
const { filteredData, setFilterTerm, isPending } = useOptimizedFilter(
  documents,
  (docs, term) => docs.filter(d => d.title.includes(term))
);

// Multi-criteria filtering
const { filteredData } = useMultiFilter(cases, {
  status: 'Active',
  assignedTo: 'user123'
});
```

## Type System

### Base Types

All entities extend `BaseEntity`:

```typescript
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: UserId;
}
```

### Import Pattern

```typescript
// Import from root barrel (preferred)
import type { Case, Document, Evidence } from '@/types';

// Import from specific module (when avoiding conflicts)
import type { Case } from '@/types/case';
```

### Type Conflicts Resolution

When type conflicts occur, use explicit exports:

```typescript
// In services/index.ts
export { 
  type DocketEntryWithVersion, 
  DocketRepository 
} from './domain/DocketDomain';  // Avoids conflict with PleadingRepository
```

## Testing

### Test Organization

```
**/__tests__/          # Co-located with source files
  ├── unit/            # Unit tests
  ├── integration/     # Integration tests
  └── e2e/             # End-to-end tests
```

### Test Utilities

```typescript
import { renderWithProviders, waitForQuery } from '@/test-utils';

test('renders case list', async () => {
  const { getByText } = renderWithProviders(<CaseList />);
  await waitForQuery(['cases']);
  expect(getByText('Active Cases')).toBeInTheDocument();
});
```

## Styling

### Tailwind CSS with Semantic Tokens

```typescript
import { cn } from '@/utils/cn';
import { useTheme } from '@/providers';

// Use semantic color tokens from theme/tokens.ts
const Component = () => {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      'p-4 rounded-lg',
      'bg-surface-primary',      // Semantic token
      'text-content-primary',    // Semantic token
      'border border-border-default'
    )}>
      Content
    </div>
  );
};
```

### Theme Tokens

Available semantic tokens (defined in `theme/tokens.ts`):

- **Surfaces**: `surface-primary`, `surface-secondary`, `surface-elevated`
- **Content**: `content-primary`, `content-secondary`, `content-tertiary`
- **Borders**: `border-default`, `border-accent`, `border-focus`
- **Interactive**: `interactive-primary`, `interactive-hover`, `interactive-active`

## Common Pitfalls & Solutions

### Issue: "Query not invalidating after mutation"
**Solution**: Ensure you call `queryClient.invalidate(['queryKey'])` AND publish integration events. DataService does both automatically.

### Issue: "Circular dependency detected"
**Solution**: Check `services/index.ts` for commented exports. Some exports are disabled to prevent circular dependencies. Import directly from the source file when needed.

### Issue: "Type conflict between modules"
**Solution**: Use explicit exports in barrel files to rename conflicting types:
```typescript
export { type DocketEntryWithVersion } from './domain/DocketDomain';
```

### Issue: "Module not found after reorganization"
**Solution**: All import paths should use `@/` prefix. Check `tsconfig.json` and `vite.config.ts` for path alias configuration.

## Key Files Reference

**Must-read for contributors:**
- `README.md` - System overview
- `config/modules.tsx` - Module registration
- `services/index.ts` - Services barrel export
- `types/index.ts` - Types barrel export
- `api/index.ts` - API services barrel export

**Architecture deep dives:**
- `services/data/dataService.ts` - Data access facade
- `services/infrastructure/queryClient.ts` - React Query implementation
- `services/integration/integrationOrchestrator.ts` - Event system
- `services/integration/apiConfig.ts` - Backend-first configuration

## Development Workflow

### Starting Development

```bash
# Frontend (from root)
npm run dev

# Backend (from /backend)
npm run start:dev

# Run migrations
cd backend
npm run migration:run
```

### Building for Production

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

### Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm run test
npm run test:e2e
```

## Additional Documentation

- [Backend README](../../backend/README.md) - Backend architecture & API
- [Copilot Instructions](.github/copilot-instructions.md) - AI assistance guidelines
- [Business Flows](../../business-flows/) - Feature documentation
