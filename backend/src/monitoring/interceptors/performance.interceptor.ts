import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { StructuredLoggerService } from '../services/structured.logger.service';
import { MetricsCollectorService } from '../services/metrics.collector.service';
import { DistributedTracingService } from '../services/distributed.tracing.service';

/**
 * Performance Interceptor
 * Tracks request duration, database queries, memory usage, and slow requests
 * Integrates with metrics, logging, and distributed tracing
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly slowRequestThresholdMs = 3000; // 3 seconds
  private readonly verySlowRequestThresholdMs = 10000; // 10 seconds

  constructor(
    private readonly logger: StructuredLoggerService,
    private readonly metricsCollector: MetricsCollectorService,
    private readonly tracingService: DistributedTracingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Extract request details
    const method = request.method;
    const url = request.url;
    const path = request.route?.path || url;
    const correlationId = (request as any).correlationId;
    const userId = (request as any).user?.id;

    // Set logging context
    this.logger.setContext({
      correlationId,
      userId,
      method,
      url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Start distributed tracing span
    const span = this.tracingService.startHttpRequestSpan(request);

    // Track database queries (if available from request context)
    let dbQueryCount = 0;
    const originalQuery = (request as any).dbQuery;
    if (originalQuery) {
      (request as any).dbQuery = (...args: any[]) => {
        dbQueryCount++;
        return originalQuery(...args);
      };
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        // Record metrics
        this.metricsCollector.recordRequest(method, path, response.statusCode, duration);

        // Record performance metrics
        this.metricsCollector.recordHistogram('request.duration.ms', duration, {
          method,
          path: this.normalizePath(path),
        });

        this.metricsCollector.recordHistogram('request.memory.delta.bytes', memoryDelta, {
          method,
          path: this.normalizePath(path),
        });

        if (dbQueryCount > 0) {
          this.metricsCollector.recordHistogram('request.db.queries.count', dbQueryCount, {
            method,
            path: this.normalizePath(path),
          });
        }

        // Log slow requests
        if (duration > this.verySlowRequestThresholdMs) {
          this.logger.warn('Very slow request detected', {
            method,
            url,
            duration,
            statusCode: response.statusCode,
            memoryDelta,
            dbQueryCount,
            correlationId,
            userId,
          });

          this.metricsCollector.incrementCounter('requests.very_slow.total', 1, {
            method,
            path: this.normalizePath(path),
          });
        } else if (duration > this.slowRequestThresholdMs) {
          this.logger.warn('Slow request detected', {
            method,
            url,
            duration,
            statusCode: response.statusCode,
            memoryDelta,
            dbQueryCount,
            correlationId,
            userId,
          });

          this.metricsCollector.incrementCounter('requests.slow.total', 1, {
            method,
            path: this.normalizePath(path),
          });
        }

        // Log successful request
        this.logger.logResponse(request, response, duration);

        // Add tracing attributes
        span.setAttributes({
          'request.duration_ms': duration,
          'request.memory_delta_bytes': memoryDelta,
          'request.db_query_count': dbQueryCount,
          'http.response.body.size': response.get('content-length') || 0,
        });

        // End tracing span
        this.tracingService.endHttpRequestSpan(span, response);

        return data;
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        // Record error metrics
        const statusCode = error.status || error.statusCode || 500;
        this.metricsCollector.recordRequest(method, path, statusCode, duration);

        this.metricsCollector.incrementCounter('requests.errors.total', 1, {
          method,
          path: this.normalizePath(path),
          status: statusCode.toString(),
          errorType: error.name || 'Error',
        });

        // Log error
        this.logger.error(
          `Request failed: ${method} ${url}`,
          error.stack,
          {
            method,
            url,
            duration,
            statusCode,
            memoryDelta,
            dbQueryCount,
            errorMessage: error.message,
            errorName: error.name,
            correlationId,
            userId,
          }
        );

        // Record exception in trace
        this.tracingService.recordException(error, {
          'request.duration_ms': duration,
          'request.memory_delta_bytes': memoryDelta,
          'request.db_query_count': dbQueryCount,
        });

        // End tracing span with error
        this.tracingService.endHttpRequestSpan(span, { statusCode }, error);

        throw error;
      }),
    );
  }

  /**
   * Normalize URL path for metrics (remove IDs and query params)
   */
  private normalizePath(path: string): string {
    return path
      .split('?')[0] // Remove query params
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id') // UUID
      .replace(/\/\d+/g, '/:id'); // Numeric IDs
  }
}
