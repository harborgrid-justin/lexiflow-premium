# LexiFlow Shared Types - Type Definitions Guide

## Overview

This package provides type-safe, enterprise-grade type definitions shared between the LexiFlow frontend and backend. All types are production-ready and eliminate the use of `any` types.

## Type Categories

### 1. Common Types (`/common`)

#### JSON Value Types
Type-safe alternatives to `any` for dynamic data:

- `JsonPrimitive` - string | number | boolean | null
- `JsonObject` - { [key: string]: JsonValue }
- `JsonArray` - Array<JsonValue>
- `JsonValue` - Union of all valid JSON types

#### Specialized Types

- `UserPreferences` - Type-safe user preferences object with known fields
- `EntityMetadata` - Type-safe entity metadata for audit trails and custom data
- `CustomFields` - Type-safe custom fields mapping
- `ErrorDetails` - Structured error information for API responses
- `BatchOperationItem<T>` - Generic type for batch operations

**Usage:**
```typescript
import { JsonValue, UserPreferences, EntityMetadata } from '@lexiflow/shared-types';

// Instead of: metadata: any
interface Case {
  metadata: EntityMetadata;
}

// Instead of: preferences: Record<string, any>
interface User {
  preferences: UserPreferences;
}
```

### 2. Entities (`/entities`)

Core domain entities with complete type definitions:

- `BaseEntity` - Base interface with common fields (id, createdAt, updatedAt, etc.)
- `User` - User entity with roles, permissions, and preferences
- `UserProfile` - Subset of User for display
- `UserSummary` - Minimal user information for lists
- `Case` - Case/matter entity
- `CaseSummary` - Minimal case information
- `CaseStats` - Case statistics
- `Document` - Document entity with metadata
- `DocumentSummary` - Minimal document information
- `DocumentVersion` - Document version tracking

#### Branded Types (Type-Safe IDs)

All entity IDs use branded types for compile-time safety:

```typescript
export type Brand<K, T> = K & { readonly __brand: T };
export type CaseId = Brand<string, 'CaseId'>;
export type UserId = Brand<string, 'UserId'>;
export type DocumentId = Brand<string, 'DocumentId'>;
// ... and more
```

**Usage:**
```typescript
import { CaseId, UserId } from '@lexiflow/shared-types';

// Type error if you try to use DocumentId where CaseId is expected
function getCase(caseId: CaseId) { /* ... */ }

const docId: DocumentId = '123' as DocumentId;
getCase(docId); // ❌ Type error!
```

### 3. Enums (`/enums`)

Comprehensive enum definitions for all domain concepts:

- `UserRole` - User roles (ADMIN, ATTORNEY, PARALEGAL, etc.)
- `UserStatus` - User statuses (ACTIVE, INACTIVE, SUSPENDED, PENDING)
- `CaseStatus` - Case statuses (OPEN, ACTIVE, DISCOVERY, TRIAL, etc.)
- `CaseType` - Case types (CIVIL, CRIMINAL, FAMILY, etc.)
- `DocumentType` - Document types (MOTION, BRIEF, COMPLAINT, etc.)
- `DocumentStatus` - Document statuses (DRAFT, UNDER_REVIEW, APPROVED, etc.)
- `DocumentAccessLevel` - Access control levels
- And many more...

**Usage:**
```typescript
import { UserRole, CaseStatus } from '@lexiflow/shared-types';

const user = {
  role: UserRole.ATTORNEY,
  status: UserStatus.ACTIVE
};
```

### 4. DTOs (Data Transfer Objects) (`/dto`)

#### API Response Types

- `ApiResponse<T>` - Standard API response wrapper
- `SuccessResponse<T>` - Type-safe success response
- `ErrorResponse` - Type-safe error response
- `ApiError` - Error structure
- `ResponseMeta` - Response metadata
- `BatchOperationResult<T>` - Batch operation results
- `BatchOperationError<T>` - Batch operation errors

#### Pagination Types

- `PaginatedResponse<T>` - Paginated data wrapper
- `PaginationParams` - Query parameters for pagination
- `FilterParams` - Filter parameters
- `QueryParams` - Combined pagination and filter params

#### Entity-Specific DTOs

**Case DTOs:**
- `CreateCaseDto` - Create case request
- `UpdateCaseDto` - Update case request
- `CaseFilterParams` - Case filter parameters
- `CaseResponseDto` - Case response
- `BulkCaseOperationDto` - Bulk case operations

**Document DTOs:**
- `CreateDocumentDto` - Create document request
- `UpdateDocumentDto` - Update document request
- `DocumentFilterParams` - Document filter parameters
- `DocumentResponseDto` - Document response
- `DocumentUploadDto` - File upload request
- `CreateDocumentVersionDto` - Version creation
- `BulkDocumentOperationDto` - Bulk document operations

**User DTOs:**
- `CreateUserDto` - Create user request
- `UpdateUserDto` - Update user request
- `UserFilterParams` - User filter parameters
- `UserResponseDto` - User response (no password)
- `ChangePasswordDto` - Password change request
- `UpdateUserPreferencesDto` - Preferences update
- `InviteUserDto` - User invitation

### 5. Interfaces (`/interfaces`)

Authentication and authorization interfaces:

- `LoginCredentials` - Login request
- `LoginResponse` - Login response with tokens
- `AuthenticatedUser` - Authenticated user information
- `JwtPayload` - JWT token payload
- `RefreshTokenRequest` - Token refresh request
- `TwoFactorSetupResponse` - 2FA setup
- `TwoFactorVerificationRequest` - 2FA verification
- `PasswordResetRequest` - Password reset request
- `PasswordResetConfirmation` - Password reset confirmation
- `ChangePasswordRequest` - Password change request
- `SessionInfo` - Session information

## Best Practices

### 1. Never Use `any`

❌ **Don't:**
```typescript
interface Case {
  metadata: any;
  customFields: any;
}
```

✅ **Do:**
```typescript
import { EntityMetadata, CustomFields } from '@lexiflow/shared-types';

interface Case {
  metadata: EntityMetadata;
  customFields: CustomFields;
}
```

### 2. Use Branded Types for IDs

❌ **Don't:**
```typescript
interface Case {
  id: string;
  userId: string;
  documentId: string;
}
```

✅ **Do:**
```typescript
import { CaseId, UserId, DocumentId } from '@lexiflow/shared-types';

interface Case {
  id: CaseId;
  userId: UserId;
  documentId: DocumentId;
}
```

### 3. Use Proper DTO Types

❌ **Don't:**
```typescript
async function createCase(data: any) { /* ... */ }
```

✅ **Do:**
```typescript
import { CreateCaseDto, CaseResponseDto } from '@lexiflow/shared-types';

async function createCase(data: CreateCaseDto): Promise<CaseResponseDto> {
  /* ... */
}
```

### 4. Use Generic API Response Types

❌ **Don't:**
```typescript
interface Response {
  success: boolean;
  data: any;
  error: any;
}
```

✅ **Do:**
```typescript
import { ApiResponse, Case } from '@lexiflow/shared-types';

type CaseApiResponse = ApiResponse<Case>;
```

### 5. Use JsonValue for Dynamic Data

❌ **Don't:**
```typescript
interface Config {
  settings: any;
  data: Record<string, any>;
}
```

✅ **Do:**
```typescript
import { JsonValue, JsonObject } from '@lexiflow/shared-types';

interface Config {
  settings: JsonObject;
  data: Record<string, JsonValue>;
}
```

## Type Exports

All types are exported from the main index:

```typescript
// Import everything
import * from '@lexiflow/shared-types';

// Or import specific categories
import { User, Case, Document } from '@lexiflow/shared-types'; // entities
import { UserRole, CaseStatus } from '@lexiflow/shared-types'; // enums
import { CreateCaseDto, ApiResponse } from '@lexiflow/shared-types'; // DTOs
import { LoginCredentials } from '@lexiflow/shared-types'; // interfaces
import { JsonValue, UserPreferences } from '@lexiflow/shared-types'; // common
```

## Migration Guide

### From `any` to Proper Types

1. **Metadata/Custom Fields:**
   ```typescript
   // Before
   metadata: any

   // After
   metadata: EntityMetadata
   ```

2. **Preferences:**
   ```typescript
   // Before
   preferences: Record<string, any>

   // After
   preferences: UserPreferences
   ```

3. **Dynamic Data:**
   ```typescript
   // Before
   data: any

   // After
   data: JsonValue
   ```

4. **Error Details:**
   ```typescript
   // Before
   error: any

   // After
   error: ErrorDetails
   ```

### From Frontend Types to Shared Types

Many frontend types should now import from shared-types:

```typescript
// Before (frontend/types/case.ts)
export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
}

// After
import { Case } from '@lexiflow/shared-types';
// Use the shared type directly
```

## Type Consistency Checks

The following should always be true:

1. ✅ No `any` types in production code (except React component types)
2. ✅ All entity IDs use branded types
3. ✅ All API responses use `ApiResponse<T>` wrapper
4. ✅ All DTOs have proper request/response types
5. ✅ All dynamic data uses `JsonValue` or specific types
6. ✅ Frontend and backend use the same entity types

## Building and Compilation

To rebuild type declarations:

```bash
cd packages/shared-types
npm run build
```

This generates `.d.ts` files for TypeScript consumption.

## Version

Current version: 1.0.0

See `SHARED_TYPES_VERSION` constant for programmatic version checking.
