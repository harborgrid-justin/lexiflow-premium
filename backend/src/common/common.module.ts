import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Existing filters, interceptors, pipes
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';

// Enterprise filters and interceptors
import { EnterpriseExceptionFilter } from './filters/enterprise-exception.filter';
import { CorrelationIdInterceptor } from './interceptors/correlation-id.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { RateLimiterInterceptor } from './interceptors/rate-limiter.interceptor';

// Enterprise services
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { RetryService } from './services/retry.service';
import { PaginationService } from './services/pagination.service';
import { TransactionManagerService } from './services/transaction-manager.service';
import { BulkOperationsService } from './services/bulk-operations.service';
import { CacheManagerService } from './services/cache-manager.service';
import { AuditLogService } from './services/audit-log.service';
import { QueueManagerService } from './services/queue-manager.service';
import { FileUploadService } from './services/file-upload.service';
import { MetricsService } from './services/metrics.service';
import { CalendarIntegrationService } from './services/calendar-integration.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [
    // Existing
    HttpExceptionFilter,
    AllExceptionsFilter,
    TransformInterceptor,
    LoggingInterceptor,
    ValidationPipe,

    // Enterprise filters and interceptors
    EnterpriseExceptionFilter,
    CorrelationIdInterceptor,
    ResponseTransformInterceptor,
    RateLimiterInterceptor,

    // Enterprise services
    CircuitBreakerService,
    RetryService,
    PaginationService,
    TransactionManagerService,
    BulkOperationsService,
    CacheManagerService,
    AuditLogService,
    QueueManagerService,
    FileUploadService,
    MetricsService,
    CalendarIntegrationService,
  ],
  exports: [
    // Existing
    HttpExceptionFilter,
    AllExceptionsFilter,
    TransformInterceptor,
    LoggingInterceptor,
    ValidationPipe,

    // Enterprise filters and interceptors
    EnterpriseExceptionFilter,
    CorrelationIdInterceptor,
    ResponseTransformInterceptor,
    RateLimiterInterceptor,

    // Enterprise services
    CircuitBreakerService,
    RetryService,
    PaginationService,
    TransactionManagerService,
    BulkOperationsService,
    CacheManagerService,
    AuditLogService,
    QueueManagerService,
    FileUploadService,
    MetricsService,
    CalendarIntegrationService,
  ],
})
export class CommonModule {}
