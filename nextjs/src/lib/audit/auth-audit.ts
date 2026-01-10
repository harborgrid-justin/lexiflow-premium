/**
 * Authentication Audit Logging Infrastructure
 *
 * Provides comprehensive audit logging for authentication events.
 * Supports both client-side (localStorage) and server-side logging.
 *
 * @module lib/audit/auth-audit
 */

// ============================================================================
// Constants
// ============================================================================

/** localStorage key for storing audit events */
const AUDIT_LOG_KEY = "auth_audit_log";

/** Maximum number of events to retain in localStorage */
const MAX_EVENTS = 100;

// ============================================================================
// Types
// ============================================================================

/**
 * Authentication event types for audit logging.
 * Each type represents a distinct authentication-related action.
 */
export type AuthEventType =
  | "login"
  | "logout"
  | "mfa_enabled"
  | "mfa_disabled"
  | "password_changed"
  | "token_refresh"
  | "session_expired"
  | "access_denied";

/**
 * Metadata associated with an authentication event.
 * Provides additional context about the event.
 */
export interface AuthEventMetadata {
  /** IP address from which the event originated */
  ip?: string;
  /** User agent string of the client */
  userAgent?: string;
  /** Geographic location (if available) */
  location?: string;
  /** Device information */
  device?: string;
  /** Reason for the event (e.g., for access_denied) */
  reason?: string;
  /** Resource being accessed (for access_denied events) */
  resource?: string;
  /** MFA method used (for mfa_enabled/disabled) */
  mfaMethod?: string;
  /** Session ID associated with the event */
  sessionId?: string;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Authentication event for audit logging.
 * Represents a single auditable authentication action.
 */
export interface AuthEvent {
  /** Unique identifier for the event */
  id: string;
  /** Type of authentication event */
  type: AuthEventType;
  /** ISO 8601 timestamp when the event occurred */
  timestamp: string;
  /** User ID associated with the event (may be undefined for failed logins) */
  userId?: string;
  /** Additional metadata about the event */
  metadata?: AuthEventMetadata;
}

/**
 * Options for filtering audit logs during retrieval.
 */
export interface AuditLogFilter {
  /** Filter by specific event type(s) */
  type?: AuthEventType | AuthEventType[];
  /** Filter by user ID */
  userId?: string;
  /** Filter events after this timestamp */
  after?: Date | string;
  /** Filter events before this timestamp */
  before?: Date | string;
  /** Maximum number of events to return */
  limit?: number;
}

/**
 * Options for server-side export of audit events.
 */
export interface AuditExportOptions {
  /** Format for export (json or csv) */
  format?: "json" | "csv";
  /** Include metadata in export */
  includeMetadata?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a unique identifier for audit events.
 * Uses a combination of timestamp and random values for uniqueness.
 *
 * @returns A unique string identifier
 */
function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `ae_${timestamp}_${randomPart}`;
}

/**
 * Checks if code is running in a browser environment.
 *
 * @returns true if running in browser, false otherwise
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/**
 * Safely parses JSON with error handling.
 *
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed value or fallback
 */
function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Logs an authentication event to local storage.
 *
 * This function stores authentication events in localStorage for client-side
 * audit trails. Events are automatically pruned to maintain the last 100 entries.
 *
 * @param type - The type of authentication event
 * @param userId - Optional user ID associated with the event
 * @param metadata - Optional additional context about the event
 * @returns The created AuthEvent object
 *
 * @example
 * ```typescript
 * // Log a successful login
 * logAuthEvent('login', 'user-123', {
 *   ip: '192.168.1.1',
 *   userAgent: navigator.userAgent,
 * });
 *
 * // Log an access denied event
 * logAuthEvent('access_denied', 'user-123', {
 *   resource: '/admin/settings',
 *   reason: 'Insufficient permissions',
 * });
 * ```
 */
export function logAuthEvent(
  type: AuthEventType,
  userId?: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  const event: AuthEvent = {
    id: generateEventId(),
    type,
    timestamp: new Date().toISOString(),
    userId,
    metadata,
  };

  // Only persist to localStorage in browser environment
  if (isBrowser()) {
    try {
      const existingLogs = localStorage.getItem(AUDIT_LOG_KEY);
      const logs: AuthEvent[] = safeJsonParse(existingLogs || "[]", []);

      logs.push(event);

      // Maintain maximum event limit by removing oldest events
      while (logs.length > MAX_EVENTS) {
        logs.shift();
      }

      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));

      // Log to console in development mode for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("[Auth Audit]", event);
      }
    } catch (error: unknown) {
      console.error("[Auth Audit] Failed to log event:", error);
    }
  }

  return event;
}

/**
 * Retrieves authentication audit logs from local storage.
 *
 * Supports filtering by event type, user ID, and time range.
 *
 * @param filter - Optional filter criteria for the logs
 * @returns Array of AuthEvent objects matching the filter criteria
 *
 * @example
 * ```typescript
 * // Get all audit logs
 * const allLogs = getAuthAuditLogs();
 *
 * // Get only login events
 * const loginLogs = getAuthAuditLogs({ type: 'login' });
 *
 * // Get events for a specific user in the last hour
 * const userLogs = getAuthAuditLogs({
 *   userId: 'user-123',
 *   after: new Date(Date.now() - 3600000),
 * });
 * ```
 */
export function getAuthAuditLogs(filter?: AuditLogFilter): AuthEvent[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const existingLogs = localStorage.getItem(AUDIT_LOG_KEY);
    let logs: AuthEvent[] = safeJsonParse(existingLogs || "[]", []);

    if (filter) {
      // Filter by event type
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        logs = logs.filter((event) => types.includes(event.type));
      }

      // Filter by user ID
      if (filter.userId) {
        logs = logs.filter((event) => event.userId === filter.userId);
      }

      // Filter by time range (after)
      if (filter.after) {
        const afterTimestamp =
          typeof filter.after === "string"
            ? new Date(filter.after).getTime()
            : filter.after.getTime();
        logs = logs.filter(
          (event) => new Date(event.timestamp).getTime() >= afterTimestamp
        );
      }

      // Filter by time range (before)
      if (filter.before) {
        const beforeTimestamp =
          typeof filter.before === "string"
            ? new Date(filter.before).getTime()
            : filter.before.getTime();
        logs = logs.filter(
          (event) => new Date(event.timestamp).getTime() <= beforeTimestamp
        );
      }

      // Apply limit
      if (filter.limit && filter.limit > 0) {
        logs = logs.slice(-filter.limit);
      }
    }

    return logs;
  } catch (error: unknown) {
    console.error("[Auth Audit] Failed to retrieve logs:", error);
    return [];
  }
}

/**
 * Clears all authentication audit logs from local storage.
 *
 * Use with caution - this permanently removes all audit history.
 *
 * @returns true if cleared successfully, false otherwise
 */
export function clearAuthAuditLogs(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    localStorage.removeItem(AUDIT_LOG_KEY);
    return true;
  } catch (error: unknown) {
    console.error("[Auth Audit] Failed to clear logs:", error);
    return false;
  }
}

/**
 * Gets the count of audit events matching the filter criteria.
 *
 * @param filter - Optional filter criteria
 * @returns Number of events matching the criteria
 */
export function getAuthAuditLogCount(filter?: AuditLogFilter): number {
  return getAuthAuditLogs(filter).length;
}

/**
 * Gets the most recent audit event of a specific type.
 *
 * @param type - Event type to search for
 * @param userId - Optional user ID to filter by
 * @returns The most recent matching event, or undefined if none found
 */
export function getLastAuthEvent(
  type: AuthEventType,
  userId?: string
): AuthEvent | undefined {
  const logs = getAuthAuditLogs({ type, userId });
  return logs.length > 0 ? logs[logs.length - 1] : undefined;
}

// ============================================================================
// Server-Side Export Functions
// ============================================================================

/**
 * Exports audit logs for server-side processing.
 *
 * This function prepares audit logs in a format suitable for sending
 * to a server-side logging service or external audit system.
 *
 * @param options - Export options
 * @returns Formatted string (JSON or CSV) or array of events
 *
 * @example
 * ```typescript
 * // Export as JSON for API submission
 * const jsonExport = exportAuthAuditLogs({ format: 'json' });
 *
 * // Export as CSV for spreadsheet analysis
 * const csvExport = exportAuthAuditLogs({ format: 'csv' });
 *
 * // Send to server
 * await fetch('/api/audit/sync', {
 *   method: 'POST',
 *   body: jsonExport,
 *   headers: { 'Content-Type': 'application/json' },
 * });
 * ```
 */
export function exportAuthAuditLogs(options?: AuditExportOptions): string {
  const logs = getAuthAuditLogs();
  const format = options?.format || "json";
  const includeMetadata = options?.includeMetadata !== false;

  if (format === "csv") {
    const headers = ["id", "type", "timestamp", "userId"];
    if (includeMetadata) {
      headers.push("metadata");
    }

    const rows = logs.map((event) => {
      const row = [event.id, event.type, event.timestamp, event.userId || ""];
      if (includeMetadata) {
        row.push(event.metadata ? JSON.stringify(event.metadata) : "");
      }
      return row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  // Default to JSON format
  const exportData = includeMetadata
    ? logs
    : logs.map(({ metadata: _metadata, ...rest }) => rest);

  return JSON.stringify(exportData, null, 2);
}

/**
 * Creates a structured audit payload for server-side logging.
 *
 * This function packages audit events with additional context
 * for transmission to a central logging server.
 *
 * @param events - Events to package (defaults to all logs)
 * @returns Structured payload ready for server transmission
 */
export function createServerAuditPayload(events?: AuthEvent[]): {
  source: string;
  version: string;
  exportedAt: string;
  eventCount: number;
  events: AuthEvent[];
} {
  const logsToExport = events || getAuthAuditLogs();

  return {
    source: "lexiflow-nextjs",
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    eventCount: logsToExport.length,
    events: logsToExport,
  };
}

// ============================================================================
// Event-Specific Logging Helpers
// ============================================================================

/**
 * Logs a user login event.
 *
 * @param userId - The ID of the user who logged in
 * @param metadata - Additional login context (IP, device, etc.)
 * @returns The created AuthEvent
 */
export function logLogin(
  userId: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("login", userId, metadata);
}

/**
 * Logs a user logout event.
 *
 * @param userId - The ID of the user who logged out
 * @param metadata - Additional logout context
 * @returns The created AuthEvent
 */
export function logLogout(
  userId: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("logout", userId, metadata);
}

/**
 * Logs an MFA enabled event.
 *
 * @param userId - The ID of the user who enabled MFA
 * @param mfaMethod - The MFA method enabled (totp, sms, etc.)
 * @param metadata - Additional context
 * @returns The created AuthEvent
 */
export function logMfaEnabled(
  userId: string,
  mfaMethod: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("mfa_enabled", userId, { ...metadata, mfaMethod });
}

/**
 * Logs an MFA disabled event.
 *
 * @param userId - The ID of the user who disabled MFA
 * @param mfaMethod - The MFA method disabled
 * @param metadata - Additional context
 * @returns The created AuthEvent
 */
export function logMfaDisabled(
  userId: string,
  mfaMethod: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("mfa_disabled", userId, { ...metadata, mfaMethod });
}

/**
 * Logs a password changed event.
 *
 * @param userId - The ID of the user who changed their password
 * @param metadata - Additional context
 * @returns The created AuthEvent
 */
export function logPasswordChanged(
  userId: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("password_changed", userId, metadata);
}

/**
 * Logs a token refresh event.
 *
 * @param userId - The ID of the user whose token was refreshed
 * @param metadata - Additional context
 * @returns The created AuthEvent
 */
export function logTokenRefresh(
  userId: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("token_refresh", userId, metadata);
}

/**
 * Logs a session expired event.
 *
 * @param userId - The ID of the user whose session expired
 * @param metadata - Additional context
 * @returns The created AuthEvent
 */
export function logSessionExpired(
  userId: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("session_expired", userId, metadata);
}

/**
 * Logs an access denied event.
 *
 * @param userId - The ID of the user who was denied access
 * @param resource - The resource that access was denied to
 * @param reason - The reason for access denial
 * @param metadata - Additional context
 * @returns The created AuthEvent
 */
export function logAccessDenied(
  userId: string | undefined,
  resource: string,
  reason: string,
  metadata?: AuthEventMetadata
): AuthEvent {
  return logAuthEvent("access_denied", userId, {
    ...metadata,
    resource,
    reason,
  });
}
