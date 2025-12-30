import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Global Configuration Services
import { DefaultAdminConfigService } from '../core/services/default-admin-config.service';
import { FeatureFlagsConfigService } from '../core/services/feature-flags-config.service';
import { RateLimitConfigService } from '../core/services/rate-limit-config.service';
import { AuthSecurityConfigService } from '../core/services/auth-security-config.service';
import { SecurityHeadersConfigService } from '../core/services/security-headers-config.service';
import { CacheConfigService } from '../core/services/cache-config.service';
import { CorsConfigService } from '../core/services/cors-config.service';
import { ResourceLimitsConfigService } from '../core/services/resource-limits-config.service';
import { CircuitBreakerConfigService } from '../core/services/circuit-breaker-config.service';
import { RetryConfigService } from '../core/services/retry-config.service';
import { DatabasePoolConfigService } from '../core/services/database-pool-config.service';
import { RedisConfigService } from '../core/services/redis-config.service';
import { JwtConfigService } from '../core/services/jwt-config.service';
import { FileStorageConfigService } from '../core/services/file-storage-config.service';
import { QueueConfigService } from '../core/services/queue-config.service';
import { WebSocketConfigService } from '../core/services/websocket-config.service';
import { PaginationConfigService } from '../core/services/pagination-config.service';
import { ValidationConfigService } from '../core/services/validation-config.service';
import { AuditConfigService } from '../core/services/audit-config.service';

/**
 * GlobalConfigModule
 *
 * Provides 19 globally injectable configuration services that are available
 * across ALL modules in the application, including those loaded by CoreModule.
 *
 * This module is loaded BEFORE CoreModule in AppModule to ensure configuration
 * services are available during the initialization of all enterprise modules.
 *
 * Load Order in AppModule:
 * 1. ConfigModule.forRoot() - NestJS configuration
 * 2. GlobalConfigModule - Custom config services (THIS MODULE)
 * 3. TypeOrmModule - Database
 * 4. CoreModule - Enterprise infrastructure
 * 5. APP_IMPORTS - 40+ feature modules
 *
 * Services Provided (19 total):
 * - DefaultAdminConfigService: Default admin user/profile configuration
 * - FeatureFlagsConfigService: Feature toggle management
 * - RateLimitConfigService: Rate limiting configuration
 * - AuthSecurityConfigService: Password, brute force, session, MFA settings
 * - SecurityHeadersConfigService: CSP, HSTS, security headers
 * - CacheConfigService: Cache TTL, memory limits, tiers
 * - CorsConfigService: CORS origins, methods, headers
 * - ResourceLimitsConfigService: WebSocket, file, OCR, queue limits
 * - CircuitBreakerConfigService: Failure thresholds, timeouts
 * - RetryConfigService: Retry attempts, delays, backoff
 * - DatabasePoolConfigService: Pool size, timeouts, eviction
 * - RedisConfigService: Connection, TTL, key prefixes
 * - JwtConfigService: Token expiry, algorithms
 * - FileStorageConfigService: Max size, MIME types, security
 * - QueueConfigService: Job timeout, retries, concurrency
 * - WebSocketConfigService: Connections, rooms, ping
 * - PaginationConfigService: Page sizes, limits
 * - ValidationConfigService: Whitelist, transform options
 * - AuditConfigService: Retention, logging, cleanup
 *
 * Usage in any module:
 * @Injectable()
 * export class AnyService {
 *   constructor(
 *     private featureFlags: FeatureFlagsConfigService,
 *     private rateLimit: RateLimitConfigService,
 *   ) {}
 * }
 */
@Global()
@Module({
  imports: [
    // Ensure ConfigModule is available for ConfigService injection
    ConfigModule,
  ],
  providers: [
    // Admin & Core
    DefaultAdminConfigService,
    FeatureFlagsConfigService,

    // Security
    RateLimitConfigService,
    AuthSecurityConfigService,
    SecurityHeadersConfigService,
    CorsConfigService,

    // Performance & Caching
    CacheConfigService,
    CircuitBreakerConfigService,
    RetryConfigService,

    // Infrastructure
    ResourceLimitsConfigService,
    DatabasePoolConfigService,
    RedisConfigService,
    JwtConfigService,

    // Features
    FileStorageConfigService,
    QueueConfigService,
    WebSocketConfigService,

    // Common
    PaginationConfigService,
    ValidationConfigService,
    AuditConfigService,
  ],
  exports: [
    // Admin & Core
    DefaultAdminConfigService,
    FeatureFlagsConfigService,

    // Security
    RateLimitConfigService,
    AuthSecurityConfigService,
    SecurityHeadersConfigService,
    CorsConfigService,

    // Performance & Caching
    CacheConfigService,
    CircuitBreakerConfigService,
    RetryConfigService,

    // Infrastructure
    ResourceLimitsConfigService,
    DatabasePoolConfigService,
    RedisConfigService,
    JwtConfigService,

    // Features
    FileStorageConfigService,
    QueueConfigService,
    WebSocketConfigService,

    // Common
    PaginationConfigService,
    ValidationConfigService,
    AuditConfigService,
  ],
})
export class GlobalConfigModule {}
