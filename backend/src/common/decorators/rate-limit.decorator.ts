import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Rate Limit Decorator
 * Custom rate limiting per endpoint
 * 
 * @example
 * @RateLimit({ points: 10, duration: 60 })
 * @Get('search')
 * async search() { ... }
 */
export interface RateLimitOptions {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  blockDuration?: number; // Block duration if exceeded (seconds)
  keyPrefix?: string; // Custom key prefix
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
