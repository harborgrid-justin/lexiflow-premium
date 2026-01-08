/**
 * Audit Module
 *
 * Central export for all audit-related functionality.
 *
 * @module lib/audit
 */

export {
  // Types
  type AuthEvent,
  type AuthEventMetadata,
  type AuthEventType,
  type AuditLogFilter,
  type AuditExportOptions,

  // Core functions
  logAuthEvent,
  getAuthAuditLogs,
  clearAuthAuditLogs,
  getAuthAuditLogCount,
  getLastAuthEvent,

  // Server-side export functions
  exportAuthAuditLogs,
  createServerAuditPayload,

  // Event-specific helpers
  logLogin,
  logLogout,
  logMfaEnabled,
  logMfaDisabled,
  logPasswordChanged,
  logTokenRefresh,
  logSessionExpired,
  logAccessDenied,
} from './auth-audit';
