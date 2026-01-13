import { DistributedTracingService } from "@monitoring/services/distributed.tracing.service";
import { MetricsCollectorService } from "@monitoring/services/metrics.collector.service";
import {
  HttpRequest,
  HttpResponse,
  StructuredLoggerService,
} from "@monitoring/services/structured.logger.service";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

interface RequestWithQuery extends Request {
  dbQuery?: (...args: unknown[]) => unknown;
}

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
    private readonly tracingService: DistributedTracingService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithQuery>();
    const response = httpContext.getResponse<Response>();

    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Extract request details
    const method = request.method;
    const url = request.url;
    const path = (request as unknown as { route: { path: string } }).route?.path || url;

    interface RequestWithExtras extends Request {
      correlationId?: string;
      user?: {
        id?: string;
        email?: string;
      };
    }

    const extendedRequest = request as RequestWithExtras;
    const correlationId = extendedRequest.correlationId;
    const userId = extendedRequest.user?.id;

    const userAgent = Array.isArray(request.headers["user-agent"])
      ? request.headers["user-agent"][0]
      : request.headers["user-agent"];

    // Set logging context
    this.logger.setContext({
      correlationId,
      userId,
      method,
      url,
      ip: request.ip,
      userAgent,
    });

    // Create HttpRequest object for tracing
    const httpRequest: HttpRequest = {
      method: request.method,
      url: request.url,
      ip: request.ip,
      connection: request.connection,
      headers: request.headers as Record<string, string | string[] | undefined>,
      correlationId: extendedRequest.correlationId,
      user: extendedRequest.user,
      route: request.route,
    };

    // Start distributed tracing span
    const span = this.tracingService.startHttpRequestSpan(httpRequest);

    // Track database queries (if available from request context)
    let dbQueryCount = 0;
    const requestWithQuery = request as RequestWithQuery;
    const originalQuery = requestWithQuery.dbQuery;
    if (originalQuery) {
      requestWithQuery.dbQuery = (...args: unknown[]): unknown => {
        dbQueryCount++;
        return originalQuery(...args) as unknown;
      };
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        // Create HttpResponse object
        const httpResponse: HttpResponse = {
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          get: (name: string) => response.get(name),
        };

        // Record metrics
        this.metricsCollector.recordRequest(
          method,
          path,
          response.statusCode,
          duration
        );

        // Record performance metrics
        this.metricsCollector.recordHistogram("request.duration.ms", duration, {
          method,
          path: this.normalizePath(path),
        });

        this.metricsCollector.recordHistogram(
          "request.memory.delta.bytes",
          memoryDelta,
          {
            method,
            path: this.normalizePath(path),
          }
        );

        if (dbQueryCount > 0) {
          this.metricsCollector.recordHistogram(
            "request.db.queries.count",
            dbQueryCount,
            {
              method,
              path: this.normalizePath(path),
            }
          );
        }

        // Log slow requests
        if (duration > this.verySlowRequestThresholdMs) {
          this.logger.warn("Very slow request detected", {
            method,
            url,
            duration,
            statusCode: response.statusCode,
            memoryDelta,
            dbQueryCount,
            correlationId,
            userId,
          });

          this.metricsCollector.incrementCounter(
            "requests.very_slow.total",
            1,
            {
              method,
              path: this.normalizePath(path),
            }
          );
        } else if (duration > this.slowRequestThresholdMs) {
          this.logger.warn("Slow request detected", {
            method,
            url,
            duration,
            statusCode: response.statusCode,
            memoryDelta,
            dbQueryCount,
            correlationId,
            userId,
          });

          this.metricsCollector.incrementCounter("requests.slow.total", 1, {
            method,
            path: this.normalizePath(path),
          });
        }

        // Log successful request
        this.logger.logResponse(httpRequest, httpResponse, duration);

        // Add tracing attributes
        span.setAttributes({
          "request.duration_ms": duration,
          "request.memory_delta_bytes": memoryDelta,
          "request.db_query_count": dbQueryCount,
          "http.response.body.size":
            Number(response.get("content-length")) || 0,
        });

        // End tracing span
        this.tracingService.endHttpRequestSpan(span, httpResponse);

        return data;
      }),
      catchError((error: Error & { status?: number; statusCode?: number }) => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        // Record error metrics
        const statusCode = error.status || error.statusCode || 500;
        this.metricsCollector.recordRequest(method, path, statusCode, duration);

        this.metricsCollector.incrementCounter("requests.errors.total", 1, {
          method,
          path: this.normalizePath(path),
          status: statusCode.toString(),
          errorType: error.name || "Error",
        });

        // Log error
        this.logger.error(
          `Request failed: ${method} ${url}`,
          error.stack || error.message,
          {
            method,
            url,
            duration: duration,
            statusCode: statusCode,
            memoryDelta: String(memoryDelta),
            dbQueryCount: String(dbQueryCount),
            errorMessage: error.message,
            errorName: error.name,
            correlationId,
            userId,
          }
        );

        // Record exception in trace
        this.tracingService.recordException(error, {
          "request.duration_ms": duration,
          "request.memory_delta_bytes": memoryDelta,
          "request.db_query_count": dbQueryCount,
        });

        // End tracing span with error
        const errorResponse: HttpResponse = { statusCode };
        this.tracingService.endHttpRequestSpan(span, errorResponse, error);

        throw error;
      })
    );
  }

  /**
   * Normalize URL path for metrics (remove IDs and query params)
   */
  private normalizePath(path: string): string {
    const safePath = path || "";
    const pathWithoutQuery = safePath.split("?")[0];
    return (pathWithoutQuery || "")
      .replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        "/:id"
      ) // UUID
      .replace(/\/\d+/g, "/:id"); // Numeric IDs
  }
}
