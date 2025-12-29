/**
 * Enhanced Security Module - Enterprise Security Features (v0.5.2)
 * Comprehensive OWASP Top 10 protection for LexiFlow Premium
 */

// Module
export { SecurityModule } from './security.module';

// Core Services
export { EncryptionService } from './services/encryption.service';
export { SecurityHeadersService } from './services/security.headers.service';
export { RequestFingerprintService } from './services/request.fingerprint.service';

// Enhanced Services (v0.5.2)
export { CorsSecurityService } from './services/cors.security.service';
export { InputValidationService } from './services/input.validation.service';
export { SecurityMonitoringService } from './services/security.monitoring.service';
export { EnhancedAuditService } from './services/enhanced.audit.service';
export { CspViolationService } from './services/csp.violation.service';

// Guards
export { IpReputationGuard } from './guards/ip.reputation.guard';
export { AbacGuard, AbacPolicy } from './guards/abac.guard';

// Middleware
export { SecurityHeadersMiddleware } from './middleware/security.headers.middleware';

// Controllers
export { CspViolationController } from './controllers/csp.violation.controller';

// Decorators
export { SkipIpCheck } from './decorators/skip.ip.check.decorator';

// Constants
export * from './constants/security.constants';
export {
  RATE_LIMIT_CONFIG,
  INPUT_VALIDATION_LIMITS,
  CORS_CONFIG,
  CSP_DIRECTIVES,
  ENHANCED_SECURITY_HEADERS,
  SESSION_CONFIG,
  PASSWORD_POLICY,
  ACCOUNT_LOCKOUT_CONFIG,
  AUDIT_CONFIG,
  ENCRYPTION_CONFIG,
  IP_REPUTATION_CONFIG,
  FILE_UPLOAD_SECURITY,
  API_SECURITY_CONFIG,
  ABAC_CONFIG,
  MONITORING_CONFIG,
  COMPLIANCE_FRAMEWORKS,
} from './constants/enhanced.security.constants';

// Types - Core Services
export type {
  FingerprintData,
  FingerprintComponents,
  SessionValidationResult,
} from './services/request.fingerprint.service';

export type {
  IpReputationData,
  IpBlockRecord,
} from './guards/ip.reputation.guard';

// Types - Enhanced Services (v0.5.2)
export type {
  CorsSecurityOptions,
  OriginValidationResult,
} from './services/cors.security.service';

export type {
  ValidationResult,
  ValidationViolation,
  ViolationType,
  ValidationOptions,
  ValidatedValue,
} from './services/input.validation.service';

export type {
  SecurityEvent,
  SecurityAlert,
  SecurityMetrics,
  SecurityEventType,
  SecurityEventSeverity,
  SecurityEventDetails,
} from './services/security.monitoring.service';

export type {
  EnhancedAuditEntry,
  AuditQueryOptions,
  ComplianceReport,
  SensitiveOperationType,
  AuditDataValue,
} from './services/enhanced.audit.service';

export type {
  CspViolationReport,
  CspViolationEntry,
  CspViolationStats,
} from './services/csp.violation.service';

export type {
  AbacPolicy as AbacPolicyType,
  AbacCondition,
  AbacContext,
  AbacAttributeValue,
  AbacAttributes,
} from './guards/abac.guard';
