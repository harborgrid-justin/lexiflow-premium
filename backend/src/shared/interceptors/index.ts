/**
 * Shared Interceptors
 * Central export point for all interceptors used in LexiFlow Premium
 *
 * This file provides a single import point for all interceptors across the application.
 * Interceptors handle cross-cutting concerns like logging, transformations, and caching.
 */

// =============================================================================
// LOGGING INTERCEPTORS
// =============================================================================

/**
 * LoggingInterceptor
 * Logs all incoming requests and outgoing responses
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(LoggingInterceptor)
 * @Get('data')
 * async getData() { ... }
 * ```
 *
 * Logs: Request method, URL, response time, status code
 * Applied globally via APP_INTERCEPTOR for comprehensive logging
 */
export { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

// =============================================================================
// RESPONSE TRANSFORMATION INTERCEPTORS
// =============================================================================

/**
 * TransformInterceptor
 * Transforms response data into standardized format
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(TransformInterceptor)
 * @Get('users')
 * async getUsers() { ... }
 * ```
 *
 * Wraps responses in { success: true, data: ... } format
 */
export { TransformInterceptor } from '@common/interceptors/transform.interceptor';

/**
 * ResponseTransformInterceptor
 * Advanced response transformation with metadata
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(ResponseTransformInterceptor)
 * @Get('cases')
 * async getCases() { ... }
 * ```
 *
 * Adds timestamp, correlationId, and other metadata to responses
 */
export { ResponseTransformInterceptor } from '@common/interceptors/response-transform.interceptor';

// =============================================================================
// CACHING INTERCEPTORS
// =============================================================================

/**
 * CacheInterceptor
 * Caches route responses for improved performance
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(CacheInterceptor)
 * @Cache({ ttl: 300 })
 * @Get('static-data')
 * async getStaticData() { ... }
 * ```
 *
 * Requires: @Cache() decorator with TTL configuration
 */
export { CacheInterceptor } from '@common/interceptors/cache.interceptor';

// =============================================================================
// SECURITY INTERCEPTORS
// =============================================================================

/**
 * CorrelationIdInterceptor
 * Adds correlation ID to requests for distributed tracing
 *
 * Usage:
 * Applied globally - no specific decorator needed
 *
 * Generates or extracts correlation ID from X-Correlation-Id header
 * Useful for tracking requests across microservices
 */
export { CorrelationIdInterceptor } from '@common/interceptors/correlation-id.interceptor';

/**
 * RateLimiterInterceptor
 * Rate limiting interceptor for request throttling
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(RateLimiterInterceptor)
 * @RateLimit({ windowMs: 60000, maxRequests: 100 })
 * @Get('data')
 * async getData() { ... }
 * ```
 *
 * Requires: @RateLimit() decorator with configuration
 */
export { RateLimiterInterceptor } from '@common/interceptors/rate-limiter.interceptor';

/**
 * RedisRateLimiterInterceptor
 * Redis-based distributed rate limiting
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(RedisRateLimiterInterceptor)
 * @Get('api-endpoint')
 * async getApiData() { ... }
 * ```
 *
 * Provides consistent rate limiting across multiple instances
 */
export { RedisRateLimiterInterceptor } from '@common/interceptors/redis-rate-limiter.interceptor';

// =============================================================================
// AUDIT & COMPLIANCE INTERCEPTORS
// =============================================================================

/**
 * AuditLogInterceptor
 * Logs all operations for audit trail and compliance
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(AuditLogInterceptor)
 * @AuditLog('USER_UPDATED')
 * @Put('users/:id')
 * async updateUser() { ... }
 * ```
 *
 * Requires: @AuditLog() decorator with action name
 * Logs: User, action, timestamp, request/response data
 */
export { AuditLogInterceptor } from '@common/interceptors/audit-log.interceptor';

// =============================================================================
// UTILITY INTERCEPTORS
// =============================================================================

/**
 * TimeoutInterceptor
 * Enforces timeout on route handlers
 *
 * Usage:
 * ```typescript
 * @UseInterceptors(TimeoutInterceptor)
 * @Get('slow-operation')
 * async slowOperation() { ... }
 * ```
 *
 * Throws TimeoutException if operation exceeds configured timeout
 * Default timeout: 30 seconds
 */
export { TimeoutInterceptor } from '@common/interceptors/timeout.interceptor';

// =============================================================================
// ERROR HANDLING INTERCEPTORS
// =============================================================================

/**
 * Error handling interceptors from errors module
 * These intercept and transform errors for consistent error responses
 */
export * from '@errors/interceptors';

// =============================================================================
// MONITORING INTERCEPTORS
// =============================================================================

/**
 * Performance monitoring interceptors
 * Track response times, resource usage, and application metrics
 */
export * from '@monitoring/interceptors';

/**
 * Performance interceptors for advanced monitoring
 * Detailed performance tracking and optimization
 */
export * from '@performance/interceptors';

// =============================================================================
// INTERCEPTOR USAGE GUIDELINES
// =============================================================================

/**
 * INTERCEPTOR BEST PRACTICES:
 *
 * 1. Execution Order:
 *    Interceptors execute in this order:
 *    - Before request: First → Last (top to bottom)
 *    - After response: Last → First (bottom to top)
 *
 *    Example:
 *    ```typescript
 *    @UseInterceptors(
 *      LoggingInterceptor,      // Logs first, transforms last
 *      CacheInterceptor,         // Checks cache
 *      TransformInterceptor,     // Transforms response
 *    )
 *    ```
 *
 * 2. Global Interceptors:
 *    Apply common interceptors globally in AppModule:
 *    ```typescript
 *    {
 *      provide: APP_INTERCEPTOR,
 *      useClass: LoggingInterceptor,
 *    },
 *    {
 *      provide: APP_INTERCEPTOR,
 *      useClass: CorrelationIdInterceptor,
 *    },
 *    ```
 *
 * 3. Logging:
 *    - Use LoggingInterceptor for request/response logging
 *    - Apply globally for comprehensive audit trail
 *    - Consider performance impact on high-traffic endpoints
 *
 * 4. Caching:
 *    - Use CacheInterceptor for GET requests only
 *    - Set appropriate TTL based on data volatility
 *    - Clear cache on data modifications (POST, PUT, DELETE)
 *    - Use RedisRateLimiterInterceptor for distributed caching
 *
 * 5. Rate Limiting:
 *    - Apply RateLimiterInterceptor to prevent abuse
 *    - Use stricter limits on authentication endpoints
 *    - Consider using RedisRateLimiterInterceptor in production
 *    - Combine with guards for defense in depth
 *
 * 6. Response Transformation:
 *    - Use TransformInterceptor for consistent API responses
 *    - Apply globally or at controller level
 *    - Ensure all responses follow the same structure
 *
 * 7. Audit Logging:
 *    - Use AuditLogInterceptor for compliance requirements
 *    - Log all data modifications (CREATE, UPDATE, DELETE)
 *    - Include user context and timestamp
 *    - Sanitize sensitive data before logging
 *
 * 8. Timeouts:
 *    - Use TimeoutInterceptor for long-running operations
 *    - Set reasonable timeouts based on operation type
 *    - Provide fallback or retry mechanisms
 *    - Handle TimeoutException gracefully
 *
 * 9. Custom Interceptors:
 *    When creating custom interceptors:
 *    - Implement NestInterceptor interface
 *    - Use pipe() and map() operators for response transformation
 *    - Handle errors with catchError() operator
 *    - Keep interceptors focused on single responsibility
 *    - Consider performance implications
 *
 * COMMON PATTERNS:
 *
 * Pattern 1: Standard API endpoint with logging and transformation
 * ```typescript
 * @UseInterceptors(LoggingInterceptor, TransformInterceptor)
 * @Get('users')
 * async getUsers() { ... }
 * ```
 *
 * Pattern 2: Cached endpoint with rate limiting
 * ```typescript
 * @UseInterceptors(CacheInterceptor, RateLimiterInterceptor)
 * @Cache({ ttl: 300 })
 * @RateLimit({ windowMs: 60000, maxRequests: 100 })
 * @Get('public-data')
 * async getPublicData() { ... }
 * ```
 *
 * Pattern 3: Audited operation with timeout
 * ```typescript
 * @UseInterceptors(AuditLogInterceptor, TimeoutInterceptor)
 * @AuditLog('DATA_EXPORT')
 * @Post('export')
 * async exportData() { ... }
 * ```
 *
 * Pattern 4: High-security endpoint
 * ```typescript
 * @UseInterceptors(
 *   LoggingInterceptor,
 *   CorrelationIdInterceptor,
 *   RateLimiterInterceptor,
 *   AuditLogInterceptor,
 * )
 * @Post('sensitive-operation')
 * async sensitiveOperation() { ... }
 * ```
 */
