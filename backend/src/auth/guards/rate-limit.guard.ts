import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitConfig {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  blockDuration?: number; // How long to block after limit exceeded
}

const RATE_LIMIT_KEY = 'rateLimit';

// In-memory storage for rate limiting (use Redis in production)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number; blockedUntil?: number }
>();

/**
 * Rate limiting guard to prevent brute force attacks
 * Use @RateLimit decorator to configure per endpoint
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rateLimitConfig = this.reflector.getAllAndOverride<RateLimitConfig>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitConfig) {
      return true; // No rate limiting configured
    }

    const request = context.switchToHttp().getRequest();
    const identifier = this.getIdentifier(request);
    const now = Date.now();

    let record = rateLimitStore.get(identifier);

    // Check if currently blocked
    if (record?.blockedUntil && record.blockedUntil > now) {
      const remainingTime = Math.ceil((record.blockedUntil - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests. Please try again in ${remainingTime} seconds.`,
          retryAfter: remainingTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Initialize or reset record if duration has passed
    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + rateLimitConfig.duration * 1000,
      };
      rateLimitStore.set(identifier, record);
    }

    // Increment request count
    record.count++;

    // Check if limit exceeded
    if (record.count > rateLimitConfig.points) {
      const blockDuration = rateLimitConfig.blockDuration || 900; // Default 15 minutes
      record.blockedUntil = now + blockDuration * 1000;
      rateLimitStore.set(identifier, record);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Rate limit exceeded. Blocked for ${blockDuration} seconds.`,
          retryAfter: blockDuration,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', rateLimitConfig.points);
    response.setHeader('X-RateLimit-Remaining', rateLimitConfig.points - record.count);
    response.setHeader(
      'X-RateLimit-Reset',
      new Date(record.resetTime).toISOString(),
    );

    return true;
  }

  private getIdentifier(request: any): string {
    // Use user ID if authenticated, otherwise use IP address
    const userId = request.user?.id;
    const ip =
      request.ip ||
      request.connection.remoteAddress ||
      request.headers['x-forwarded-for'];
    return userId || ip || 'unknown';
  }
}

// Decorator to configure rate limiting
export const RateLimit = (config: RateLimitConfig) =>
  Reflector.createDecorator<RateLimitConfig>({ key: RATE_LIMIT_KEY })(config);
