/**
 * Shared Exception Filters
 * Central export point for all exception filters used in LexiFlow Premium
 *
 * This file provides a single import point for all exception filters across the application.
 * Exception filters handle errors and transform them into appropriate HTTP responses.
 */

// =============================================================================
// CORE EXCEPTION FILTERS
// =============================================================================

/**
 * AllExceptionsFilter
 * Catches all unhandled exceptions and formats them consistently
 *
 * Usage:
 * Applied globally via APP_FILTER provider
 *
 * Handles:
 * - HttpException and subclasses
 * - Standard Error objects
 * - Unknown exceptions
 *
 * Response Format:
 * ```json
 * {
 *   "statusCode": 500,
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "path": "/api/endpoint",
 *   "message": "Error message",
 *   "error": "Internal Server Error"
 * }
 * ```
 */
export { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';

/**
 * HttpExceptionFilter
 * Handles HTTP exceptions and formats them for client consumption
 *
 * Usage:
 * ```typescript
 * @UseFilters(HttpExceptionFilter)
 * @Get('data')
 * async getData() { ... }
 * ```
 *
 * Handles:
 * - BadRequestException
 * - UnauthorizedException
 * - ForbiddenException
 * - NotFoundException
 * - ConflictException
 * - InternalServerErrorException
 * - And all other HttpException subclasses
 */
export { HttpExceptionFilter } from '@common/filters/http-exception.filter';

/**
 * EnterpriseExceptionFilter
 * Enterprise-grade exception handling with advanced features
 *
 * Features:
 * - Detailed error logging
 * - Correlation ID tracking
 * - Sanitized error responses (no stack traces in production)
 * - Integration with monitoring systems
 * - Audit trail for errors
 *
 * Usage:
 * Applied globally for comprehensive error handling
 */
export { EnterpriseExceptionFilter } from '@common/filters/enterprise-exception.filter';

// =============================================================================
// EXCEPTION FILTER USAGE GUIDELINES
// =============================================================================

/**
 * EXCEPTION FILTER BEST PRACTICES:
 *
 * 1. Filter Hierarchy:
 *    Exception filters should be organized from most specific to most general:
 *    - Custom domain-specific filters (e.g., PaymentExceptionFilter)
 *    - HttpExceptionFilter (handles HTTP exceptions)
 *    - AllExceptionsFilter (catches everything else)
 *
 * 2. Global Filters:
 *    Apply exception filters globally in AppModule:
 *    ```typescript
 *    {
 *      provide: APP_FILTER,
 *      useClass: AllExceptionsFilter,
 *    },
 *    {
 *      provide: APP_FILTER,
 *      useClass: HttpExceptionFilter,
 *    },
 *    {
 *      provide: APP_FILTER,
 *      useClass: EnterpriseExceptionFilter,
 *    },
 *    ```
 *
 * 3. Error Response Format:
 *    Maintain consistent error response structure:
 *    ```json
 *    {
 *      "success": false,
 *      "statusCode": 400,
 *      "error": {
 *        "code": "VALIDATION_ERROR",
 *        "message": "Validation failed",
 *        "details": {
 *          "field": "email",
 *          "constraint": "Invalid email format"
 *        }
 *      },
 *      "timestamp": "2024-01-01T00:00:00.000Z",
 *      "path": "/api/users",
 *      "correlationId": "550e8400-e29b-41d4-a716-446655440000"
 *    }
 *    ```
 *
 * 4. Security Considerations:
 *    - Never expose sensitive data in error messages
 *    - Sanitize stack traces in production
 *    - Log full error details server-side
 *    - Return generic messages for internal errors
 *    - Avoid exposing database structure or queries
 *
 * 5. Logging:
 *    - Log all exceptions with appropriate severity
 *    - Include context (user, request ID, timestamp)
 *    - Use correlation IDs for distributed tracing
 *    - Integrate with monitoring tools (e.g., Sentry, DataDog)
 *
 * 6. Custom Exception Filters:
 *    When creating custom exception filters:
 *    - Extend ExceptionFilter interface
 *    - Implement catch() method
 *    - Use appropriate HTTP status codes
 *    - Include meaningful error codes for client handling
 *    - Consider i18n for error messages
 *
 * 7. HTTP Status Codes:
 *    Use appropriate status codes:
 *    - 400: Bad Request (validation errors)
 *    - 401: Unauthorized (authentication required)
 *    - 403: Forbidden (insufficient permissions)
 *    - 404: Not Found (resource doesn't exist)
 *    - 409: Conflict (duplicate resource, state conflict)
 *    - 422: Unprocessable Entity (semantic errors)
 *    - 429: Too Many Requests (rate limit exceeded)
 *    - 500: Internal Server Error (unexpected errors)
 *    - 503: Service Unavailable (maintenance, overload)
 *
 * 8. Validation Errors:
 *    Handle class-validator errors specially:
 *    ```typescript
 *    {
 *      "statusCode": 400,
 *      "error": "Validation Error",
 *      "message": "Input validation failed",
 *      "validationErrors": [
 *        {
 *          "field": "email",
 *          "constraints": {
 *            "isEmail": "email must be a valid email"
 *          }
 *        }
 *      ]
 *    }
 *    ```
 *
 * COMMON EXCEPTION TYPES:
 *
 * 1. BadRequestException:
 *    ```typescript
 *    throw new BadRequestException({
 *      code: 'INVALID_INPUT',
 *      message: 'Invalid request parameters',
 *      details: { field: 'email', error: 'Invalid format' }
 *    });
 *    ```
 *
 * 2. UnauthorizedException:
 *    ```typescript
 *    throw new UnauthorizedException({
 *      code: 'INVALID_CREDENTIALS',
 *      message: 'Invalid email or password'
 *    });
 *    ```
 *
 * 3. ForbiddenException:
 *    ```typescript
 *    throw new ForbiddenException({
 *      code: 'INSUFFICIENT_PERMISSIONS',
 *      message: 'You do not have permission to access this resource'
 *    });
 *    ```
 *
 * 4. NotFoundException:
 *    ```typescript
 *    throw new NotFoundException({
 *      code: 'RESOURCE_NOT_FOUND',
 *      message: `Case with ID ${id} not found`
 *    });
 *    ```
 *
 * 5. ConflictException:
 *    ```typescript
 *    throw new ConflictException({
 *      code: 'RESOURCE_ALREADY_EXISTS',
 *      message: 'A case with this number already exists'
 *    });
 *    ```
 *
 * FILTER EXECUTION ORDER:
 *
 * When multiple filters are applied, they execute in this order:
 * 1. Route-level filters (@UseFilters at method level)
 * 2. Controller-level filters (@UseFilters at class level)
 * 3. Global filters (APP_FILTER providers)
 *
 * Example:
 * ```typescript
 * // Global filter (catches all)
 * {
 *   provide: APP_FILTER,
 *   useClass: AllExceptionsFilter,
 * }
 *
 * // Controller-level filter
 * @UseFilters(HttpExceptionFilter)
 * @Controller('users')
 * export class UsersController {
 *
 *   // Route-level filter (most specific)
 *   @UseFilters(ValidationExceptionFilter)
 *   @Post()
 *   async createUser() { ... }
 * }
 * ```
 *
 * ERROR MONITORING INTEGRATION:
 *
 * Integrate with monitoring services:
 * ```typescript
 * catch(exception: unknown, host: ArgumentsHost) {
 *   // Log to monitoring service
 *   this.sentryService.captureException(exception);
 *   this.datadogService.logError(exception);
 *
 *   // Standard error handling
 *   const ctx = host.switchToHttp();
 *   const response = ctx.getResponse();
 *   // ... format and send response
 * }
 * ```
 */
