# Frontend Architecture Organization Guide

**Date**: December 28, 2025  
**Status**: ✅ Audited and Documented  
**Last Updated**: 2025-12-28

---

## 📋 **Executive Summary**

This document provides a comprehensive overview of the frontend (`src/`) directory organization, import/export patterns, and architectural decisions. The codebase follows a **domain-driven feature-based architecture** with **backend-first data access** (PostgreSQL + NestJS) and legacy IndexedDB fallback.

### Key Metrics
- **Total TypeScript/TSX Files**: 2,256
- **Barrel Export Files (index.ts)**: 333
- **Feature Modules**: 60+ (litigation, operations, knowledge, cases, admin, etc.)
- **Type Definitions**: 41 files in `types/` directory
- **API Services**: 90+ domain-organized services
- **Custom Hooks**: 50+ reusable hooks

---

## 🏗️ **Directory Structure Overview**

```
frontend/src/
├── api/                    # Backend API services (90+ domain services)
│   ├── domains/           # Domain-organized API modules
│   └── index.ts           # Consolidated API barrel export
├── assets/                # Static assets (images, fonts, etc.)
├── components/            # Shared UI components (DEPRECATED - use features/)
├── config/                # App configuration & module registry
├── features/              # Feature-based modules (PRIMARY ORGANIZATION)
│   ├── admin/            # Admin console & system management
│   ├── cases/            # Case management & workflows
│   ├── dashboard/        # Main dashboard views
│   ├── discovery/        # Discovery & e-discovery tools
│   ├── document-assembly/# Document generation workflows
│   ├── drafting/         # Legal drafting tools
│   ├── knowledge/        # Knowledge base, research, rules
│   ├── litigation/       # Litigation strategy, pleadings, exhibits
│   ├── operations/       # Billing, documents, compliance, CRM
│   ├── profile/          # User profile & settings
│   ├── shared/           # Shared feature components
│   └── visual/           # Graph visualizations (NexusGraph)
├── hooks/                 # Custom React hooks (50+)
├── providers/             # React Context providers (Theme, Toast, Window)
├── services/              # Business logic & data layer
│   ├── core/             # Repository base classes & ORM
│   ├── data/             # DataService facade & repositories
│   ├── domain/           # Domain service layer
│   ├── infrastructure/   # Query client, API client, notification service
│   ├── integration/      # API config, integration orchestrator
│   ├── search/           # Search services
│   ├── theme/            # Theme & chart color services
│   ├── utils/            # Service utilities
│   ├── workers/          # Web Workers (crypto, search)
│   └── workflow/         # Workflow execution engine
├── types/                 # TypeScript type definitions (41 files)
│   └── index.ts          # Types barrel export (redirects to ../types.ts)
├── utils/                 # Utility functions (46+ utilities)
├── App.tsx                # Root application component
├── index.tsx              # Application entry point
├── types.ts               # **PRIMARY TYPE BARREL** (exports all types/)
└── vite-env.d.ts          # Vite environment declarations
```

---

## 📦 **Import/Export Patterns**

### ✅ **RECOMMENDED: Absolute Imports**

Always use absolute imports with the `@/` alias:

```typescript
// ✅ Correct - Absolute imports
import { Case, CaseStatus } from '@/types';
import { DataService } from '@/services/data/dataService';
import { queryKeys } from '@/utils/queryKeys';
import { Dashboard } from '@/features/dashboard/components/Dashboard';
```

### ❌ **AVOID: Relative Imports**

```typescript
// ❌ Incorrect - Relative imports
import { Case } from '../../types';
import { DataService } from '../services/dataService';
import { queryKeys } from '../../../../utils/queryKeys';
```

**Exception**: Relative imports are acceptable within the same subdirectory:
```typescript
// ✅ Acceptable - Same directory
import { ContextPanel } from './ContextPanel';
import { utils } from './utils';
```

---

## 🎯 **Barrel Export Strategy**

### Primary Barrel Files

1. **`types.ts`** (root) - **PRIMARY TYPE EXPORT**
   - Exports all types from `types/` subdirectory
   - Single source of truth for all type imports
   - Usage: `import { Case, Evidence } from '@/types';`

2. **`types/index.ts`** - Redirects to root `types.ts`
   - Prevents dual import paths
   - Usage: Import from `@/types` (NOT `@/types/`)

3. **`api/index.ts`** - Consolidated API services
   - Exports 90+ domain-organized API services
   - Usage: `import { api } from '@/api';` or `import { litigationApi } from '@/api/domains/litigation.api';`

4. **`services/index.ts`** - Service layer exports
   - Core infrastructure, repositories, domain services
   - Usage: `import { DataService, queryClient } from '@/services';`

5. **`hooks/index.ts`** - Custom hooks
   - Exports all reusable hooks
   - Usage: `import { useCaseList, useDocumentManager } from '@/hooks';`

6. **`utils/index.ts`** - Utility functions
   - Exports 46+ utility functions
   - Usage: `import { formatDate, queryKeys } from '@/utils';`

### Feature Module Barrels

Each feature module should have an `index.ts`:
```typescript
// features/litigation/index.ts
export * from './strategy/StrategyCanvas';
export * from './war-room/WarRoom';
export * from './pleadings/PleadingBuilder';
```

**Current Status**: ⚠️ Some features have barrel exports, others do not. Recommendation: Add barrel exports to all feature modules.

---

## 🔄 **Data Access Architecture**

### Backend-First Pattern (PRODUCTION DEFAULT)

The system defaults to **PostgreSQL + NestJS backend** as the primary data source:

```typescript
import { DataService } from '@/services/data/dataService';
import { api } from '@/api';

// ✅ Correct - Uses backend API automatically
const cases = await DataService.cases.getAll();
const caseDetail = await api.cases.getById(caseId);
```

**Configuration**:
- Default: Backend API enabled (production mode)
- Override: Set `localStorage.VITE_USE_INDEXEDDB='true'` for legacy mode (DEPRECATED)
- Check mode: `import { isBackendApiEnabled } from '@/services/integration/apiConfig';`

### DataService Domains (Auto-Routed)

Available domains (automatically route to backend/IndexedDB):
- `cases`, `docket`, `evidence`, `documents`, `pleadings`
- `hr`, `workflow`, `billing`, `discovery`, `trial`
- `compliance`, `admin`, `correspondence`, `quality`, `catalog`
- `backup`, `profile`, `marketing`, `jurisdiction`, `knowledge`
- `crm`, `analytics`, `operations`, `security`

---

## 🚨 **Known Issues & Warnings**

### 🔴 **Critical Issues**

#### 1. **Duplicate Type Definitions**

**Notification Interface** - 4 Locations:
- `types/system.ts` (canonical - simple structure)
- `services/infrastructure/notificationService.ts` (extended with actions, priority)
- `api/notifications-api.ts` (backend DTO with metadata)
- `services/domain/NotificationDomain.ts` (non-exported internal interface)

**Impact**: TypeScript may not recognize these as the same type, causing import confusion.

**Recommendation**:
```typescript
// types/system.ts - Base notification type
export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number;
}

// services/infrastructure/notificationService.ts - UI notification (extends base)
import type { BaseNotification } from '@/types';
export interface UINotification extends BaseNotification {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actions?: NotificationAction[];
  duration?: number;
}

// api/notifications-api.ts - Backend DTO
import type { BaseNotification } from '@/types';
export interface NotificationDTO extends BaseNotification {
  userId: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, any>;
}
```

**ValidationError** - 5 Locations:
- `utils/validation.ts` (utility validation errors)
- `types/bluebook.ts` (Bluebook citation validation)
- `services/search/graphValidationService.ts` (graph validation)
- `providers/repository/errors.ts` (repository error class)
- `api/domains/drafting.api.ts` (API validation errors)

**Recommendation**: Create a base `ValidationError` class in `types/errors.ts` and extend domain-specific variants.

#### 2. **Type Importing from API Layer**

**File**: `types/legal-research.ts`

```typescript
// ❌ Incorrect - Types importing from API implementation
import { SearchResult } from '@/api/search/search-api';
```

**Why It's Problematic**:
- Creates dependency from pure types → API implementation
- Types should be dependency-free
- Makes types harder to share with backend

**Fix**: Move `SearchResult` to `types/` and import in API layer instead.

#### 3. **Commented Out Exports in service/index.ts**

```typescript
// export * from './domain/BillingDomain';  
// Removed - BILLING_QUERY_KEYS duplicate with ./api/billing-api
```

**Status**: Team is aware and has implemented explicit exports to avoid conflicts. This is a **good pattern** for managing conflicts.

---

### 🟡 **Moderate Issues**

#### 1. **Excessive Relative Imports**

**Files Affected**: 100+ files across hooks, utils, features

**Examples**:
```typescript
// hooks/useDomainData.ts
import { queryKeys } from '../utils/queryKeys'; // ❌
import type { QueryState } from '../services/infrastructure/queryTypes'; // ❌

// Should be:
import { queryKeys } from '@/utils/queryKeys'; // ✅
import type { QueryState } from '@/services/infrastructure/queryTypes'; // ✅
```

**Recommendation**: Use project-wide find/replace or codemod to convert relative imports to absolute imports.

#### 2. **Wildcard Type Re-Exports from Service Files**

**Files**:
- `features/litigation/utils/index.ts` exports `types.ts`
- `features/shared/types/index.ts` exports type modules
- `services/features/research/geminiService.ts` exports types
- `services/infrastructure/notificationService.ts` exports type aliases

**Why It's Problematic**:
- Pollutes the public API
- Creates ambiguity about where types come from (types vs services)
- Makes dependency graph harder to understand

**Recommendation**: Remove wildcard type re-exports from service/feature files. Import types directly from `@/types`.

---

### 🟢 **Minor Issues / Observations**

#### 1. **Barrel Export Completeness**

**Well-Organized**:
- `utils/index.ts` - Complete exports (46+ utilities)
- `hooks/index.ts` - Well-organized with deprecation comments
- `api/index.ts` - Comprehensive 255-line barrel with domain organization

**Needs Review**:
- Many feature modules lack barrel exports
- Some subdirectories have deep nesting without clear public API

**Recommendation**: Create `index.ts` barrel exports for all feature modules to establish clear public APIs.

#### 2. **Feature Module Organization**

**Current Structure**: Feature modules follow domain-driven design:
- `features/litigation/` - Litigation-specific features
- `features/operations/` - Operational features (billing, documents, compliance)
- `features/knowledge/` - Knowledge management (research, rules, citations)
- `features/cases/` - Case management

**Pattern**: Each feature has subdirectories for components, but no consistent barrel export pattern.

**Recommendation**: Establish consistent barrel exports:
```typescript
// features/litigation/index.ts
export { StrategyCanvas } from './strategy/StrategyCanvas';
export { WarRoom } from './war-room/WarRoom';
export { PleadingBuilder } from './pleadings/PleadingBuilder';
```

---

## 🔧 **Development Guidelines**

### Adding New Types

1. **Create type file** in `types/` directory:
   ```typescript
   // types/my-new-feature.ts
   export interface MyFeature {
     id: string;
     name: string;
   }
   ```

2. **Add export** to root `types.ts`:
   ```typescript
   // types.ts
   export * from './types/my-new-feature';
   ```

3. **Import from @/types**:
   ```typescript
   // features/my-feature/Component.tsx
   import { MyFeature } from '@/types';
   ```

### Adding New API Services

1. **Create domain API file** in `api/domains/`:
   ```typescript
   // api/domains/my-domain.api.ts
   export const myDomainApi = {
     getAll: () => apiClient.get('/my-domain'),
     // ...
   };
   ```

2. **Export from `api/index.ts`**:
   ```typescript
   // api/index.ts
   export * from './domains/my-domain.api';
   ```

3. **Use in application**:
   ```typescript
   import { myDomainApi } from '@/api';
   const data = await myDomainApi.getAll();
   ```

### Adding New Features

1. **Create feature directory**:
   ```
   features/my-feature/
   ├── index.ts          # Barrel export
   ├── MyFeature.tsx     # Main component
   ├── components/       # Sub-components
   └── hooks/            # Feature-specific hooks
   ```

2. **Create barrel export**:
   ```typescript
   // features/my-feature/index.ts
   export { MyFeature } from './MyFeature';
   export * from './components';
   ```

3. **Register in module config**:
   ```typescript
   // config/modules.tsx
   const MyFeature = lazyWithPreload(() => import('../features/my-feature'));
   ```

---

## 🛠️ **Tooling & Automation**

### Recommended Tools

1. **Circular Dependency Detection**:
   ```bash
   npm install -D madge
   npx madge --circular --extensions ts,tsx src/
   ```

2. **Import Sorting**:
   ```bash
   npm install -D eslint-plugin-import
   # Configure in eslint.config.js
   ```

3. **Unused Code Detection**:
   ```bash
   npx knip
   ```

4. **Type Consistency**:
   Add ESLint rule to prevent relative imports:
   ```json
   {
     "rules": {
       "no-restricted-imports": ["error", {
         "patterns": ["../*", "../../*"]
       }]
     }
   }
   ```

### VSCode Settings

Recommended `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "javascript.preferences.importModuleSpecifier": "non-relative",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

---

## 📊 **Audit Statistics**

| Metric | Count |
|--------|-------|
| **Total TS/TSX Files** | 2,256 |
| **Barrel Export Files** | 333 |
| **Type Definition Files** | 41 |
| **Duplicate Type Definitions** | 5 groups (Notification, ValidationError, EthicalWall, CalendarEvent, BILLING_QUERY_KEYS) |
| **Relative Imports (should be absolute)** | ~100+ files |
| **Circular Dependencies** | 0 (potential risk in API ↔ Services) |
| **Feature Modules** | 60+ |
| **API Services** | 90+ |
| **Custom Hooks** | 50+ |
| **Utility Functions** | 46+ |

---

## ✅ **Action Items**

### Immediate (High Priority)
- [ ] Consolidate duplicate type definitions (Notification, ValidationError)
- [ ] Move `SearchResult` from API layer to types
- [ ] Convert 100+ relative imports to absolute imports in hooks/utils/features
- [ ] Remove wildcard type re-exports from service files

### Short-term (Medium Priority)
- [ ] Create barrel exports for all feature modules
- [ ] Run `knip` to identify unused exports
- [ ] Add ESLint rule to enforce absolute imports
- [ ] Document API service organization in backend docs

### Long-term (Low Priority)
- [ ] Implement automated circular dependency checks in CI/CD
- [ ] Create type generation pipeline from backend DTOs
- [ ] Establish feature module conventions documentation
- [ ] Add import sorting automation

---

## 📚 **References**

- **Project README**: `../README.md`
- **Copilot Instructions**: `../.github/copilot-instructions.md`
- **Backend Documentation**: `../backend/README.md`
- **Module Configuration**: `config/modules.tsx`
- **Type Definitions**: `types.ts` + `types/` directory
- **API Services**: `api/index.ts` + `api/domains/`
- **Data Service**: `services/data/dataService.ts`

---

**Last Audit**: December 28, 2025  
**Audited By**: Systems Architecture Team  
**Status**: ✅ Comprehensive analysis complete
