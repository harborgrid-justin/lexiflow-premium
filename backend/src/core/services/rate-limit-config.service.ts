import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * RateLimitConfigService
 *
 * Provides globally injectable access to rate limiting configuration.
 * Consolidates global, per-endpoint, and role-based rate limits.
 */
@Injectable()
export class RateLimitConfigService {
  // Global Rate Limits
  get globalTtl(): number {
    return MasterConfig.RATE_LIMIT_TTL;
  }

  get globalLimit(): number {
    return MasterConfig.RATE_LIMIT_LIMIT;
  }

  get skipSuccessfulRequests(): boolean {
    return MasterConfig.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS;
  }

  get skipFailedRequests(): boolean {
    return MasterConfig.RATE_LIMIT_SKIP_FAILED_REQUESTS;
  }

  // Per-Endpoint Rate Limits
  get authTtl(): number {
    return MasterConfig.RATE_LIMIT_AUTH_TTL;
  }

  get authLimit(): number {
    return MasterConfig.RATE_LIMIT_AUTH_LIMIT;
  }

  get apiTtl(): number {
    return MasterConfig.RATE_LIMIT_API_TTL;
  }

  get apiLimit(): number {
    return MasterConfig.RATE_LIMIT_API_LIMIT;
  }

  get uploadTtl(): number {
    return MasterConfig.RATE_LIMIT_UPLOAD_TTL;
  }

  get uploadLimit(): number {
    return MasterConfig.RATE_LIMIT_UPLOAD_LIMIT;
  }

  // IP Blocking
  get blockDurationMs(): number {
    return MasterConfig.RATE_LIMIT_BLOCK_DURATION_MS;
  }

  get blockThreshold(): number {
    return MasterConfig.RATE_LIMIT_BLOCK_THRESHOLD;
  }

  // API Key Rate Limits
  get apiKeyDefaultRateLimit(): number {
    return MasterConfig.API_KEY_DEFAULT_RATE_LIMIT;
  }

  // Role-based limits (enterprise pattern)
  getRoleLimits(role: string): { requestsPerMinute: number; burstLimit: number } {
    const roleLimits: Record<string, { requestsPerMinute: number; burstLimit: number }> = {
      super_admin: { requestsPerMinute: 1000, burstLimit: 100 },
      admin: { requestsPerMinute: 500, burstLimit: 50 },
      enterprise: { requestsPerMinute: 300, burstLimit: 30 },
      professional: { requestsPerMinute: 100, burstLimit: 20 },
      basic: { requestsPerMinute: 60, burstLimit: 10 },
      guest: { requestsPerMinute: 20, burstLimit: 5 },
    };
    return roleLimits[role] ?? { requestsPerMinute: 20, burstLimit: 5 };
  }

  // Endpoint-specific limits
  getEndpointLimit(endpoint: string): { ttl: number; limit: number } {
    const endpointLimits: Record<string, { ttl: number; limit: number }> = {
      '/auth/login': { ttl: this.authTtl, limit: this.authLimit },
      '/auth/register': { ttl: this.authTtl, limit: 5 },
      '/auth/forgot-password': { ttl: 300, limit: 3 },
      '/api/upload': { ttl: this.uploadTtl, limit: this.uploadLimit },
      '/api/export': { ttl: 60, limit: 5 },
      '/api/bulk': { ttl: 60, limit: 10 },
    };
    return endpointLimits[endpoint] || { ttl: this.globalTtl, limit: this.globalLimit };
  }

  /**
   * Get summary for logging
   */
  getSummary(): Record<string, unknown> {
    return {
      global: { ttl: this.globalTtl, limit: this.globalLimit },
      auth: { ttl: this.authTtl, limit: this.authLimit },
      api: { ttl: this.apiTtl, limit: this.apiLimit },
      upload: { ttl: this.uploadTtl, limit: this.uploadLimit },
      blocking: { duration: this.blockDurationMs, threshold: this.blockThreshold },
    };
  }
}
