import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { createClient, RedisClientType } from 'redis';
import { RATE_LIMIT_KEY, RateLimitOptions } from '@common/decorators/rate-limit.decorator';
import { Logger } from '@nestjs/common';

/**
 * Redis Rate Limiter Interceptor
 * Enterprise-grade distributed rate limiting using Redis
 *
 * Features:
 * - Distributed rate limiting across all instances
 * - Sliding window algorithm for accurate limiting
 * - Automatic fallback to in-memory when Redis unavailable
 * - Configurable block duration
 * - Rate limit headers in response
 *
 * @example
 * @RateLimit({ points: 10, duration: 60 })
 * @Get('search')
 * async search() { ... }
 */
@Injectable()
export class RedisRateLimiterInterceptor
  implements NestInterceptor, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisRateLimiterInterceptor.name);
  private redisClient: RedisClientType | null = null;
  private isRedisConnected = false;

  // In-memory fallback storage
  private requestCounts: Map<string, RequestCount[]> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeRedis();
    this.startCleanupInterval();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    const redisEnabled = this.configService.get('REDIS_ENABLED', 'true') === 'true';

    if (!redisEnabled) {
      this.logger.warn(
        'Redis disabled for rate limiting - using in-memory (NOT RECOMMENDED FOR PRODUCTION)',
      );
      return;
    }

    try {
      const redisUrl = this.configService.get('redis.url');
      const redisHost = this.configService.get('redis.host', 'localhost');
      const redisPort = this.configService.get('redis.port', 6379);
      const redisPassword = this.configService.get('redis.password');
      const redisUsername = this.configService.get('redis.username', 'default');

      this.redisClient = redisUrl
        ? createClient({ url: redisUrl })
        : createClient({
            socket: {
              host: redisHost,
              port: redisPort,
            },
            username: redisUsername,
            password: redisPassword,
          }) as RedisClientType;

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis connection error:', err);
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis rate limiter connected');
        this.isRedisConnected = true;
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis for rate limiting:', error);
      this.redisClient = null;
      this.isRedisConnected = false;
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const key = this.getKey(request, rateLimitOptions);

    return new Observable((observer) => {
      this.checkRateLimit(key, rateLimitOptions)
        .then(({ allowed, remaining, resetTime }) => {
          // Set rate limit headers
          response.setHeader('X-RateLimit-Limit', rateLimitOptions.points);
          response.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
          response.setHeader('X-RateLimit-Reset', resetTime);

          if (!allowed) {
            const retryAfter = Math.ceil(
              (resetTime - Date.now() / 1000) / 1000,
            );
            response.setHeader('Retry-After', retryAfter);

            observer.error(
              new HttpException(
                {
                  statusCode: HttpStatus.TOO_MANY_REQUESTS,
                  message: 'Rate limit exceeded',
                  retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
              ),
            );
            return;
          }

          next.handle().subscribe({
            next: (value) => observer.next(value),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        })
        .catch((error) => {
          this.logger.error('Rate limit check error:', error);
          // On error, allow the request (fail open)
          next.handle().subscribe({
            next: (value) => observer.next(value),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        });
    });
  }

  /**
   * Check rate limit using Redis or fallback to memory
   */
  private async checkRateLimit(
    key: string,
    options: RateLimitOptions,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (this.useRedis()) {
      return this.checkRateLimitRedis(key, options);
    }
    return this.checkRateLimitMemory(key, options);
  }

  /**
   * Redis-based rate limiting with sliding window
   */
  private async checkRateLimitRedis(
    key: string,
    options: RateLimitOptions,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - options.duration * 1000;
    const resetTime = Math.floor((now + options.duration * 1000) / 1000);

    try {
      // Use Redis sorted set for sliding window
      // TODO: Remove non-null assertion with proper check
      const multi = this.redisClient!.multi();

      // Remove old entries
      multi.zRemRangeByScore(key, 0, windowStart);

      // Count current requests in window
      multi.zCard(key);

      // Add current request
      multi.zAdd(key, { score: now, value: `${now}` });

      // Set expiry
      multi.expire(key, options.duration);

      const results = await multi.exec();

      // Count is at index 1 (after zRemRangeByScore)
      const count = (results[1] as number) || 0;
      const allowed = count < options.points;
      const remaining = Math.max(0, options.points - count - 1);

      return { allowed, remaining, resetTime };
    } catch (error) {
      this.logger.error(`Redis rate limit error for ${key}:`, error);
      // Fallback to memory
      return this.checkRateLimitMemory(key, options);
    }
  }

  /**
   * Memory-based rate limiting (fallback)
   */
  private checkRateLimitMemory(
    key: string,
    options: RateLimitOptions,
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - options.duration * 1000;
    const resetTime = Math.floor((now + options.duration * 1000) / 1000);

    const counts = this.requestCounts.get(key) || [];
    const recentCounts = counts.filter((c) => c.timestamp > windowStart);

    const allowed = recentCounts.length < options.points;

    if (allowed) {
      recentCounts.push({ timestamp: now });
      this.requestCounts.set(key, recentCounts);
    }

    const remaining = Math.max(0, options.points - recentCounts.length - 1);

    return { allowed, remaining, resetTime };
  }

  /**
   * Generate rate limit key
   */
  private getKey(request: unknown, options: RateLimitOptions): string {
    const req = request as { ip?: string; connection?: { remoteAddress?: string }; user?: { id?: string }; method?: string; path?: string };
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.id || 'anonymous';
    const endpoint = `${req.method}:${req.path}`;
    const prefix = options.keyPrefix || 'rl';

    return `${prefix}:${endpoint}:${userId}:${ip}`;
  }

  /**
   * Check if Redis should be used
   */
  private useRedis(): boolean {
    return this.isRedisConnected && this.redisClient !== null;
  }

  /**
   * Start cleanup interval for in-memory storage
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  /**
   * Cleanup old entries from in-memory storage
   */
  private cleanup(): void {
    if (this.useRedis()) return; // Redis handles TTL automatically

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

  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redisClient && this.isRedisConnected) {
      try {
        await this.redisClient.quit();
        this.logger.log('Redis rate limiter connection closed');
      } catch (error) {
        this.logger.error('Error closing Redis rate limiter connection:', error);
      }
    }
  }
}

interface RequestCount {
  timestamp: number;
}
