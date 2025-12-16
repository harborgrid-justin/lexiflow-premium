# @lexiflow/shared-types

Shared TypeScript type definitions for LexiFlow Premium frontend and backend.

## Overview

This package provides a single source of truth for type definitions, enums, DTOs, and interfaces used across the LexiFlow application. It eliminates type drift between frontend and backend systems and ensures type safety throughout the entire application.

## Installation

This package is part of the LexiFlow monorepo and is installed via npm workspaces:

```bash
# From root directory
npm install

# Build the shared types package
npm run build:types
```

## Structure

```
packages/shared-types/
├── src/
│   ├── entities/         # Shared entity interfaces
│   │   ├── base.entity.ts       # Base entity with common fields
│   │   ├── case.entity.ts       # Case-related entities
│   │   ├── document.entity.ts   # Document-related entities
│   │   ├── user.entity.ts       # User-related entities
│   │   └── index.ts
│   ├── enums/            # Shared enumerations
│   │   ├── case.enums.ts        # Case status, type, etc.
│   │   ├── document.enums.ts    # Document status, type, etc.
│   │   ├── user.enums.ts        # User roles, status, etc.
│   │   ├── discovery.enums.ts   # Discovery-related enums
│   │   ├── billing.enums.ts     # Billing-related enums
│   │   ├── litigation.enums.ts  # Litigation-related enums
│   │   ├── evidence.enums.ts    # Evidence-related enums
│   │   ├── communication.enums.ts # Communication enums
│   │   ├── common.enums.ts      # Common enums
│   │   └── index.ts
│   ├── dto/              # Data Transfer Objects
│   │   ├── pagination.dto.ts    # Pagination interfaces
│   │   ├── api-response.dto.ts  # API response wrappers
│   │   └── index.ts
│   ├── interfaces/       # Shared interfaces
│   │   ├── auth.interfaces.ts   # Authentication interfaces
│   │   └── index.ts
│   └── index.ts          # Main export
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### In Frontend

```typescript
// Import shared types
import {
  Case,
  CaseStatus,
  CaseType,
  PaginatedResponse,
  ApiResponse
} from '@lexiflow/shared-types';

// Use in components
const MyComponent = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [status, setStatus] = useState<CaseStatus>(CaseStatus.OPEN);

  // ...
};
```

### In Backend

```typescript
// Import shared enums in TypeORM entities
import { Entity, Column } from 'typeorm';
import { CaseStatus, CaseType } from '@lexiflow/shared-types';

@Entity('cases')
export class Case {
  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status: CaseStatus;

  @Column({
    type: 'enum',
    enum: CaseType,
    default: CaseType.CIVIL,
  })
  type: CaseType;
}
```

## Key Concepts

### Base Entity

All entities extend `BaseEntity` which provides common fields:

```typescript
interface BaseEntity {
  id: string;           // UUID
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
  deletedAt?: string;   // Soft delete timestamp
  createdBy?: string;   // User ID who created
  updatedBy?: string;   // User ID who last updated
}
```

### Date Handling

- **Frontend**: Dates are stored as ISO 8601 strings
- **Backend**: TypeORM entities use `Date` objects, automatically serialized to ISO strings in API responses
- **Shared Types**: Define dates as strings (for JSON serialization compatibility)

### Branded Types

The package includes branded types for type-safe IDs:

```typescript
type CaseId = Brand<string, 'CaseId'>;
type UserId = Brand<string, 'UserId'>;
type DocumentId = Brand<string, 'DocumentId'>;
// etc.
```

### API Response Format

Standard API response wrapper:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  meta?: ResponseMeta;
}
```

### Pagination

Consistent pagination across all list endpoints:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

## Migration Guide

### Migrating Existing Code

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build shared types**:
   ```bash
   npm run build:types
   ```

3. **Update imports** in your files:
   ```typescript
   // Before
   import { CaseStatus } from './enums/case.enum';

   // After
   import { CaseStatus } from '@lexiflow/shared-types';
   ```

4. **Remove duplicate type definitions** once migration is complete.

### Frontend Migration

For gradual migration, use the migration helper:

```typescript
// frontend/types/shared-migration.ts re-exports shared types
import { CaseStatus, DocumentType } from './types/shared-migration';
```

Eventually, update to direct imports:

```typescript
import { CaseStatus, DocumentType } from '@lexiflow/shared-types';
```

### Backend Migration

1. Remove local enum definitions from entities
2. Import enums from `@lexiflow/shared-types`
3. Update `@Column` decorators to use imported enums
4. Ensure enum values in database match shared enum values

Example:

```typescript
// Before
export enum CaseStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
}

@Column({ type: 'enum', enum: CaseStatus })
status: CaseStatus;

// After
import { CaseStatus } from '@lexiflow/shared-types';

@Column({ type: 'enum', enum: CaseStatus })
status: CaseStatus;
```

## Benefits

1. **Single Source of Truth**: All type definitions in one place
2. **Type Safety**: TypeScript ensures type consistency across frontend and backend
3. **Reduced Duplication**: No more maintaining duplicate type definitions
4. **Easier Refactoring**: Update types once, reflected everywhere
5. **Better Developer Experience**: Auto-complete and type checking work seamlessly
6. **Runtime Safety**: Eliminates type mismatches that cause runtime errors

## Development

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Adding New Types

1. Add the type definition in the appropriate file under `src/`
2. Export from the module's `index.ts`
3. The main `src/index.ts` will automatically export it
4. Rebuild the package: `npm run build`
5. Types are now available to frontend and backend

## Version

Current version: 1.0.0

## License

PROPRIETARY - LexiFlow Team
