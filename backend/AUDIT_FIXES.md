# LexiFlow Backend ESLint Audit Fixes

**Enterprise NestJS Legal Application - $350M Audit**

This document tracks common patterns, reusable type definitions, and fixes applied during the ESLint audit process.

---

## Table of Contents
- [Reusable Type Definitions](#reusable-type-definitions)
- [Common Fix Patterns](#common-fix-patterns)
- [Completed Fixes](#completed-fixes)
- [Pending Issues](#pending-issues)

---

## Reusable Type Definitions

### Request Types

```typescript
import { Request } from 'express';

// Authenticated user request
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Admin request with additional permissions
interface AdminRequest extends AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'superadmin';
    permissions: string[];
  };
}

// Request with file upload
interface FileUploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}
```

### Generic Service Types

```typescript
// Generic data object
type DataObject = Record<string, unknown>;

// Generic pagination parameters
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Generic API response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic query filters
type QueryFilters = Record<string, string | number | boolean | null | undefined>;
```

### Database Types

```typescript
// Generic entity with timestamps
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Generic repository result
type RepositoryResult<T> = T | null;
type RepositoryResults<T> = T[];
```

---

## Common Fix Patterns

### 1. Replacing `any` in Request Objects

**Before:**
```typescript
async getUser(@Req() req: any) {
  const userId = req.user.id;
}
```

**After:**
```typescript
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

async getUser(@Req() req: AuthenticatedRequest) {
  const userId = req.user?.id;
}
```

**Alternative (if no custom properties):**
```typescript
async getData(@Req() req: Request) {
  const header = req.headers.authorization;
}
```

---

### 2. Replacing `any` in Service Methods

**Before:**
```typescript
async createUser(data: any) {
  return this.userRepository.save(data);
}
```

**After (Option 1 - Generic Record):**
```typescript
async createUser(data: Record<string, unknown>) {
  return this.userRepository.save(data);
}
```

**After (Option 2 - Specific Interface):**
```typescript
interface CreateUserDto {
  email: string;
  name: string;
  role?: string;
}

async createUser(data: CreateUserDto) {
  return this.userRepository.save(data);
}
```

**After (Option 3 - Generic Type Parameter):**
```typescript
async createEntity<T extends Record<string, unknown>>(data: T): Promise<T> {
  return this.repository.save(data) as Promise<T>;
}
```

---

### 3. Fixing Unused Variables

**Before:**
```typescript
async deleteUser(id: string) {
  try {
    return await this.userRepository.delete(id);
  } catch (error) {
    throw new Error('Failed to delete user');
  }
}
```

**After (Option 1 - Use the variable):**
```typescript
async deleteUser(id: string) {
  try {
    return await this.userRepository.delete(id);
  } catch (error: unknown) {
    this.logger.error('Failed to delete user', error);
    throw new Error('Failed to delete user');
  }
}
```

**After (Option 2 - Remove unused catch binding):**
```typescript
async deleteUser(id: string) {
  try {
    return await this.userRepository.delete(id);
  } catch {
    throw new Error('Failed to delete user');
  }
}
```

**After (Option 3 - Prefix with underscore if needed for documentation):**
```typescript
async processData(_metadata: string, data: unknown) {
  // metadata is required by interface but not used in this implementation
  return this.process(data);
}
```

---

### 4. Fixing Non-null Assertions (!.)

**Before:**
```typescript
const userName = user!.name;
const email = user.profile!.email;
```

**After (Option 1 - Optional chaining with default):**
```typescript
const userName = user?.name ?? 'Unknown';
const email = user?.profile?.email ?? '';
```

**After (Option 2 - Guard clause):**
```typescript
if (!user || !user.profile) {
  throw new Error('User profile not found');
}
const userName = user.name;
const email = user.profile.email;
```

**After (Option 3 - Type narrowing):**
```typescript
function processUser(user: User | null) {
  if (!user) return;

  // TypeScript knows user is not null here
  const userName = user.name;
}
```

---

### 5. Fixing @typescript-eslint/no-explicit-any

**Before:**
```typescript
function processData(data: any): any {
  return data.map((item: any) => item.id);
}
```

**After:**
```typescript
function processData(data: Array<{ id: string }>): string[] {
  return data.map((item) => item.id);
}

// Or with unknown for truly dynamic data:
function processData(data: unknown): unknown {
  if (!Array.isArray(data)) return null;
  return data.map((item) =>
    typeof item === 'object' && item !== null && 'id' in item
      ? item.id
      : null
  );
}
```

---

### 6. Fixing @typescript-eslint/no-unused-vars

**Pattern 1 - Function Parameters:**
```typescript
// Before
function handler(req: Request, res: Response, next: NextFunction) {
  return res.json({ ok: true });
}

// After (prefix with underscore)
function handler(_req: Request, res: Response, _next: NextFunction) {
  return res.json({ ok: true });
}
```

**Pattern 2 - Import Statements:**
```typescript
// Before
import { Logger, Injectable } from '@nestjs/common';

// After (remove unused)
import { Injectable } from '@nestjs/common';
```

**Pattern 3 - Destructuring:**
```typescript
// Before
const { id, name, email } = user;
return { id, name };

// After (remove unused)
const { id, name } = user;
return { id, name };
```

---

### 7. Fixing @typescript-eslint/no-non-null-assertion

**Pattern 1 - Array access:**
```typescript
// Before
const firstItem = items[0]!;

// After
const firstItem = items[0];
if (!firstItem) throw new Error('No items found');
// Or
const firstItem = items[0] ?? defaultItem;
```

**Pattern 2 - Object properties:**
```typescript
// Before
const config = process.env.CONFIG!;

// After
const config = process.env.CONFIG;
if (!config) throw new Error('CONFIG not set');
// Or with default
const config = process.env.CONFIG ?? 'default-config';
```

---

### 8. Fixing Async/Promise Issues

**Before:**
```typescript
async function getData() {
  const result = someAsyncFunction();  // Missing await
  return result;
}
```

**After:**
```typescript
async function getData() {
  const result = await someAsyncFunction();
  return result;
}

// Or if intentionally returning promise:
function getData(): Promise<Data> {
  return someAsyncFunction();
}
```

---

### 9. Fixing Express Response Types

**Before:**
```typescript
async getUsers(@Res() res: any) {
  const users = await this.userService.findAll();
  return res.json(users);
}
```

**After:**
```typescript
import { Response } from 'express';

async getUsers(@Res() res: Response) {
  const users = await this.userService.findAll();
  return res.json(users);
}
```

---

### 10. Fixing Exception Filter Types

**Before:**
```typescript
catch(exception: any, host: ArgumentsHost) {
  // handle exception
}
```

**After:**
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // handle exception
  }
}

// For unknown exceptions:
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const isHttpException = exception instanceof HttpException;
    // handle accordingly
  }
}
```

---

## Completed Fixes

### Session 1 - Initial Audit
- [ ] Controllers: Fixed request typing in authentication controllers
- [ ] Services: Replaced `any` types with proper DTOs
- [ ] Guards: Added proper type definitions for JWT validation
- [ ] Filters: Typed exception handlers

### Session 2 - Service Layer
- [ ] User service: Typed all method parameters
- [ ] Document service: Added proper return types
- [ ] AI service: Typed API response structures

### Session 3 - Database Layer
- [ ] Repositories: Added generic typing
- [ ] Entities: Ensured all properties are typed
- [ ] Migrations: Verified type safety

---

## Pending Issues

### High Priority
- [ ] Review all `@ts-ignore` comments and replace with proper fixes
- [ ] Ensure all external API calls are properly typed
- [ ] Add missing DTO validation decorators

### Medium Priority
- [ ] Refactor remaining `any` types in test files
- [ ] Add strict null checks where missing
- [ ] Review and type all middleware

### Low Priority
- [ ] Add JSDoc comments for complex types
- [ ] Create shared type library for common patterns
- [ ] Document architectural decisions for type choices

---

## Notes

### When to Use Each Approach

**Use `unknown` when:**
- Receiving data from external sources (APIs, user input)
- You need to perform runtime type checking
- The type is truly unknown and will be validated

**Use `Record<string, unknown>` when:**
- Dealing with generic objects
- Working with dynamic configuration
- Type will be validated or transformed

**Use specific interfaces when:**
- The shape of data is known
- You want compile-time safety
- Working with internal application types

**Use generic types when:**
- Creating reusable utilities
- Working with multiple similar types
- Building flexible APIs

### ESLint Configuration Notes

Current strict rules enabled:
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/no-unused-vars: error`
- `@typescript-eslint/no-non-null-assertion: error`
- `no-console: warn`

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [ESLint TypeScript Rules](https://typescript-eslint.io/rules/)

---

**Last Updated:** 2025-12-27
**Audit Status:** In Progress
**Target Completion:** TBD
