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

/**
 * Request with correlation ID
 */
interface RequestWithCorrelation extends Request {
  correlationId?: string;
}

/**
 * Performance Monitoring Interceptor
 * Tracks and logs request performance metrics
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly performanceThreshold = 1000; // 1 second warning threshold

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithCorrelation>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || 'unknown';
    const correlationId = request.correlationId || 'N/A';

    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logPerformance(
            method,
            url,
            startTime,
            startMemory,
            correlationId,
            ip || 'unknown',
            userAgent,
            'success',
          );
        },
        error: (error: Error) => {
          this.logPerformance(
            method,
            url,
            startTime,
            startMemory,
            correlationId,
            ip || 'unknown',
            userAgent,
            'error',
            error,
          );
        },
      }),
    );
  }

  /**
   * Log performance metrics
   */
  private logPerformance(
    method: string,
    url: string,
    startTime: number,
    startMemory: NodeJS.MemoryUsage,
    correlationId: string,
    ip: string,
    userAgent: string,
    status: 'success' | 'error',
    error?: Error,
  ): void {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();

    const memoryDelta = {
      heapUsed: this.formatBytes(endMemory.heapUsed - startMemory.heapUsed),
      heapTotal: this.formatBytes(endMemory.heapTotal - startMemory.heapTotal),
      rss: this.formatBytes(endMemory.rss - startMemory.rss),
    };

    const metrics = {
      method,
      url,
      duration: `${duration}ms`,
      status,
      correlationId,
      ip,
      userAgent: this.truncateUserAgent(userAgent),
      memory: memoryDelta,
    };

    // Log warning if request took too long
    if (duration > this.performanceThreshold) {
      this.logger.warn(
        `Slow request detected: ${method} ${url} took ${duration}ms`,
        JSON.stringify(metrics),
      );
    } else {
      this.logger.debug(`Request completed: ${method} ${url}`, JSON.stringify(metrics));
    }

    // Log error details if request failed
    if (error) {
      this.logger.error(
        `Request failed: ${method} ${url}`,
        error.stack,
        JSON.stringify(metrics),
      );
    }
  }

  /**
   * Format bytes to human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

    const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${bytes < 0 ? '-' : ''}${formatted} ${sizes[i]}`;
  }

  /**
   * Truncate user agent for cleaner logs
   */
  private truncateUserAgent(userAgent: string): string {
    if (userAgent.length > 100) {
      return userAgent.substring(0, 97) + '...';
    }
    return userAgent;
  }
}
