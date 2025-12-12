import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  blockDuration?: number; // How long to block after limit exceeded (default: 900s)
}

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Decorator to configure rate limiting on endpoints
 * @param options Rate limit configuration
 * @example
 * @RateLimit({ points: 5, duration: 60, blockDuration: 300 })
 * async login() { }
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
