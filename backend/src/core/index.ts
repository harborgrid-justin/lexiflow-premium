/**
 * Core Module Exports
 * Centralized exports for the core coordination infrastructure
 */

// Module
export * from './core.module';

// Core Services
export * from './services/bootstrap.service';
export * from './services/shutdown.service';
export * from './services/configuration.validator.service';

// Global Configuration Services (19 services - provided by GlobalConfigModule)
export * from './services/default-admin-config.service';
export * from './services/feature-flags-config.service';
export * from './services/rate-limit-config.service';
export * from './services/auth-security-config.service';
export * from './services/security-headers-config.service';
export * from './services/cache-config.service';
export * from './services/cors-config.service';
export * from './services/resource-limits-config.service';
export * from './services/circuit-breaker-config.service';
export * from './services/retry-config.service';
export * from './services/database-pool-config.service';
export * from './services/redis-config.service';
export * from './services/jwt-config.service';
export * from './services/file-storage-config.service';
export * from './services/queue-config.service';
export * from './services/websocket-config.service';
export * from './services/pagination-config.service';
export * from './services/validation-config.service';
export * from './services/audit-config.service';

// Interfaces
export * from './interfaces/module.config.interface';

// Constants
export * from './constants/module.order.constant';

// Decorators
export * from './decorators/enterprise.decorator';
