# API Types Directory - TypeScript Best Practices

## 📋 Overview

This directory contains **mock data constants** for development, testing, and seeding. The type definitions themselves live in `/frontend/src/types/`.

## ⚠️ Important: All Exports Are Deprecated for Production

```typescript
// ❌ DON'T: Import mock data directly
import { MOCK_CASES } from '@/api/types';

// ✅ DO: Use DataService facade
import { DataService } from '@/services/dataService';
const cases = await DataService.cases.getAll();
```

## 🏗️ Architecture

### Type Definitions (Public API - Not Deprecated)
Only a few files export actual **type definitions** that are part of the public API:

- `federalHierarchy.ts` - `CourtNode`, `StateJurisdiction`, etc.
- `mockLitigationPlaybooks.ts` - `PlaybookStage`, `LinkedAuthority`, `Playbook`, etc.

These types follow TypeScript best practices:
- ✅ Use `type` over `interface` for composability
- ✅ Use `readonly` modifiers for immutability
- ✅ Explicit JSDoc documentation
- ✅ Discriminated unions where appropriate
- ✅ Branded types for IDs (inherited from base types)

### Mock Data Constants (Deprecated)
All other exports are mock data constants used for:
- Development seeding
- Testing fixtures  
- Storybook stories
- API documentation

## 📐 TypeScript Best Practices Applied

### 1. Types as Public API
```typescript
/**
 * Represents a court node in the federal hierarchy
 * @property name - Official circuit or court name
 * @property districts - Optional array of district court names
 */
export type CourtNode = {
    readonly name: string;
    readonly districts?: readonly string[];
};
```

### 2. Explicit Export Lists
```typescript
// ✅ Explicit exports
export type {
  CourtNode,
  StateJurisdictionLevel,
  StateJurisdiction
} from './federalHierarchy';

// ❌ Avoid wildcard exports
// export * from './federalHierarchy';
```

### 3. Type Over Interface
```typescript
// ✅ Use type for composability
export type PlaybookStage = {
  readonly name: string;
  readonly duration: string;
  readonly criticalTasks: readonly string[];
};

// ❌ Avoid interface unless you need declaration merging
// export interface PlaybookStage { ... }
```

### 4. Discriminated Unions
```typescript
export type AuthorityType = 'Case' | 'Statute' | 'Rule';

export type PlaybookDifficulty = 'Low' | 'Medium' | 'High';
```

### 5. Immutability with Readonly
```typescript
export type Playbook = {
  readonly id: string;
  readonly title: string;
  readonly stages: readonly PlaybookStage[];  // Deep readonly
  readonly authorities: readonly LinkedAuthority[];
};
```

### 6. Comprehensive Documentation
```typescript
/**
 * Linked legal authority with citation
 * @property id - Unique identifier for the authority
 * @property title - Case name or statute title
 * @property citation - Proper legal citation format
 * @property type - Category of legal authority
 * @property relevance - Brief explanation of applicability
 */
export type LinkedAuthority = {
  readonly id: string;
  readonly title: string;
  readonly citation: string;
  readonly type: AuthorityType;
  readonly relevance: string;
};
```

## 🔄 Migration Guide

### If You're Using Mock Data
```typescript
// Before (deprecated)
import { MOCK_CASES } from '@/api/types';

// After (recommended)
import { DataService } from '@/services/dataService';
import { queryKeys } from '@/types';

// In React component
const { data: cases } = useQuery({
  queryKey: queryKeys.cases.all(),
  queryFn: () => DataService.cases.getAll()
});
```

### If You're Using Type Definitions
```typescript
// ✅ These are NOT deprecated - use freely
import type { 
  CourtNode, 
  PlaybookStage, 
  LinkedAuthority 
} from '@/api/types';

// Type-only imports are safe and recommended
const court: CourtNode = {
  name: "4th Circuit",
  districts: ["E.D. Virginia", "W.D. Virginia"]
};
```

## 📁 File Organization

```
api/types/
├── index.ts                    # Barrel export with explicit lists
├── README.md                   # This file
│
├── Type Definitions (Public API)
│   ├── federalHierarchy.ts    # Court structure types
│   └── mockLitigationPlaybooks.ts  # Playbook types
│
└── Mock Data (Deprecated)
    ├── case.ts                 # MOCK_CASES
    ├── document.ts             # MOCK_DOCUMENTS
    ├── user.ts                 # MOCK_USERS
    └── ... 50+ other mock data files
```

## 🚫 Anti-Patterns to Avoid

### ❌ Don't Mix Types and Runtime Logic
```typescript
// ❌ Bad - mixes types with data
export interface User { id: string; }
export const DEFAULT_USER: User = { id: '1' };
export function createUser() { ... }  // Don't do this!

// ✅ Good - separate concerns
// types/user.ts
export type User = { readonly id: string; };

// services/userService.ts
export const createUser = () => { ... };
```

### ❌ Don't Use Wildcard Exports
```typescript
// ❌ Bad - exposes everything
export * from './case';
export * from './document';

// ✅ Good - explicit control
export { MOCK_CASES } from './case';
export { MOCK_DOCUMENTS } from './document';
```

### ❌ Don't Overuse Utility Types
```typescript
// ❌ Bad - hard to understand
type ComplexType = Partial<Omit<Pick<User, 'id' | 'name'>, 'id'>> & { email: string };

// ✅ Good - explicit and clear
type UserEmail = {
  readonly name: string;
  readonly email: string;
};
```

## 🔗 Related Documentation

- [Main Types Directory](/frontend/src/types/) - Domain types
- [DataService](/frontend/src/services/dataService.ts) - Data access facade
- [Backend API](/backend/src/) - REST API implementation
- [Shared Types](/packages/shared-types/) - Shared between frontend/backend

## 📝 Naming Conventions

| Suffix | Purpose | Example |
|--------|---------|---------|
| `Type` | Discriminated union | `AuthorityType` |
| `Config` | Configuration object | `WarRoomConfig` |
| `Node` | Tree/graph structure | `CourtNode` |
| `Dto` | Data transfer object | `CreateUserDto` |
| `Input` | Input parameters | `CreateUserInput` |
| `Response` | API response | `PaginatedResponse<T>` |

## 🛡️ Type Safety Features

- **Branded Types**: Inherited from base types (e.g., `CaseId`, `UserId`)
- **Readonly Modifiers**: Prevent accidental mutations
- **Discriminated Unions**: Eliminate impossible states
- **Explicit Exports**: Control public API surface

## 🔧 Tooling

### ESLint Rules (Enforced)
```json
{
  "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  "@typescript-eslint/explicit-module-boundary-types": "warn",
  "@typescript-eslint/no-explicit-any": "error"
}
```

### TypeScript Config
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

## 📊 Statistics

- **Total Files**: 58
- **Type Definition Files**: 2 (public API)
- **Mock Data Files**: 56 (deprecated for production)
- **Total Mock Constants**: 70+
- **Explicit Exports**: 100% (no wildcard exports)

---

**Last Updated**: December 28, 2025  
**Architecture**: Backend-first (PostgreSQL + NestJS)  
**Status**: Production-ready with deprecation warnings
