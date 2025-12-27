import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: string;
  correlationId: string;
  userId: string;
  statusCode: number;
}

interface EnhancedRequest extends Request {
  correlationId?: string;
  user?: {
    id: string;
  };
}

/**
 * Performance Monitoring Interceptor
 * Tracks slow endpoints and aggregates performance metrics
 * for monitoring and optimization
 */
@Injectable()
export class PerformanceMonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceMonitoringInterceptor.name);
  private readonly slowRequestThreshold = 3000; // 3 seconds
  private readonly metricsBuffer: PerformanceMetrics[] = [];
  private readonly bufferSize = 1000;
  private flushInterval: NodeJS.Timeout;

  constructor() {
    // Flush metrics every 60 seconds
    this.flushInterval = setInterval(() => this.flushMetrics(), 60000);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<EnhancedRequest>();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Record metrics
          this.recordMetrics({
            endpoint: url,
            method,
            duration,
            timestamp: new Date().toISOString(),
            correlationId: request.correlationId || 'N/A',
            userId: request.user?.id || 'anonymous',
            statusCode,
          });

          // Log slow requests
          if (duration > this.slowRequestThreshold) {
            this.logger.warn(
              `SLOW REQUEST DETECTED: ${method} ${url} - ${duration}ms`,
              JSON.stringify({
                method,
                url,
                duration,
                threshold: this.slowRequestThreshold,
                correlationId: request.correlationId,
                userId: request.user?.id,
              })
            );
          }
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 500;

          // Record error metrics
          this.recordMetrics({
            endpoint: url,
            method,
            duration,
            timestamp: new Date().toISOString(),
            correlationId: request.correlationId || 'N/A',
            userId: request.user?.id || 'anonymous',
            statusCode,
          });
        },
      })
    );
  }

  /**
   * Record performance metrics in buffer
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metricsBuffer.push(metrics);

    // Flush if buffer is full
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Flush metrics to logging/monitoring system
   * In production, this would send to Prometheus, DataDog, etc.
   */
  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    // Calculate aggregate metrics
    const aggregate = this.calculateAggregateMetrics(this.metricsBuffer);

    // Log aggregated metrics
    this.logger.log(
      `Performance Metrics (${this.metricsBuffer.length} requests)`,
      JSON.stringify(aggregate)
    );

    // In production, send to monitoring system:
    // await this.metricsService.send(this.metricsBuffer);

    // Clear buffer
    this.metricsBuffer.length = 0;
  }

  /**
   * Calculate aggregate performance metrics
   */
  private calculateAggregateMetrics(metrics: PerformanceMetrics[]): Record<string, any> {
    const durations = metrics.map((m) => m.duration);
    const endpointCounts = metrics.reduce((acc, m) => {
      const key = `${m.method} ${m.endpoint}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCodes = metrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total_requests: metrics.length,
      avg_duration_ms: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      min_duration_ms: Math.min(...durations),
      max_duration_ms: Math.max(...durations),
      p50_duration_ms: this.percentile(durations, 50),
      p95_duration_ms: this.percentile(durations, 95),
      p99_duration_ms: this.percentile(durations, 99),
      slow_requests: durations.filter((d) => d > this.slowRequestThreshold).length,
      top_endpoints: Object.entries(endpointCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count })),
      status_codes: statusCodes,
    };
  }

  /**
   * Calculate percentile from array of numbers
   */
  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushMetrics();
  }
}
