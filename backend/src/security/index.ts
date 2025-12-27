/**
 * Security Module - Enterprise Security Features
 * Comprehensive OWASP Top 10 protection for LexiFlow Premium
 */

// Module
export { SecurityModule } from './security.module';

// Services
export { EncryptionService } from './services/encryption.service';
export { SecurityHeadersService } from './services/security.headers.service';
export { RequestFingerprintService } from './services/request.fingerprint.service';

// Guards
export { IpReputationGuard } from './guards/ip.reputation.guard';

// Middleware
export { SecurityHeadersMiddleware } from './middleware/security.headers.middleware';

// Decorators
export { SkipIpCheck } from './decorators/skip.ip.check.decorator';

// Constants
export * from './constants/security.constants';

// Types
export type {
  FingerprintData,
  FingerprintComponents,
  SessionValidationResult,
} from './services/request.fingerprint.service';

export type {
  IpReputationData,
  IpBlockRecord,
} from './guards/ip.reputation.guard';
