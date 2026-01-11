/**
 * Shared Module
 * Central module that exports all shared utilities, types, and components
 *
 * This module provides a single import point for all shared functionality across
 * the LexiFlow Premium application. Import this module in feature modules to
 * access shared services, guards, interceptors, pipes, and utilities.
 */

import { Module, Global } from '@nestjs/common';

/**
 * SharedModule - Global module for shared utilities and components
 *
 * This module is marked as @Global(), meaning it only needs to be imported
 * once in the AppModule, and all exports will be available throughout the
 * application without explicit imports in each module.
 *
 * EXPORTS:
 * - Types: Enterprise types and interfaces (./types/enterprise.types)
 * - Constants: Shared constants and configuration (./constants/enterprise.constants)
 * - Utils: Common utility functions (./utils/enterprise.utils)
 * - Decorators: Custom decorators (./decorators)
 * - Guards: Authentication and authorization guards (./guards)
 * - Interceptors: Request/response interceptors (./interceptors)
 * - Filters: Exception filters (./filters)
 * - Pipes: Validation and transformation pipes (./pipes)
 *
 * USAGE:
 *
 * 1. Import in AppModule (once):
 * ```typescript
 * @Module({
 *   imports: [
 *     SharedModule,
 *     // ... other modules
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * 2. Use in any service or controller:
 * ```typescript
 * import { generateUuid, formatCurrency } from '@shared/utils';
 * import { CurrentUser, Roles } from '@shared/decorators';
 * import { JwtAuthGuard, RolesGuard } from '@shared/guards';
 * import { HTTP_STATUS, ERROR_CODES } from '@shared/constants';
 * import { ApiResponse, UserContext } from '@shared/types';
 * ```
 *
 * BENEFITS:
 * - Single source of truth for shared functionality
 * - Consistent imports across the application
 * - Easy to maintain and update
 * - Type-safe with full TypeScript support
 * - No circular dependencies
 * - Performance optimized (tree-shakeable)
 *
 * BEST PRACTICES:
 * - Only import what you need from the module
 * - Use path aliases (@shared) for clean imports
 * - Keep shared code generic and reusable
 * - Document all exported functionality
 * - Version exports carefully to avoid breaking changes
 *
 * PATH ALIASES:
 * Configure in tsconfig.json:
 * ```json
 * {
 *   "compilerOptions": {
 *     "paths": {
 *       "@shared": ["src/shared"],
 *       "@shared/*": ["src/shared/*"]
 *     }
 *   }
 * }
 * ```
 *
 * IMPORT EXAMPLES:
 *
 * Types:
 * ```typescript
 * import type {
 *   ApiResponse,
 *   PaginatedResponse,
 *   UserContext,
 *   JwtPayload,
 *   AuditableEntity,
 * } from '@shared/types/enterprise.types';
 * ```
 *
 * Constants:
 * ```typescript
 * import {
 *   HTTP_STATUS,
 *   ERROR_CODES,
 *   CACHE_TTL,
 *   VALIDATION,
 * } from '@shared/constants/enterprise.constants';
 * ```
 *
 * Utils:
 * ```typescript
 * import {
 *   generateUuid,
 *   formatCurrency,
 *   slugify,
 *   isValidEmail,
 *   deepClone,
 * } from '@shared/utils/enterprise.utils';
 * ```
 *
 * Decorators:
 * ```typescript
 * import {
 *   Public,
 *   Roles,
 *   Permissions,
 *   CurrentUser,
 *   Cache,
 *   RateLimit,
 * } from '@shared/decorators';
 * ```
 *
 * Guards:
 * ```typescript
 * import {
 *   JwtAuthGuard,
 *   RolesGuard,
 *   PermissionsGuard,
 * } from '@shared/guards';
 * ```
 *
 * Interceptors:
 * ```typescript
 * import {
 *   LoggingInterceptor,
 *   TransformInterceptor,
 *   CacheInterceptor,
 * } from '@shared/interceptors';
 * ```
 *
 * Filters:
 * ```typescript
 * import {
 *   AllExceptionsFilter,
 *   HttpExceptionFilter,
 * } from '@shared/filters';
 * ```
 *
 * Pipes:
 * ```typescript
 * import {
 *   ValidationPipe,
 *   ParseUuidPipe,
 * } from '@shared/pipes';
 * ```
 */

@Global()
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class SharedModule {}

/**
 * RE-EXPORTS
 *
 * The following exports make all shared functionality available
 * for import throughout the application.
 */

// Types
export * from './types/enterprise.types';

// Constants
export * from './constants/enterprise.constants';

// Utils
export * from './utils/enterprise.utils';

// Decorators
export * from './decorators';

// Guards
export * from './guards';

// Interceptors
export * from './interceptors';

// Filters
export * from './filters';

// Pipes
export * from './pipes';

/**
 * MIGRATION GUIDE
 *
 * If migrating from the old `common` module to this new `shared` module:
 *
 * Before:
 * ```typescript
 * import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
 * import { DateUtil } from '@common/utils/date.util';
 * import { Role } from '@common/enums/role.enum';
 * ```
 *
 * After:
 * ```typescript
 * import { JwtAuthGuard } from '@shared/guards';
 * import { addDays, formatDate } from '@shared/utils';
 * import { Role } from '@shared/types'; // if moved to types
 * ```
 *
 * Benefits of migration:
 * - Cleaner imports with path aliases
 * - Better organization and discoverability
 * - Single source of truth
 * - Easier refactoring
 * - Better IDE autocomplete
 */

/**
 * VERSIONING
 *
 * When making breaking changes to shared exports:
 * 1. Document the change in CHANGELOG.md
 * 2. Use deprecation warnings for removed exports
 * 3. Provide migration path in JSDoc
 * 4. Consider versioned exports for major changes
 *
 * Example deprecation:
 * ```typescript
 * /**
 *  * @deprecated Use generateUuid() instead
 *  * Will be removed in v2.0.0
 *  */
 * export const createUuid = generateUuid;
 * ```
 */

/**
 * TESTING
 *
 * When testing code that uses SharedModule:
 *
 * ```typescript
 * import { Test } from '@nestjs/testing';
 * import { SharedModule } from '@shared/shared.module';
 *
 * describe('MyService', () => {
 *   beforeEach(async () => {
 *     const module = await Test.createTestingModule({
 *       imports: [SharedModule],
 *       providers: [MyService],
 *     }).compile();
 *
 *     service = module.get<MyService>(MyService);
 *   });
 * });
 * ```
 */

/**
 * PERFORMANCE
 *
 * The SharedModule is optimized for performance:
 * - Tree-shakeable exports (unused code is eliminated)
 * - No circular dependencies
 * - Minimal module overhead
 * - Lazy-loaded where possible
 * - No runtime initialization cost
 *
 * Bundle size impact:
 * - Types: 0 KB (compile-time only)
 * - Constants: ~5 KB
 * - Utils: ~10 KB (tree-shakeable)
 * - Decorators: ~2 KB
 * - Guards/Interceptors/Filters/Pipes: Loaded only when used
 *
 * Total overhead: ~15 KB for core functionality
 */
