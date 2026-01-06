import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

// Core Services
import { EncryptionService } from "./services/encryption.service";
import { RequestFingerprintService } from "./services/request.fingerprint.service";
import { SecurityHeadersService } from "./services/security.headers.service";

// Enhanced Services (v0.5.2)
import { CorsSecurityService } from "./services/cors.security.service";
import { CspViolationService } from "./services/csp.violation.service";
import { EnhancedAuditService } from "./services/enhanced.audit.service";
import { InputValidationService } from "./services/input.validation.service";
import { SecurityMonitoringService } from "./services/security.monitoring.service";

// Guards
import { AbacGuard } from "./guards/abac.guard";
import { IpReputationGuard } from "./guards/ip.reputation.guard";

// Middleware
import { SecurityHeadersMiddleware } from "./middleware/security.headers.middleware";

// Controllers
import { CspViolationController } from "./controllers/csp.violation.controller";
import { MalwareSignaturesController } from "./controllers/malware.signatures.controller";

// Services
import { MalwareSignaturesService } from "./services/malware.signatures.service";

// Dependencies
import { RedisCacheManagerService } from "@common/services/redis-cache-manager.service";

/**
 * Enhanced Security Module (v0.5.2)
 * Enterprise-grade security module providing comprehensive OWASP Top 10 protections
 *
 * Core Features:
 * - AES-256-GCM encryption for sensitive data at rest
 * - Comprehensive security headers (CSP, HSTS, etc.)
 * - Request fingerprinting for session hijacking detection
 * - IP reputation tracking and blocking
 * - PBKDF2 key derivation with 100,000 iterations
 * - Automatic security headers middleware
 *
 * Enhanced Features (v0.5.2):
 * - Dynamic CORS validation with origin pattern matching
 * - Advanced input validation (XSS, SQL injection, NoSQL injection, etc.)
 * - Real-time security event monitoring and alerting
 * - Enhanced audit logging for sensitive operations (HIPAA, GDPR, SOC2)
 * - Attribute-Based Access Control (ABAC) with context-aware policies
 * - CSP violation reporting and analysis
 * - Automated threat detection and response
 * - Compliance reporting (HIPAA, GDPR, SOC2, CCPA)
 *
 * OWASP Top 10 Coverage:
 * - A01:2021 – Broken Access Control (ABAC, RBAC, IP reputation)
 * - A02:2021 – Cryptographic Failures (AES-256-GCM, PBKDF2)
 * - A03:2021 – Injection (Input validation, parameterized queries)
 * - A04:2021 – Insecure Design (Security architecture, defense in depth)
 * - A05:2021 – Security Misconfiguration (Secure defaults, CSP, HSTS)
 * - A06:2021 – Vulnerable Components (Regular updates, security scanning)
 * - A07:2021 – Authentication Failures (Session management, brute force protection)
 * - A08:2021 – Data Integrity Failures (HMAC signatures, audit trail)
 * - A09:2021 – Security Logging Failures (Comprehensive audit logging, monitoring)
 * - A10:2021 – SSRF (Input validation, network access controls)
 *
 * All services are exported as global providers for easy injection throughout the application.
 */
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [CspViolationController, MalwareSignaturesController],
  providers: [
    // Core Security Services
    EncryptionService,
    SecurityHeadersService,
    RequestFingerprintService,

    // Enhanced Security Services (v0.5.2)
    CorsSecurityService,
    InputValidationService,
    SecurityMonitoringService,
    EnhancedAuditService,
    CspViolationService,
    MalwareSignaturesService,

    // Guards
    IpReputationGuard,
    AbacGuard,

    // Middleware
    SecurityHeadersMiddleware,

    // Dependencies
    RedisCacheManagerService,
  ],
  exports: [
    // Core Services
    EncryptionService,
    SecurityHeadersService,
    RequestFingerprintService,

    // Enhanced Services
    CorsSecurityService,
    InputValidationService,
    SecurityMonitoringService,
    EnhancedAuditService,
    CspViolationService,
    MalwareSignaturesService,

    // Guards
    IpReputationGuard,
    AbacGuard,

    // Middleware
    SecurityHeadersMiddleware,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security headers middleware to all routes
    consumer.apply(SecurityHeadersMiddleware).forRoutes("*");
  }
}
