# Import/Export Quick Reference Guide

**Last Updated**: December 28, 2025

This guide provides quick examples for proper import/export patterns in the LexiFlow frontend codebase.

---

## 🎯 **Import Patterns**

### ✅ **ALWAYS USE: Absolute Imports**

```typescript
// ✅ Types
import { Case, Evidence, Document, User } from '@/types';
import type { CaseStatus, EvidenceType } from '@/types';

// ✅ Services
import { DataService } from '@/services/data/dataService';
import { queryClient } from '@/services/infrastructure/queryClient';

// ✅ API
import { api } from '@/api';
import { litigationApi } from '@/api/domains/litigation.api';

// ✅ Hooks
import { useCaseList, useDocumentManager } from '@/hooks';

// ✅ Utils
import { formatDate, queryKeys } from '@/utils';

// ✅ Features
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { CaseDetail } from '@/features/cases/components/detail/CaseDetail';

// ✅ Config
import { PATHS } from '@/config/paths.config';
import { NAVIGATION_ITEMS } from '@/config/nav.config';

// ✅ Providers
import { useTheme } from '@/providers/ThemeContext';
import { useToast } from '@/providers/ToastContext';
```

### ❌ **AVOID: Relative Imports (Outside Same Directory)**

```typescript
// ❌ Don't use relative imports for cross-directory imports
import { Case } from '../../types';
import { DataService } from '../../../services/dataService';
import { queryKeys } from '../../../../utils/queryKeys';

// ❌ Don't use relative imports for hooks/utils
import { useCaseList } from '../hooks/useCaseList';
import { formatDate } from '../utils/formatUtils';
```

### ✔️ **ACCEPTABLE: Relative Imports Within Same Directory**

```typescript
// ✔️ Same directory imports are fine
import { ContextPanel } from './ContextPanel';
import { helper } from './helpers';
import { useLocalState } from './useLocalState';
import * as styles from './Component.styles';
```

---

## 📦 **Type Imports**

### Primary Type Source

**ALWAYS import types from `@/types` (root barrel)**:

```typescript
// ✅ Correct - Single import source
import { 
  Case, 
  CaseStatus, 
  Evidence, 
  Document, 
  User,
  BaseEntity 
} from '@/types';

// ❌ Wrong - Importing from types subdirectory
import { Case } from '@/types/models';
import { CaseStatus } from '@/types/enums';
```

### Type-Only Imports

Use `type` keyword for type-only imports (better tree-shaking):

```typescript
// ✅ Type-only imports
import type { Case, Evidence } from '@/types';
import type { FC, ReactNode } from 'react';

// ✅ Mixed imports
import { DataService } from '@/services';
import type { QueryState } from '@/services/infrastructure/queryTypes';
```

---

## 🔄 **Data Access Patterns**

### Using DataService (Recommended)

```typescript
import { DataService } from '@/services/data/dataService';
import type { Case } from '@/types';

// ✅ DataService automatically routes to backend API
async function loadCases() {
  const cases = await DataService.cases.getAll();
  const caseById = await DataService.cases.getById('case-123');
  const newCase = await DataService.cases.add({ title: 'New Case' });
  await DataService.cases.update('case-123', { status: 'Active' });
  await DataService.cases.delete('case-123');
}
```

### Using API Services Directly

```typescript
import { api } from '@/api';
import { litigationApi, billingApi } from '@/api';

// ✅ Flat API access
const cases = await api.cases.getAll();
const evidence = await api.evidence.getById('ev-123');

// ✅ Domain-organized API access
const strategies = await litigationApi.strategies.getAll();
const invoices = await billingApi.invoices.getByCase('case-123');
```

### React Query Integration

```typescript
import { useQuery, useMutation } from '@/hooks';
import { queryKeys } from '@/utils/queryKeys';
import { DataService } from '@/services';
import type { Case } from '@/types';

// ✅ Query pattern
function useCaseList() {
  return useQuery<Case[]>({
    queryKey: queryKeys.cases.all,
    queryFn: () => DataService.cases.getAll(),
  });
}

// ✅ Mutation pattern
function useCreateCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Case>) => DataService.cases.add(data),
    onSuccess: () => {
      queryClient.invalidate(queryKeys.cases.all);
    },
  });
}
```

---

## 🎨 **Component Patterns**

### Function Component Declaration

```typescript
// ✅ Preferred - Function declaration
import type { FC } from 'react';
import type { Case } from '@/types';

interface CaseCardProps {
  case: Case;
  onSelect?: (caseId: string) => void;
}

export function CaseCard({ case, onSelect }: CaseCardProps) {
  return <div onClick={() => onSelect?.(case.id)}>{case.title}</div>;
}

// ✅ Also acceptable - React.memo with displayName
export const MemoizedCaseCard = React.memo<CaseCardProps>(
  ({ case, onSelect }) => {
    return <div onClick={() => onSelect?.(case.id)}>{case.title}</div>;
  }
);
MemoizedCaseCard.displayName = 'MemoizedCaseCard';

// ❌ Avoid - React.FC (deprecated pattern)
export const CaseCard: FC<CaseCardProps> = ({ case, onSelect }) => {
  return <div>{case.title}</div>;
};
```

### Hook Patterns

```typescript
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@/hooks';
import { queryKeys } from '@/utils/queryKeys';
import { DataService } from '@/services';
import type { Case } from '@/types';

// ✅ Custom hook with proper types
export function useCaseManagement(caseId: string) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: queryKeys.cases.detail(caseId),
    queryFn: () => DataService.cases.getById(caseId),
  });
  
  const handleTabChange = useCallback((tab: string) => {
    setSelectedTab(tab);
  }, []);
  
  const metrics = useMemo(() => ({
    total: caseData?.documents?.length ?? 0,
    pending: caseData?.tasks?.filter(t => t.status === 'Pending').length ?? 0,
  }), [caseData]);
  
  return {
    caseData,
    isLoading,
    selectedTab,
    handleTabChange,
    metrics,
  };
}
```

---

## 📁 **Feature Module Structure**

### Creating a New Feature Module

```
features/my-feature/
├── index.ts                    # Barrel export (public API)
├── MyFeature.tsx               # Main component
├── MyFeature.styles.ts         # Styles (if needed)
├── components/                 # Feature-specific components
│   ├── index.ts               # Component barrel export
│   ├── SubComponent.tsx
│   └── AnotherComponent.tsx
├── hooks/                      # Feature-specific hooks
│   ├── index.ts
│   ├── useMyFeature.ts
│   └── useFeatureData.ts
├── types.ts                    # Feature-specific types (if complex)
└── utils.ts                    # Feature-specific utilities
```

### Feature Barrel Export

```typescript
// features/my-feature/index.ts

// Export main component
export { MyFeature } from './MyFeature';

// Export sub-components (selective - don't expose all internals)
export { PublicSubComponent } from './components/SubComponent';

// Export hooks
export * from './hooks';

// Export types (if feature-specific)
export type { MyFeatureConfig, MyFeatureState } from './types';
```

### Using Feature Module

```typescript
// ✅ Import from feature barrel
import { MyFeature, useMyFeature } from '@/features/my-feature';

// ❌ Don't import internal components directly
import { SubComponent } from '@/features/my-feature/components/SubComponent';
```

---

## 🛠️ **Service Layer Patterns**

### Domain Service

```typescript
// services/domain/MyDomain.ts
import { apiClient } from '@/services/infrastructure/apiClient';
import type { MyEntity } from '@/types';

export class MyDomain {
  async getAll(): Promise<MyEntity[]> {
    return apiClient.get<MyEntity[]>('/my-entities');
  }
  
  async getById(id: string): Promise<MyEntity> {
    return apiClient.get<MyEntity>(`/my-entities/${id}`);
  }
  
  async create(data: Partial<MyEntity>): Promise<MyEntity> {
    return apiClient.post<MyEntity>('/my-entities', data);
  }
  
  async update(id: string, data: Partial<MyEntity>): Promise<MyEntity> {
    return apiClient.put<MyEntity>(`/my-entities/${id}`, data);
  }
  
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/my-entities/${id}`);
  }
}

export const myDomain = new MyDomain();
```

### Repository Pattern (Legacy IndexedDB)

```typescript
// services/data/repositories/MyRepository.ts
import { Repository } from '@/services/core/Repository';
import type { MyEntity } from '@/types';

export class MyRepository extends Repository<MyEntity> {
  constructor() {
    super('myEntities'); // IndexedDB store name
  }
  
  async findByStatus(status: string): Promise<MyEntity[]> {
    const all = await this.getAll();
    return all.filter(entity => entity.status === status);
  }
}

export const myRepository = new MyRepository();
```

---

## 🔑 **Query Keys Pattern**

```typescript
// utils/queryKeys.ts (add your domain)

export const queryKeys = {
  // Existing domains...
  
  // Your new domain
  myFeature: {
    all: ['myFeature'] as const,
    lists: () => [...queryKeys.myFeature.all, 'list'] as const,
    list: (filters: string) => 
      [...queryKeys.myFeature.lists(), { filters }] as const,
    details: () => [...queryKeys.myFeature.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.myFeature.details(), id] as const,
  },
};

// Usage in hooks
import { queryKeys } from '@/utils/queryKeys';

useQuery({
  queryKey: queryKeys.myFeature.detail('123'),
  queryFn: () => DataService.myFeature.getById('123'),
});
```

---

## 🎭 **Context Provider Pattern**

```typescript
// providers/MyContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface MyContextValue {
  state: string;
  setState: (value: string) => void;
}

const MyContext = createContext<MyContextValue | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState('initial');
  
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}

// Export for barrel
// providers/index.ts
export { MyProvider, useMyContext } from './MyContext';
```

---

## 📊 **Utility Function Pattern**

```typescript
// utils/myUtils.ts
import type { Case, CaseStatus } from '@/types';

/**
 * Filter cases by status
 * @param cases - Array of cases to filter
 * @param status - Status to filter by
 * @returns Filtered cases
 */
export function filterCasesByStatus(
  cases: Case[], 
  status: CaseStatus
): Case[] {
  return cases.filter(c => c.status === status);
}

/**
 * Calculate case metrics
 * @param cases - Array of cases
 * @returns Aggregated metrics
 */
export function calculateCaseMetrics(cases: Case[]) {
  return {
    total: cases.length,
    active: cases.filter(c => c.status === 'Active').length,
    closed: cases.filter(c => c.status === 'Closed').length,
  };
}

// Export from utils/index.ts
export * from './myUtils';
```

---

## 🚫 **Anti-Patterns to Avoid**

### ❌ Don't Import Implementation Details

```typescript
// ❌ Wrong - Importing from internal implementation
import { InternalHelper } from '@/features/my-feature/components/internal/Helper';

// ✅ Correct - Import from public API
import { PublicHelper } from '@/features/my-feature';
```

### ❌ Don't Re-Export Types from Service Files

```typescript
// ❌ Wrong - Service file re-exporting types
// services/myService.ts
export type { Case, Evidence } from '@/types';

// ✅ Correct - Import types where needed
// services/myService.ts
import type { Case, Evidence } from '@/types';
```

### ❌ Don't Use Wildcard Exports for Types

```typescript
// ❌ Wrong - Wildcard type re-export
// services/index.ts
export * from '@/types';

// ✅ Correct - Explicit service exports only
export { DataService } from './data/dataService';
export { queryClient } from './infrastructure/queryClient';
```

### ❌ Don't Import from Both Barrel and Direct Path

```typescript
// ❌ Wrong - Inconsistent imports
import { Case } from '@/types';
import { CaseStatus } from '@/types/enums';

// ✅ Correct - Single barrel import
import { Case, CaseStatus } from '@/types';
```

---

## 🔍 **Debugging Import Issues**

### Check Import Path

```typescript
// If import fails, verify:
// 1. Barrel export exists
// 2. Path alias is correct
// 3. File extension is omitted

// ✅ Correct
import { Case } from '@/types';

// ❌ Wrong - includes .ts extension
import { Case } from '@/types.ts';

// ❌ Wrong - includes /index
import { Case } from '@/types/index';
```

### Circular Dependency

If you encounter circular dependency errors:

1. Check import chain with `madge`:
   ```bash
   npx madge --circular --extensions ts,tsx src/
   ```

2. Break circular dependency by:
   - Moving shared types to `@/types`
   - Extracting shared utilities to `@/utils`
   - Using dependency injection

### Type Errors

If TypeScript doesn't recognize imported types:

1. Check barrel export includes the type
2. Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
3. Verify import path is correct
4. Check for duplicate type definitions

---

## ✅ **Checklist for New Code**

When adding new code, verify:

- [ ] All imports use absolute paths (`@/...`)
- [ ] Types imported from `@/types` (not `@/types/...`)
- [ ] Services imported from `@/services` or `@/api`
- [ ] Hooks imported from `@/hooks`
- [ ] Utils imported from `@/utils`
- [ ] Feature public API exported in feature's `index.ts`
- [ ] No relative imports across directories
- [ ] No wildcard type re-exports from service files
- [ ] Type-only imports use `import type`
- [ ] New types added to root `types.ts` barrel

---

**Last Updated**: December 28, 2025  
**Maintainer**: Systems Architecture Team
