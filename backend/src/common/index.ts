/**
 * Common Module Exports
 * Centralized export point for all common utilities, decorators, guards, etc.
 */

// ==================== BASE CLASSES ====================
export * from './base/base.entity';
export * from './base/base.repository';

// ==================== DTOs ====================
// Export from dto/index.ts which handles naming conflicts
export * from './dto';

// ==================== DECORATORS ====================
export * from './decorators/api-enhanced.decorator';

// ==================== GUARDS ====================
// Note: Selective export to avoid RequestWithUser conflict with interfaces
export {
  UserPayload,
  ROLES_KEY,
  PERMISSIONS_KEY,
  IP_WHITELIST_KEY,
  RATE_LIMIT_KEY,
  RolesGuard,
  PermissionsGuard,
  IpWhitelistGuard,
} from './guards/enhanced-security.guard';

// ==================== HELPERS ====================
export * from './helpers/response.helper';

// ==================== INTERCEPTORS ====================
export * from './interceptors/performance.interceptor';
export * from './interceptors/request-sanitizer.interceptor';
export * from './interceptors/response-serializer.interceptor';

// ==================== PIPES ====================
export * from './pipes/transform.pipes';

// ==================== TYPES ====================
// Commented out to avoid conflicts with DTO exports
// export * from './types/api.types';

// ==================== VALIDATORS ====================
export * from './validators/custom.validators';

// ==================== ENUMS ====================
export * from './enums';

// ==================== EXCEPTIONS ====================
export * from './exceptions';

// ==================== FILTERS ====================
export * from './filters';

// ==================== INTERFACES ====================
// Note: RequestWithUser is also exported from guards/enhanced-security.guard
// but we prefer the interface definition for explicit re-exports
export * from './interfaces';

// ==================== MIDDLEWARE ====================
export * from './middleware';

// ==================== CONSTANTS ====================
export * from './constants';
