import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './services/encryption.service';
import { SecurityHeadersService } from './services/security.headers.service';
import { RequestFingerprintService } from './services/request.fingerprint.service';
import { IpReputationGuard } from './guards/ip.reputation.guard';
import { SecurityHeadersMiddleware } from './middleware/security.headers.middleware';
import { RedisCacheManagerService } from '@common/services/redis-cache-manager.service';

/**
 * Security Module
 * Enterprise-grade security module providing OWASP Top 10 protections
 *
 * Features:
 * - AES-256-GCM encryption for sensitive data at rest
 * - Comprehensive security headers (CSP, HSTS, etc.)
 * - Request fingerprinting for session hijacking detection
 * - IP reputation tracking and blocking
 * - PBKDF2 key derivation
 * - Automatic security headers middleware
 *
 * All services are exported as global providers for easy injection
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // Core Security Services
    EncryptionService,
    SecurityHeadersService,
    RequestFingerprintService,

    // Guards
    IpReputationGuard,

    // Middleware
    SecurityHeadersMiddleware,

    // Dependencies
    RedisCacheManagerService,
  ],
  exports: [
    // Export all services for global use
    EncryptionService,
    SecurityHeadersService,
    RequestFingerprintService,
    IpReputationGuard,
    SecurityHeadersMiddleware,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security headers middleware to all routes
    consumer
      .apply(SecurityHeadersMiddleware)
      .forRoutes('*');
  }
}
