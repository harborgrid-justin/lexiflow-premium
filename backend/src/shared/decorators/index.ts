/**
 * Shared Decorators
 * Central export point for all custom decorators used in LexiFlow Premium
 *
 * This file provides a single import point for all decorators across the application.
 * Each decorator is documented with its purpose and usage examples.
 */

// =============================================================================
// AUTHENTICATION & AUTHORIZATION DECORATORS
// =============================================================================

/**
 * @Public
 * Marks a route as publicly accessible (bypasses authentication)
 *
 * Usage:
 * ```typescript
 * @Public()
 * @Get('public-endpoint')
 * async publicRoute() { ... }
 * ```
 */
export { Public } from '@common/decorators/public.decorator';

/**
 * @Roles
 * Restricts access to specific user roles
 *
 * Usage:
 * ```typescript
 * @Roles('admin', 'manager')
 * @Get('admin-only')
 * async adminRoute() { ... }
 * ```
 */
export { Roles } from '@common/decorators/roles.decorator';

/**
 * @Permissions
 * Restricts access based on user permissions
 *
 * Usage:
 * ```typescript
 * @Permissions('case:read', 'case:write')
 * @Get('cases')
 * async getCases() { ... }
 * ```
 */
export { Permissions } from '@common/decorators/permissions.decorator';

/**
 * @CurrentUser
 * Injects the current authenticated user into route handler
 *
 * Usage:
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: User) { ... }
 * ```
 */
export { CurrentUser } from '@common/decorators/current-user.decorator';

// =============================================================================
// API DOCUMENTATION DECORATORS
// =============================================================================

/**
 * @ApiPaginatedResponse
 * Documents paginated API responses for Swagger
 *
 * Usage:
 * ```typescript
 * @ApiPaginatedResponse(CaseDto)
 * @Get('cases')
 * async getCases() { ... }
 * ```
 */
export { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

/**
 * Swagger common decorators for API documentation
 */
export * from '@common/decorators/swagger-common.decorator';

// =============================================================================
// CACHING DECORATORS
// =============================================================================

/**
 * @Cache
 * Enables caching for route responses
 *
 * Usage:
 * ```typescript
 * @Cache({ ttl: 300 }) // Cache for 5 minutes
 * @Get('data')
 * async getData() { ... }
 * ```
 */
export { Cache } from '@common/decorators/cache.decorator';

/**
 * @Cacheable
 * Advanced caching decorator with configurable options
 *
 * Usage:
 * ```typescript
 * @Cacheable({ key: 'user-data', ttl: 600 })
 * async getUserData() { ... }
 * ```
 */
export { Cacheable } from '@performance/decorators/cacheable.decorator';

// =============================================================================
// RATE LIMITING DECORATORS
// =============================================================================

/**
 * @RateLimit
 * Applies rate limiting to specific routes
 *
 * Usage:
 * ```typescript
 * @RateLimit({ windowMs: 60000, maxRequests: 10 })
 * @Post('login')
 * async login() { ... }
 * ```
 */
export { RateLimit } from '@common/decorators/rate-limit.decorator';

// =============================================================================
// AUDIT LOGGING DECORATORS
// =============================================================================

/**
 * @AuditLog
 * Automatically logs method execution for audit trails
 *
 * Usage:
 * ```typescript
 * @AuditLog('USER_UPDATED')
 * @Put('users/:id')
 * async updateUser() { ... }
 * ```
 */
export { AuditLog } from '@common/decorators/audit-log.decorator';

// =============================================================================
// TRANSACTION DECORATORS
// =============================================================================

/**
 * @Transaction
 * Wraps method execution in a database transaction
 *
 * Usage:
 * ```typescript
 * @Transaction()
 * async createUserWithProfile() { ... }
 * ```
 */
export { Transaction } from '@common/decorators/transaction.decorator';

// =============================================================================
// VALIDATION DECORATORS
// =============================================================================

/**
 * @IsStrongPassword
 * Validates password strength (custom class-validator decorator)
 *
 * Usage:
 * ```typescript
 * class CreateUserDto {
 *   @IsStrongPassword()
 *   password: string;
 * }
 * ```
 */
export { IsStrongPassword } from '@common/decorators/is-strong-password.decorator';

// =============================================================================
// SECURITY DECORATORS
// =============================================================================

/**
 * @SkipIpCheck
 * Bypasses IP reputation checks for specific routes
 *
 * Usage:
 * ```typescript
 * @SkipIpCheck()
 * @Get('webhook')
 * async handleWebhook() { ... }
 * ```
 */
export { SkipIpCheck } from '@security/decorators/skip.ip.check.decorator';

/**
 * @EncryptedColumn
 * Marks a database column for automatic encryption/decryption
 *
 * Usage:
 * ```typescript
 * @EncryptedColumn()
 * @Column()
 * ssn: string;
 * ```
 */
export { EncryptedColumn } from '@database/security/decorators/encrypted.column.decorator';

// =============================================================================
// DECORATOR USAGE GUIDELINES
// =============================================================================

/**
 * DECORATOR BEST PRACTICES:
 *
 * 1. Authentication & Authorization:
 *    - Always use @Public() for routes that don't require authentication
 *    - Prefer @Permissions over @Roles for fine-grained access control
 *    - Combine decorators: @Roles() + @Permissions() for layered security
 *
 * 2. Caching:
 *    - Use @Cache for simple route-level caching
 *    - Use @Cacheable for method-level caching with advanced options
 *    - Set appropriate TTL values based on data volatility
 *
 * 3. Rate Limiting:
 *    - Apply stricter limits to authentication endpoints
 *    - Use custom key generators for user-specific rate limiting
 *    - Configure different limits for different route categories
 *
 * 4. Audit Logging:
 *    - Use @AuditLog for all data modification operations
 *    - Include meaningful action names for audit trail clarity
 *    - Ensure sensitive data is not logged in audit entries
 *
 * 5. Transactions:
 *    - Use @Transaction for operations that modify multiple entities
 *    - Keep transaction scope minimal to avoid long-running locks
 *    - Handle errors properly within transactional methods
 *
 * 6. Security:
 *    - Use @EncryptedColumn for PII and sensitive data
 *    - Apply @SkipIpCheck sparingly and only for trusted endpoints
 *    - Validate all user input with class-validator decorators
 *
 * DECORATOR ORDERING:
 * When using multiple decorators, follow this order for consistency:
 * 1. Swagger/API documentation decorators
 * 2. Route decorators (@Get, @Post, etc.)
 * 3. Security decorators (@Public, @Roles, @Permissions)
 * 4. Performance decorators (@Cache, @RateLimit)
 * 5. Cross-cutting concerns (@AuditLog, @Transaction)
 *
 * Example:
 * ```typescript
 * @ApiOperation({ summary: 'Update case' })
 * @ApiPaginatedResponse(CaseDto)
 * @Put(':id')
 * @Permissions('case:update')
 * @RateLimit({ windowMs: 60000, maxRequests: 30 })
 * @AuditLog('CASE_UPDATED')
 * @Transaction()
 * async updateCase(@Param('id') id: string, @Body() dto: UpdateCaseDto) {
 *   // Implementation
 * }
 * ```
 */
