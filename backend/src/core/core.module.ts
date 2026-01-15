import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

// Core Services
import { BootstrapService } from "./services/bootstrap.service";
import { ConfigurationValidatorService } from "./services/configuration.validator.service";
import { ShutdownService } from "./services/shutdown.service";
// Note: 19 Global Configuration Services are provided by GlobalConfigModule (loaded before CoreModule)

// Core Controllers
import { FeaturesController } from "./controllers/features.controller";

// Import Enterprise Modules (in dependency order)
import { ApiSecurityModule } from "@api-security/api.security.module";
import { AuthModule } from "@auth/auth.module";
import { AuthorizationModule } from "@authorization/authorization.module";
import { CommonModule } from "@common/common.module";
import { ComplianceModule } from "@compliance/compliance.module";
import { ErrorsModule } from "@errors/errors.module";
import { HealthModule } from "@health/health.module";
import { MonitoringModule } from "@monitoring/monitoring.module";
import { PerformanceModule } from "@performance/performance.module";
import { SecurityModule } from "@security/security.module";
import { UsersModule } from "@users/users.module";

/**
 * Core Module
 * Central coordination module that ties together all enterprise infrastructure
 *
 * Responsibilities:
 * - Orchestrate module loading order
 * - Provide global infrastructure services
 * - Coordinate startup and shutdown sequences
 * - Validate system configuration
 * - Ensure proper dependency ordering
 *
 * Features:
 * - Bootstrap service for application startup
 * - Shutdown service for graceful termination
 * - Configuration validation
 * - Enterprise decorators for common patterns
 * - Centralized module coordination
 *
 * This module is marked as @Global() so its providers are available throughout the application
 */
@Global()
@Module({
  imports: [
    // Configuration must be imported first (but is already global in AppModule)
    ConfigModule,

    // TypeORM for database access (already configured in AppModule)
    TypeOrmModule,

    // Phase 1: Core Infrastructure Modules
    // These provide fundamental services needed by everything else
    CommonModule, // Common utilities, guards, interceptors, filters
    SecurityModule, // Encryption, security headers, request fingerprinting
    ErrorsModule, // Error handling and recovery

    // Phase 2: Authentication & User Management
    // Authentication must come before authorization
    AuthModule, // JWT authentication, session management
    UsersModule, // User entities and management

    // Phase 3: Authorization & Compliance
    // These depend on auth being available
    AuthorizationModule, // RBAC, permissions, policies
    ComplianceModule, // Audit logs, conflict checks, ethical walls, GDPR

    // Phase 4: Monitoring & Performance
    // These provide observability for all other modules
    MonitoringModule, // Logging, metrics, alerting, distributed tracing
    HealthModule, // Health checks and indicators
    PerformanceModule, // Caching, query optimization, compression

    // Phase 5: API Security
    // Additional API-level security features
    ApiSecurityModule, // Rate limiting, request validation, webhook security
  ],
  controllers: [FeaturesController],
  providers: [
    // Core coordination services
    BootstrapService,
    ShutdownService,
    ConfigurationValidatorService,
    // Note: DefaultAdminConfigService is provided globally by GlobalConfigModule
  ],
  exports: [
    // Export core services for use in other modules
    BootstrapService,
    ShutdownService,
    ConfigurationValidatorService,
    // Note: DefaultAdminConfigService is exported globally by GlobalConfigModule

    // Re-export all enterprise modules so they're available when CoreModule is imported
    CommonModule,
    SecurityModule,
    ErrorsModule,
    AuthModule,
    UsersModule,
    AuthorizationModule,
    ComplianceModule,
    MonitoringModule,
    HealthModule,
    PerformanceModule,
    ApiSecurityModule,
  ],
})
export class CoreModule {
  /**
   * Module initialization
   * Log when CoreModule is loaded
   */
  constructor() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  CoreModule: Enterprise Infrastructure Loaded");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ✓ Common Module");
    console.log("  ✓ Security Module");
    console.log("  ✓ Errors Module");
    console.log("  ✓ Auth Module");
    console.log("  ✓ Users Module");
    console.log("  ✓ Authorization Module");
    console.log("  ✓ Compliance Module");
    console.log("  ✓ Monitoring Module");
    console.log("  ✓ Health Module");
    console.log("  ✓ Performance Module");
    console.log("  ✓ API Security Module");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Global Config Services (19 via GlobalConfigModule):");
    console.log("  ✓ DefaultAdminConfigService    ✓ FeatureFlagsConfigService");
    console.log("  ✓ RateLimitConfigService       ✓ AuthSecurityConfigService");
    console.log("  ✓ SecurityHeadersConfigService ✓ CacheConfigService");
    console.log(
      "  ✓ CorsConfigService            ✓ ResourceLimitsConfigService"
    );
    console.log("  ✓ CircuitBreakerConfigService  ✓ RetryConfigService");
    console.log("  ✓ DatabasePoolConfigService    ✓ RedisConfigService");
    console.log("  ✓ JwtConfigService             ✓ FileStorageConfigService");
    console.log("  ✓ QueueConfigService           ✓ WebSocketConfigService");
    console.log("  ✓ PaginationConfigService      ✓ ValidationConfigService");
    console.log("  ✓ AuditConfigService");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
}
