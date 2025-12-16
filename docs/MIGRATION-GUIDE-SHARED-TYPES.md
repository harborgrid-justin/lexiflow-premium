# Shared Types Migration Guide

## Overview

This guide explains how to migrate LexiFlow frontend and backend code to use the new `@lexiflow/shared-types` package. This package provides a single source of truth for type definitions, preventing type drift and ensuring consistency across the entire application.

## What's Included

The shared-types package includes:

- **Base Entities**: Common entity interfaces (BaseEntity, branded ID types)
- **Entity Interfaces**: Case, Document, User, etc.
- **Enums**: All shared enumerations (CaseStatus, DocumentType, UserRole, etc.)
- **DTOs**: Data Transfer Objects for API requests/responses
- **Interfaces**: Authentication, pagination, and other shared interfaces

## Installation

The package is already configured in the npm workspace. To install dependencies:

```bash
# From root directory
npm install

# Build shared types
npm run build:types
```

## Package Structure

```
packages/shared-types/
├── src/
│   ├── entities/         # Entity interfaces
│   │   ├── base.entity.ts
│   │   ├── case.entity.ts
│   │   ├── document.entity.ts
│   │   └── user.entity.ts
│   ├── enums/            # Shared enumerations
│   │   ├── case.enums.ts
│   │   ├── document.enums.ts
│   │   ├── user.enums.ts
│   │   ├── discovery.enums.ts
│   │   ├── billing.enums.ts
│   │   ├── litigation.enums.ts
│   │   ├── evidence.enums.ts
│   │   ├── communication.enums.ts
│   │   └── common.enums.ts
│   ├── dto/              # Data Transfer Objects
│   │   ├── pagination.dto.ts
│   │   └── api-response.dto.ts
│   └── interfaces/       # Shared interfaces
│       └── auth.interfaces.ts
└── dist/                 # Compiled output
```

## Frontend Migration

### Option 1: Gradual Migration (Recommended)

Use the migration helper file to re-export shared types:

```typescript
// frontend/types/shared-migration.ts (already created)
export * from '@lexiflow/shared-types';

// In your components - no changes needed initially
import { CaseStatus, DocumentType } from '../types/shared-migration';
```

### Option 2: Direct Import (Long-term)

Update imports to use shared types directly:

```typescript
// Before
import { CaseStatus } from './types/enums';

// After
import { CaseStatus } from '@lexiflow/shared-types';
```

### Example: Component Migration

```typescript
// Before
import { Case, CaseStatus } from './types/models';
import { PaginatedResponse } from './types';

// After
import { Case, CaseStatus, PaginatedResponse } from '@lexiflow/shared-types';

// Usage remains the same
const MyCaseComponent: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState<CaseStatus>(CaseStatus.OPEN);

  // ... rest of component
};
```

### Example: Service Migration

```typescript
// Before
import { Case, CaseStatus } from '../types/models';

export class CaseService {
  async getCases(): Promise<Case[]> {
    // ...
  }
}

// After
import { Case, CaseStatus } from '@lexiflow/shared-types';

export class CaseService {
  async getCases(): Promise<Case[]> {
    // Same implementation
  }
}
```

## Backend Migration

### Step 1: Import Shared Enums

Replace local enum definitions with shared enums:

```typescript
// Before
export enum CaseStatus {
  OPEN = 'Open',
  ACTIVE = 'Active',
  CLOSED = 'Closed',
  ARCHIVED = 'Archived',
}

// After - Remove local enum, import from shared types
import { CaseStatus } from '@lexiflow/shared-types';
```

### Step 2: Update TypeORM Entities

```typescript
// Before
import { Entity, Column } from 'typeorm';

export enum CaseStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
}

export enum CaseType {
  CIVIL = 'Civil',
  CRIMINAL = 'Criminal',
}

@Entity('cases')
export class Case {
  @Column({ type: 'enum', enum: CaseStatus })
  status: CaseStatus;

  @Column({ type: 'enum', enum: CaseType })
  type: CaseType;
}

// After
import { Entity, Column } from 'typeorm';
import { CaseStatus, CaseType } from '@lexiflow/shared-types';

@Entity('cases')
export class Case {
  @Column({ type: 'enum', enum: CaseStatus })
  status: CaseStatus;

  @Column({ type: 'enum', enum: CaseType })
  type: CaseType;
}
```

### Step 3: Update Controllers and Services

```typescript
// Before
import { CaseStatus } from './enums/case.enum';

@Controller('cases')
export class CasesController {
  @Get()
  async findAll(@Query('status') status: CaseStatus) {
    // ...
  }
}

// After
import { CaseStatus } from '@lexiflow/shared-types';

@Controller('cases')
export class CasesController {
  @Get()
  async findAll(@Query('status') status: CaseStatus) {
    // Same implementation
  }
}
```

### Step 4: Update DTOs

```typescript
// Before
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateCaseDto {
  @ApiProperty()
  @IsEnum(CaseStatus)
  status: CaseStatus;
}

// After
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CaseStatus } from '@lexiflow/shared-types';

export class CreateCaseDto {
  @ApiProperty({ enum: CaseStatus })
  @IsEnum(CaseStatus)
  status: CaseStatus;
}
```

## Key Migration Patterns

### 1. Enum Migration

```typescript
// ❌ Before: Local enum definition
export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// ✅ After: Import from shared types
import { DocumentStatus } from '@lexiflow/shared-types';
```

### 2. Interface Migration

```typescript
// ❌ Before: Local interface
export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  // ...
}

// ✅ After: Import from shared types
import { Case } from '@lexiflow/shared-types';

// Or extend if you need additional fields
import { Case as BaseCase } from '@lexiflow/shared-types';

export interface CaseWithRelations extends BaseCase {
  documents: Document[];
  parties: Party[];
}
```

### 3. API Response Migration

```typescript
// ❌ Before: Custom response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ✅ After: Use shared API response
import { ApiResponse, SuccessResponse, ErrorResponse } from '@lexiflow/shared-types';

// Usage
function getCases(): Promise<ApiResponse<Case[]>> {
  // ...
}
```

### 4. Pagination Migration

```typescript
// ❌ Before: Custom pagination
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

// ✅ After: Use shared pagination
import { PaginatedResponse } from '@lexiflow/shared-types';

function getCases(page: number): Promise<PaginatedResponse<Case>> {
  return {
    data: cases,
    total: 100,
    page: 1,
    limit: 20,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: false,
  };
}
```

## Date Handling

The shared types package handles dates consistently:

- **Shared Types**: Define dates as ISO 8601 strings (e.g., `createdAt: string`)
- **Backend (TypeORM)**: Uses `Date` objects internally
- **Serialization**: TypeORM/class-transformer automatically converts `Date` to ISO string in API responses
- **Frontend**: Receives and stores dates as ISO strings

```typescript
// Backend Entity
@Entity()
export class Case extends BaseEntity {
  @CreateDateColumn()
  createdAt: Date; // TypeORM Date object
}

// API Response (JSON)
{
  "id": "123",
  "createdAt": "2024-01-15T10:30:00.000Z" // ISO string
}

// Frontend
const case: Case = {
  id: "123",
  createdAt: "2024-01-15T10:30:00.000Z" // string in interface
};
```

## Migration Checklist

### Frontend

- [ ] Build shared-types package: `npm run build:types`
- [ ] Update imports to use `@lexiflow/shared-types`
- [ ] Remove duplicate type definitions
- [ ] Update component props and state types
- [ ] Update service method signatures
- [ ] Test application to ensure no type errors

### Backend

- [ ] Build shared-types package: `npm run build:types`
- [ ] Remove local enum definitions
- [ ] Import enums from `@lexiflow/shared-types`
- [ ] Update TypeORM entity decorators
- [ ] Update controller and service imports
- [ ] Update DTOs to use shared enums
- [ ] Verify database enum values match shared enum values
- [ ] Run tests to ensure functionality unchanged

## Benefits

1. **Single Source of Truth**: All type definitions in one place
2. **Type Safety**: Eliminates type drift between frontend and backend
3. **Reduced Duplication**: No more maintaining duplicate definitions
4. **Easier Refactoring**: Update types once, reflected everywhere
5. **Better DX**: Improved auto-complete and type checking
6. **Runtime Safety**: Prevents type mismatches that cause runtime errors

## Example Files

See these example files for migration patterns:

- **Frontend**: `frontend/types/shared-migration.ts`
- **Backend**: `backend/src/cases/entities/case.entity.migrated.example.ts`

## Common Issues

### Issue: Import not found

```
Error: Cannot find module '@lexiflow/shared-types'
```

**Solution**: Build the shared-types package first:

```bash
npm run build:types
```

### Issue: Enum values don't match database

If you get runtime errors about enum values, verify that database enum values match the shared enum values. You may need to update database values or run a migration.

```sql
-- Example: Update enum values in PostgreSQL
ALTER TYPE case_status RENAME VALUE 'open' TO 'Open';
```

### Issue: Type compatibility errors

If TypeORM entities show type errors with shared types, ensure you're using the correct pattern:

```typescript
// TypeORM entity uses Date
@CreateDateColumn()
createdAt: Date;

// Shared interface uses string
interface BaseEntity {
  createdAt: string;
}

// This is expected! class-transformer handles the conversion
```

## Next Steps

1. Review the shared-types package structure: `packages/shared-types/`
2. Read the package README: `packages/shared-types/README.md`
3. Start with high-value migrations (frequently used enums and interfaces)
4. Test thoroughly after each migration
5. Remove duplicate type definitions once migration is complete

## Support

For questions or issues with the migration, refer to:

- Package README: `packages/shared-types/README.md`
- Example migrations in this document
- Project CLAUDE.md for architecture details
