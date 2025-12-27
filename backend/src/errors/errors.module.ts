import { Module, Global } from '@nestjs/common';
import { CommonModule } from '@common/common.module';

// Services
import { ErrorReportingService } from './services/error.reporting.service';
import { GracefulDegradationService } from './services/graceful.degradation.service';
import { ErrorRecoveryService } from './services/error.recovery.service';

// Interceptors
import { TimeoutRecoveryInterceptor } from './interceptors/timeout.recovery.interceptor';

// Re-export from common module filter
import { EnterpriseExceptionFilter } from '@common/filters/enterprise-exception.filter';

/**
 * Errors Module
 *
 * Provides comprehensive enterprise-grade error handling infrastructure:
 *
 * 1. Error Reporting Service
 *    - Aggregates and categorizes errors
 *    - Integrates with Sentry, Datadog
 *    - Provides error analytics and trends
 *
 * 2. Graceful Degradation Service
 *    - Circuit breaker implementation
 *    - Fallback strategies
 *    - Service health tracking
 *    - Automatic recovery
 *
 * 3. Error Recovery Service
 *    - Automatic retry with exponential backoff
 *    - Dead letter queue for failed operations
 *    - Recovery notifications
 *    - Failed operation tracking
 *
 * 4. Timeout Recovery Interceptor
 *    - Request timeout handling
 *    - Partial response strategies
 *    - Cached response fallback
 *    - Retry suggestions
 *
 * 5. Business Exceptions
 *    - Domain-specific exception classes
 *    - Conflict of interest checks
 *    - Permission violations
 *    - Resource not found errors
 *    - And many more...
 *
 * 6. Error Codes
 *    - Comprehensive error code registry
 *    - HTTP status mappings
 *    - User-friendly messages
 *    - Retryability flags
 *
 * Usage Examples:
 *
 * @example
 * // Using business exceptions
 * throw new ConflictOfInterestException({
 *   caseId: '123',
 *   clientId: '456',
 *   conflictDetails: 'Client is adverse party in another case'
 * });
 *
 * @example
 * // Using graceful degradation
 * const result = await this.degradationService.executeWithDegradation(
 *   'external-api',
 *   () => this.externalApi.call(),
 *   {
 *     enableCircuitBreaker: true,
 *     enableFallback: true,
 *     fallbackStrategy: FallbackStrategy.CACHED_RESPONSE,
 *     cacheKey: 'api-call-123'
 *   }
 * );
 *
 * @example
 * // Using error recovery
 * await this.recoveryService.executeWithRecovery(
 *   'payment-processing',
 *   () => this.paymentService.processPayment(data),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     retryableErrorCodes: ['BILL_PAYMENT_FAILED', 'EXT_SERVICE_TIMEOUT']
 *   }
 * );
 *
 * @example
 * // Using error reporting
 * await this.reportingService.reportError(error, {
 *   errorCode: 'CUSTOM_ERROR',
 *   category: ErrorCategory.BUSINESS_LOGIC,
 *   severity: ErrorSeverity.HIGH,
 *   userContext: {
 *     userId: user.id,
 *     email: user.email,
 *     organizationId: user.organizationId
 *   },
 *   requestContext: {
 *     method: 'POST',
 *     url: '/api/v1/cases',
 *     correlationId: request.correlationId
 *   }
 * });
 */
@Global()
@Module({
  imports: [CommonModule],
  providers: [
    // Error handling services
    ErrorReportingService,
    GracefulDegradationService,
    ErrorRecoveryService,

    // Interceptors
    TimeoutRecoveryInterceptor,

    // Filter (already provided by CommonModule, but listed here for clarity)
    EnterpriseExceptionFilter,
  ],
  exports: [
    // Export services for use in other modules
    ErrorReportingService,
    GracefulDegradationService,
    ErrorRecoveryService,

    // Export interceptors
    TimeoutRecoveryInterceptor,

    // Export filter
    EnterpriseExceptionFilter,
  ],
})
export class ErrorsModule {}
