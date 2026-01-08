/**
 * useAuthAudit Hook
 *
 * React hook for client-side authentication audit logging.
 * Provides a convenient interface for logging and retrieving auth events.
 *
 * @module hooks/useAuthAudit
 */

'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  type AuthEvent,
  type AuthEventMetadata,
  type AuthEventType,
  type AuditLogFilter,
  logAuthEvent,
  getAuthAuditLogs,
  clearAuthAuditLogs,
  getAuthAuditLogCount,
  getLastAuthEvent,
  exportAuthAuditLogs,
  createServerAuditPayload,
  logLogin,
  logLogout,
  logMfaEnabled,
  logMfaDisabled,
  logPasswordChanged,
  logTokenRefresh,
  logSessionExpired,
  logAccessDenied,
} from '@/lib/audit/auth-audit';

// ============================================================================
// Types
// ============================================================================

/**
 * Return type for the useAuthAudit hook.
 */
export interface UseAuthAuditReturn {
  /** All audit logs (reactive - updates when logs change) */
  logs: AuthEvent[];

  /** Total count of audit events */
  count: number;

  /**
   * Log a generic authentication event
   * @param type - Event type
   * @param userId - Optional user ID
   * @param metadata - Optional metadata
   */
  logEvent: (
    type: AuthEventType,
    userId?: string,
    metadata?: AuthEventMetadata
  ) => AuthEvent;

  /**
   * Get filtered audit logs
   * @param filter - Filter criteria
   */
  getLogs: (filter?: AuditLogFilter) => AuthEvent[];

  /**
   * Clear all audit logs
   */
  clearLogs: () => boolean;

  /**
   * Get the most recent event of a specific type
   * @param type - Event type
   * @param userId - Optional user ID filter
   */
  getLastEvent: (type: AuthEventType, userId?: string) => AuthEvent | undefined;

  /**
   * Export logs as JSON or CSV string
   * @param format - Export format
   */
  exportLogs: (format?: 'json' | 'csv') => string;

  /**
   * Create a payload for server-side logging
   */
  createServerPayload: () => ReturnType<typeof createServerAuditPayload>;

  // Event-specific logging helpers
  /** Log a login event */
  logLogin: (userId: string, metadata?: AuthEventMetadata) => AuthEvent;
  /** Log a logout event */
  logLogout: (userId: string, metadata?: AuthEventMetadata) => AuthEvent;
  /** Log MFA enabled event */
  logMfaEnabled: (
    userId: string,
    mfaMethod: string,
    metadata?: AuthEventMetadata
  ) => AuthEvent;
  /** Log MFA disabled event */
  logMfaDisabled: (
    userId: string,
    mfaMethod: string,
    metadata?: AuthEventMetadata
  ) => AuthEvent;
  /** Log password changed event */
  logPasswordChanged: (userId: string, metadata?: AuthEventMetadata) => AuthEvent;
  /** Log token refresh event */
  logTokenRefresh: (userId: string, metadata?: AuthEventMetadata) => AuthEvent;
  /** Log session expired event */
  logSessionExpired: (userId: string, metadata?: AuthEventMetadata) => AuthEvent;
  /** Log access denied event */
  logAccessDenied: (
    userId: string | undefined,
    resource: string,
    reason: string,
    metadata?: AuthEventMetadata
  ) => AuthEvent;
}

/**
 * Options for the useAuthAudit hook.
 */
export interface UseAuthAuditOptions {
  /** Initial filter to apply to logs */
  filter?: AuditLogFilter;
  /** Whether to automatically sync logs with localStorage changes */
  autoSync?: boolean;
}

// ============================================================================
// External Store for Reactive Updates
// ============================================================================

const AUDIT_LOG_KEY = 'auth_audit_log';

/**
 * Creates a subscription to localStorage changes for audit logs.
 * This enables reactive updates when logs are modified.
 */
function subscribeToAuditLogs(callback: () => void): () => void {
  // Listen for storage events (cross-tab synchronization)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === AUDIT_LOG_KEY) {
      callback();
    }
  };

  // Listen for custom events (same-tab updates)
  const handleCustomEvent = () => {
    callback();
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('audit-log-updated', handleCustomEvent);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('audit-log-updated', handleCustomEvent);
  };
}

/**
 * Gets a snapshot of the current audit logs for useSyncExternalStore.
 */
function getAuditLogsSnapshot(): string {
  if (typeof window === 'undefined') {
    return '[]';
  }
  return localStorage.getItem(AUDIT_LOG_KEY) || '[]';
}

/**
 * Server-side snapshot for SSR.
 */
function getServerSnapshot(): string {
  return '[]';
}

/**
 * Dispatches a custom event to notify other hook instances of log changes.
 */
function notifyLogUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('audit-log-updated'));
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * React hook for authentication audit logging.
 *
 * Provides reactive access to audit logs and convenient methods for
 * logging authentication events. Uses useSyncExternalStore for
 * efficient updates across components.
 *
 * @param options - Hook configuration options
 * @returns Object with logs, helpers, and logging functions
 *
 * @example
 * ```tsx
 * function LoginComponent() {
 *   const { logLogin, logs, count } = useAuthAudit();
 *
 *   const handleLogin = async (credentials) => {
 *     try {
 *       const user = await authenticate(credentials);
 *       logLogin(user.id, {
 *         ip: await getClientIP(),
 *         userAgent: navigator.userAgent,
 *       });
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <p>Recent activity: {count} events</p>
 *       <button onClick={() => handleLogin(credentials)}>Login</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function AuditDashboard() {
 *   const { logs, getLogs, exportLogs, clearLogs } = useAuthAudit();
 *
 *   // Get only failed access attempts
 *   const deniedLogs = getLogs({ type: 'access_denied' });
 *
 *   // Export logs for analysis
 *   const handleExport = () => {
 *     const csv = exportLogs('csv');
 *     downloadFile(csv, 'audit-logs.csv');
 *   };
 *
 *   return (
 *     <div>
 *       <h2>Audit Trail ({logs.length} events)</h2>
 *       <button onClick={handleExport}>Export CSV</button>
 *       <button onClick={clearLogs}>Clear Logs</button>
 *       <ul>
 *         {deniedLogs.map(log => (
 *           <li key={log.id}>{log.type} - {log.timestamp}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthAudit(options?: UseAuthAuditOptions): UseAuthAuditReturn {
  const { filter } = options || {};

  // Subscribe to audit log changes for reactive updates
  const logsSnapshot = useSyncExternalStore(
    subscribeToAuditLogs,
    getAuditLogsSnapshot,
    getServerSnapshot
  );

  // Parse logs from snapshot
  const logs = useMemo(() => {
    try {
      const allLogs: AuthEvent[] = JSON.parse(logsSnapshot);
      if (!filter) {
        return allLogs;
      }
      // Apply initial filter if provided
      return getAuthAuditLogs(filter);
    } catch {
      return [];
    }
  }, [logsSnapshot, filter]);

  // Memoized log count
  const count = useMemo(() => logs.length, [logs]);

  // Wrapped logEvent that triggers reactive update
  const logEventWithNotify = useCallback(
    (
      type: AuthEventType,
      userId?: string,
      metadata?: AuthEventMetadata
    ): AuthEvent => {
      const event = logAuthEvent(type, userId, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  // Wrapped clear that triggers reactive update
  const clearLogsWithNotify = useCallback((): boolean => {
    const result = clearAuthAuditLogs();
    if (result) {
      notifyLogUpdate();
    }
    return result;
  }, []);

  // Event-specific helpers with notification
  const logLoginWithNotify = useCallback(
    (userId: string, metadata?: AuthEventMetadata): AuthEvent => {
      const event = logLogin(userId, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  const logLogoutWithNotify = useCallback(
    (userId: string, metadata?: AuthEventMetadata): AuthEvent => {
      const event = logLogout(userId, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  const logMfaEnabledWithNotify = useCallback(
    (
      userId: string,
      mfaMethod: string,
      metadata?: AuthEventMetadata
    ): AuthEvent => {
      const event = logMfaEnabled(userId, mfaMethod, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  const logMfaDisabledWithNotify = useCallback(
    (
      userId: string,
      mfaMethod: string,
      metadata?: AuthEventMetadata
    ): AuthEvent => {
      const event = logMfaDisabled(userId, mfaMethod, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  const logPasswordChangedWithNotify = useCallback(
    (userId: string, metadata?: AuthEventMetadata): AuthEvent => {
      const event = logPasswordChanged(userId, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  const logTokenRefreshWithNotify = useCallback(
    (userId: string, metadata?: AuthEventMetadata): AuthEvent => {
      const event = logTokenRefresh(userId, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  const logSessionExpiredWithNotify = useCallback(
    (userId: string, metadata?: AuthEventMetadata): AuthEvent => {
      const event = logSessionExpired(userId, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  const logAccessDeniedWithNotify = useCallback(
    (
      userId: string | undefined,
      resource: string,
      reason: string,
      metadata?: AuthEventMetadata
    ): AuthEvent => {
      const event = logAccessDenied(userId, resource, reason, metadata);
      notifyLogUpdate();
      return event;
    },
    []
  );

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      logs,
      count,
      logEvent: logEventWithNotify,
      getLogs: getAuthAuditLogs,
      clearLogs: clearLogsWithNotify,
      getLastEvent: getLastAuthEvent,
      exportLogs: (format?: 'json' | 'csv') =>
        exportAuthAuditLogs({ format }),
      createServerPayload: createServerAuditPayload,
      logLogin: logLoginWithNotify,
      logLogout: logLogoutWithNotify,
      logMfaEnabled: logMfaEnabledWithNotify,
      logMfaDisabled: logMfaDisabledWithNotify,
      logPasswordChanged: logPasswordChangedWithNotify,
      logTokenRefresh: logTokenRefreshWithNotify,
      logSessionExpired: logSessionExpiredWithNotify,
      logAccessDenied: logAccessDeniedWithNotify,
    }),
    [
      logs,
      count,
      logEventWithNotify,
      clearLogsWithNotify,
      logLoginWithNotify,
      logLogoutWithNotify,
      logMfaEnabledWithNotify,
      logMfaDisabledWithNotify,
      logPasswordChangedWithNotify,
      logTokenRefreshWithNotify,
      logSessionExpiredWithNotify,
      logAccessDeniedWithNotify,
    ]
  );
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type {
  AuthEvent,
  AuthEventMetadata,
  AuthEventType,
  AuditLogFilter,
  AuditExportOptions,
} from '@/lib/audit/auth-audit';
