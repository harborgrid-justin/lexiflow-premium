import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  OnModuleDestroy,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RATE_LIMIT_KEY, RateLimitOptions } from '@common/decorators/rate-limit.decorator';

/**
 * Rate Limiter Interceptor
 * Enforces custom rate limits per endpoint using in-memory storage
 * In production, would use Redis for distributed rate limiting
 */
@Injectable()
export class RateLimiterInterceptor implements NestInterceptor, OnModuleDestroy {
  private requestCounts: Map<string, RequestCount[]> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private reflector: Reflector) {
    // Cleanup old entries every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const key = this.getKey(request, rateLimitOptions);

    if (!this.checkRateLimit(key, rateLimitOptions)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          retryAfter: rateLimitOptions.duration,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.recordRequest(key);

    const response = context.switchToHttp().getResponse();
    const remaining = this.getRemainingRequests(key, rateLimitOptions);
    
    response.setHeader('X-RateLimit-Limit', rateLimitOptions.points);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', this.getResetTime(rateLimitOptions.duration));

    return next.handle();
  }

  private getKey(request: any, options: RateLimitOptions): string {
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id || 'anonymous';
    const endpoint = `${request.method}:${request.path}`;
    const prefix = options.keyPrefix || 'rl';

    return `${prefix}:${endpoint}:${userId}:${ip}`;
  }

  private checkRateLimit(key: string, options: RateLimitOptions): boolean {
    const now = Date.now();
    const windowStart = now - options.duration * 1000;

    const counts = this.requestCounts.get(key) || [];
    const recentCounts = counts.filter((c) => c.timestamp > windowStart);

    return recentCounts.length < options.points;
  }

  private recordRequest(key: string): void {
    const counts = this.requestCounts.get(key) || [];
    counts.push({ timestamp: Date.now() });
    this.requestCounts.set(key, counts);
  }

  private getRemainingRequests(key: string, options: RateLimitOptions): number {
    const now = Date.now();
    const windowStart = now - options.duration * 1000;

    const counts = this.requestCounts.get(key) || [];
    const recentCounts = counts.filter((c) => c.timestamp > windowStart);

    return Math.max(0, options.points - recentCounts.length);
  }

  private getResetTime(duration: number): string {
    return new Date(Date.now() + duration * 1000).toISOString();
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    for (const [key, counts] of this.requestCounts.entries()) {
      const recentCounts = counts.filter((c) => now - c.timestamp < maxAge);

      if (recentCounts.length === 0) {
        this.requestCounts.delete(key);
      } else {
        this.requestCounts.set(key, recentCounts);
      }
    }
  }
}

interface RequestCount {
  timestamp: number;
}
