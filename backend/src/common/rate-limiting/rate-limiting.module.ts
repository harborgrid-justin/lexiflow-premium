import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitConfigService } from './services/rate-limit-config.service';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';

/**
 * Rate Limiting Module
 *
 * Provides comprehensive rate limiting for the LexiFlow API
 * Supports different tiers and custom limits per endpoint
 *
 * Rate Limits by Tier:
 * - Free: 100 requests per hour
 * - Standard: 1,000 requests per hour
 * - Professional: 5,000 requests per hour
 * - Enterprise: 10,000 requests per hour
 * - Unlimited: No limit (special accounts)
 *
 * Rate limiting is applied per:
 * - IP address (for anonymous requests)
 * - User ID (for authenticated requests)
 * - API key (for service-to-service)
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),
  ],
  providers: [
    RateLimitConfigService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
  exports: [RateLimitConfigService],
})
export class RateLimitingModule {}
