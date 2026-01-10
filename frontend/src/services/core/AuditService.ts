import { isBackendApiEnabled } from "@/api";
import { db, STORES } from "@/services/data/db";
import { apiClient } from "@/services/infrastructure/apiClient";
// UserId import removed as we use string type for userId in methods

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "READ"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "IMPORT"
  | "APPROVE"
  | "REJECT"
  | "CONFLICT_CHECK"
  | "COMPLIANCE_CHECK";

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string; // Allow string for flexibility, but recommend AuditAction
  resource: string;
  resourceId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service for logging audit trails for critical business operations.
 * Implements "Issue #7: Audit Trail Gaps" from Business Logic Audit.
 */
export class AuditService {
  /**
   * Log a general audit entry
   */
  static async log(entry: Omit<AuditEntry, "id" | "timestamp">): Promise<void> {
    const auditEntry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "server", // Simple user agent capture
      ...entry,
    };

    try {
      if (isBackendApiEnabled()) {
        try {
          await apiClient.post("/audit/log", auditEntry);
        } catch (error) {
          console.error(
            "[AuditService] Backend log failed, falling back to console/local",
            error
          );
          // Fallback to local is allowed if backend fails to ensure trace exists somewhere?
          // Usually we queue it, but for now we log error.
        }
      } else {
        // Fallback or Local Mode
        await db.put(STORES.AUDIT_LOGS, auditEntry);
      }
    } catch (e) {
      // LAST RESORT: Console log to ensure evidence is not completely lost
      // In production, this should be sent to a dedicated logging service (Sentry, Datadog)
      console.error("[AUDIT_FAILURE]", e, JSON.stringify(auditEntry));
    }

    // Dev logging
    if (process.env.NODE_ENV === "development") {
      console.log("[AUDIT]", entry.action, entry.resource, entry.resourceId);
    }
  }

  /**
   * Helper to log an operation (CREATE/UPDATE/DELETE)
   */
  static async logOperation(
    operation: AuditAction | string,
    resource: string,
    resourceId: string,
    before: unknown,
    after: unknown,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId: userId || AuditService.getCurrentUserId(),
      action: operation,
      resource,
      resourceId,
      before,
      after,
      success: true,
    });
  }

  /**
   * Helper to log a failure
   */
  static async logFailure(
    operation: AuditAction | string,
    resource: string,
    resourceId: string,
    error: Error | string,
    userId?: string
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await this.log({
      userId: userId || AuditService.getCurrentUserId(),
      action: operation,
      resource,
      resourceId,
      success: false,
      errorMessage,
    });
  }

  /**
   * Safe User ID retrieval
   */
  private static getCurrentUserId(): string {
    if (typeof localStorage === "undefined") return "system";

    try {
      // Try standard keys
      const userJson = localStorage.getItem("lexiflow_user");
      if (userJson) {
        const user = JSON.parse(userJson);
        return user.id || "unknown-user";
      }

      const token = localStorage.getItem("access_token");
      if (token) return "authenticated-user"; // Placeholder if we can't parse token
    } catch (e) {
      console.error("Error retrieving user ID:", e);
      return "error-retrieving-user";
    }
    return "guest";
  }
}
