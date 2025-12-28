import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  RequestTimeoutException,
  Inject,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError, of } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Timeout Recovery Strategy
 */
export enum TimeoutRecoveryStrategy {
  THROW_ERROR = 'THROW_ERROR',
  PARTIAL_RESPONSE = 'PARTIAL_RESPONSE',
  CACHED_RESPONSE = 'CACHED_RESPONSE',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
}

/**
 * Timeout Metadata
 */
export interface TimeoutMetadata {
  url: string;
  method: string;
  correlationId?: string;
  timeoutMs: number;
  timestamp: string;
}

/**
 * Partial Response
 */
export interface PartialResponse<T = any> {
  success: boolean;
  data: T | null;
  isPartial: boolean;
  timeout: boolean;
  message: string;
  metadata: TimeoutMetadata;
  suggestedRetry?: {
    retryAfter: number;
    maxRetries: number;
    backoffMs: number;
  };
}

/**
 * Injection tokens for TimeoutRecoveryInterceptor
 */
export const TIMEOUT_MS_TOKEN = 'TIMEOUT_MS_TOKEN';
export const RECOVERY_STRATEGY_TOKEN = 'RECOVERY_STRATEGY_TOKEN';

/**
 * Timeout Recovery Interceptor
 * Handles request timeouts gracefully with recovery strategies
 * Provides partial responses, retry suggestions, and client notifications
 */
@Injectable()
export class TimeoutRecoveryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutRecoveryInterceptor.name);
  private readonly responseCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTTL = 300000; // 5 minutes

  constructor(
    @Inject(TIMEOUT_MS_TOKEN) private readonly timeoutMs: number = 30000,
    @Inject(RECOVERY_STRATEGY_TOKEN) private readonly recoveryStrategy: TimeoutRecoveryStrategy = TimeoutRecoveryStrategy.THROW_ERROR,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const metadata = this.buildTimeoutMetadata(request);

    return next.handle().pipe(
      // Apply timeout
      timeout(this.timeoutMs),

      // Cache successful responses
      map((data) => {
        this.cacheResponse(metadata.url, data);
        return data;
      }),

      // Handle timeout errors
      catchError((err) => {
        if (err instanceof TimeoutError) {
          this.logger.warn(
            `Request timeout after ${this.timeoutMs}ms: ${metadata.method} ${metadata.url}`,
            { correlationId: metadata.correlationId },
          );

          return this.handleTimeout(metadata, request);
        }

        // Re-throw non-timeout errors
        return throwError(() => err);
      }),
    );
  }

  /**
   * Handle timeout based on recovery strategy
   */
  private handleTimeout(
    metadata: TimeoutMetadata,
    request: Request,
  ): Observable<any> {
    switch (this.recoveryStrategy) {
      case TimeoutRecoveryStrategy.PARTIAL_RESPONSE:
        return this.createPartialResponse(metadata, request);

      case TimeoutRecoveryStrategy.CACHED_RESPONSE:
        return this.getCachedResponse(metadata);

      case TimeoutRecoveryStrategy.EMPTY_RESPONSE:
        return this.createEmptyResponse(metadata);

      case TimeoutRecoveryStrategy.THROW_ERROR:
      default:
        return this.throwTimeoutError(metadata);
    }
  }

  /**
   * Create a partial response when timeout occurs
   */
  private createPartialResponse(
    metadata: TimeoutMetadata,
    request: Request,
  ): Observable<PartialResponse> {
    const partialData = this.extractPartialData(request);

    const response: PartialResponse = {
      success: false,
      data: partialData,
      isPartial: true,
      timeout: true,
      message: `Request timed out after ${this.timeoutMs}ms. Partial data may be available.`,
      metadata,
      suggestedRetry: {
        retryAfter: 2000, // 2 seconds
        maxRetries: 3,
        backoffMs: 1000,
      },
    };

    this.logger.log(
      `Returning partial response for timed out request: ${metadata.url}`,
      { correlationId: metadata.correlationId },
    );

    return of(response);
  }

  /**
   * Try to get cached response
   */
  private getCachedResponse(metadata: TimeoutMetadata): Observable<PartialResponse> {
    const cached = this.responseCache.get(metadata.url);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.logger.log(
        `Returning cached response for timed out request: ${metadata.url}`,
        {
          cacheAge: Date.now() - cached.timestamp,
          correlationId: metadata.correlationId,
        },
      );

      const response: PartialResponse = {
        success: true,
        data: cached.data,
        isPartial: false,
        timeout: true,
        message: `Request timed out. Returning cached data from ${new Date(cached.timestamp).toISOString()}`,
        metadata,
        suggestedRetry: {
          retryAfter: 5000,
          maxRetries: 2,
          backoffMs: 2000,
        },
      };

      return of(response);
    }

    // No cache available, return empty response
    this.logger.warn(
      `No cache available for timed out request: ${metadata.url}`,
      { correlationId: metadata.correlationId },
    );

    return this.createEmptyResponse(metadata);
  }

  /**
   * Create an empty response
   */
  private createEmptyResponse(metadata: TimeoutMetadata): Observable<PartialResponse> {
    const response: PartialResponse = {
      success: false,
      data: null,
      isPartial: true,
      timeout: true,
      message: `Request timed out after ${this.timeoutMs}ms. No data available.`,
      metadata,
      suggestedRetry: {
        retryAfter: 3000,
        maxRetries: 3,
        backoffMs: 2000,
      },
    };

    this.logger.warn(
      `Returning empty response for timed out request: ${metadata.url}`,
      { correlationId: metadata.correlationId },
    );

    return of(response);
  }

  /**
   * Throw timeout error
   */
  private throwTimeoutError(metadata: TimeoutMetadata): Observable<never> {
    const error = new RequestTimeoutException({
      message: `Request timeout exceeded (${this.timeoutMs}ms)`,
      timeout: this.timeoutMs,
      url: metadata.url,
      method: metadata.method,
      correlationId: metadata.correlationId,
      timestamp: metadata.timestamp,
      suggestedRetry: {
        retryAfter: 2000,
        maxRetries: 3,
        backoffMs: 1000,
      },
    });

    return throwError(() => error);
  }

  /**
   * Build timeout metadata from request
   */
  private buildTimeoutMetadata(request: Request): TimeoutMetadata {
    return {
      url: request.url,
      method: request.method,
      correlationId: (request as any).correlationId,
      timeoutMs: this.timeoutMs,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract partial data from request context
   * In a real implementation, this would check for any partial data
   * that might have been accumulated during processing
   */
  private extractPartialData(request: Request): any {
    // Check if there's any partial data attached to the request context
    const partialData = (request as any).partialData;

    if (partialData) {
      return partialData;
    }

    // Return null if no partial data available
    return null;
  }

  /**
   * Cache response for future use
   */
  private cacheResponse(url: string, data: any): void {
    // Only cache GET requests
    if (!url.toLowerCase().includes('get')) {
      return;
    }

    this.responseCache.set(url, {
      data,
      timestamp: Date.now(),
    });

    // Limit cache size
    if (this.responseCache.size > 100) {
      const firstKey = this.responseCache.keys().next().value;
      if (firstKey) this.responseCache.delete(firstKey);
    }
  }

  /**
   * Clear response cache
   */
  clearCache(url?: string): void {
    if (url) {
      this.responseCache.delete(url);
    } else {
      this.responseCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const entries = Array.from(this.responseCache.values());

    if (entries.length === 0) {
      return { size: 0 };
    }

    const timestamps = entries.map((e) => e.timestamp);

    return {
      size: entries.length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  }
}

/**
 * Create timeout recovery interceptor with custom configuration
 */
export function createTimeoutRecoveryInterceptor(
  timeoutMs: number,
  strategy?: TimeoutRecoveryStrategy,
): TimeoutRecoveryInterceptor {
  return new TimeoutRecoveryInterceptor(timeoutMs, strategy);
}
