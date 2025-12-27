import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Request } from 'express';

interface EnhancedRequest extends Request {
  correlationId?: string;
  user?: {
    id: string;
  };
}

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutInterceptor.name);
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 30000) {
    this.timeoutMs = timeoutMs;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<EnhancedRequest>();
    const { method, url } = request;
    const correlationId = request.correlationId || 'N/A';
    const userId = request.user?.id || 'anonymous';

    // Use custom timeout for specific endpoints
    const customTimeout = this.getCustomTimeout(url);
    const effectiveTimeout = customTimeout || this.timeoutMs;

    return next.handle().pipe(
      timeout(effectiveTimeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          // Log timeout with context
          this.logger.error(
            `⏱ REQUEST TIMEOUT: ${method} ${url} exceeded ${effectiveTimeout}ms`,
            JSON.stringify({
              correlationId,
              method,
              url,
              userId,
              timeout: effectiveTimeout,
              type: 'timeout',
              timestamp: new Date().toISOString(),
            })
          );

          return throwError(
            () => new RequestTimeoutException({
              message: `Request exceeded timeout of ${effectiveTimeout}ms`,
              timeout: effectiveTimeout,
              correlationId,
              url,
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Get custom timeout for specific endpoints
   * Long-running operations need higher timeouts
   */
  private getCustomTimeout(url: string): number | null {
    // Document processing: 5 minutes
    if (url.includes('/documents/process') || url.includes('/ocr/')) {
      return 300000;
    }

    // File uploads: 5 minutes
    if (url.includes('/upload')) {
      return 300000;
    }

    // Reports generation: 2 minutes
    if (url.includes('/reports/generate')) {
      return 120000;
    }

    // Bulk operations: 2 minutes
    if (url.includes('/bulk')) {
      return 120000;
    }

    // Analytics queries: 1 minute
    if (url.includes('/analytics')) {
      return 60000;
    }

    // GraphQL: 1 minute
    if (url.includes('/graphql')) {
      return 60000;
    }

    // Default timeout from constructor
    return null;
  }
}
