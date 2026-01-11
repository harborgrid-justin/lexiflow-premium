/**
 * @module services/infrastructure/auditTrailService
 * @category Infrastructure Services
 * @description Production audit trail service for comprehensive activity logging,
 * compliance tracking, and forensic analysis. Supports CRUD operations, user
 * actions, system events, and regulatory compliance requirements.
 *
 * @example
 * ```typescript
 * // Log entity operation
 * await AuditTrailService.logOperation({
 *   action: 'UPDATE_CASE',
 *   resource: 'case',
 *   resourceId: 'case-123',
 *   userId: 'user-456',
 *   changes: { status: { from: 'Active', to: 'Closed' } }
 * });
 *
 * // Query audit trail
 * const logs = await AuditTrailService.queryLogs({
 *   resourceId: 'case-123',
 *   startDate: new Date('2025-01-01')
 * });
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "IMPORT"
  | "SHARE"
  | "DOWNLOAD"
  | "REDACT"
  | "APPROVE"
  | "REJECT"
  | "ASSIGN"
  | "UNASSIGN"
  | "LOGIN"
  | "LOGOUT"
  | "ACCESS_DENIED"
  | "SYSTEM_EVENT";

export type AuditResource =
  | "case"
  | "document"
  | "evidence"
  | "docket"
  | "pleading"
  | "invoice"
  | "time_entry"
  | "client"
  | "matter"
  | "user"
  | "workflow"
  | "compliance"
  | "trust_account"
  | "conversation"
  | "research"
  | "calendar_event"
  | "task"
  | "system";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  resourceName?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  duration?: number;
  severity?: "info" | "warning" | "error" | "critical";
}

export interface AuditQueryOptions {
  userId?: string;
  action?: AuditAction | AuditAction[];
  resource?: AuditResource | AuditResource[];
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  severity?: "info" | "warning" | "error" | "critical";
  limit?: number;
  offset?: number;
  sortBy?: "timestamp" | "action" | "resource";
  sortOrder?: "asc" | "desc";
}

export interface AuditStatistics {
  totalLogs: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Record<string, number>;
  failureRate: number;
  averageDuration: number;
  timeRange: { start: Date; end: Date };
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  totalOperations: number;
  sensitiveOperations: number;
  accessViolations: number;
  dataExports: number;
  redactions: number;
  logs: AuditLogEntry[];
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class AuditTrailServiceClass {
  private readonly STORAGE_KEY = "lexiflow_audit_trail";
  private readonly MAX_LOCAL_LOGS = 10000;
  private logs: AuditLogEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadLogs();
    this.startAutoFlush();
  }

  /**
   * Logs an operation to the audit trail
   */
  async logOperation(params: {
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    resourceName?: string;
    userId: string;
    userName?: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
    metadata?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
    duration?: number;
  }): Promise<string> {
    const {
      action,
      resource,
      resourceId,
      resourceName,
      userId,
      userName,
      changes,
      metadata,
      success = true,
      errorMessage,
      duration,
    } = params;

    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      userId,
      userName,
      action,
      resource,
      resourceId,
      resourceName,
      changes,
      metadata,
      ipAddress: await this.getClientIP(),
      userAgent: this.getUserAgent(),
      sessionId: this.sessionId,
      success,
      errorMessage,
      duration,
      severity: this.determineSeverity(action, success),
    };

    this.logs.push(entry);
    await this.persistLog(entry);

    // Trim if exceeds max
    if (this.logs.length > this.MAX_LOCAL_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOCAL_LOGS);
      this.saveLogs();
    }

    return entry.id;
  }

  /**
   * Convenience method for logging CRUD operations
   */
  async logCRUD(
    action: "CREATE" | "READ" | "UPDATE" | "DELETE",
    resource: AuditResource,
    resourceId: string,
    userId: string,
    changes?: Record<string, { from: unknown; to: unknown }>
  ): Promise<string> {
    return await this.logOperation({
      action,
      resource,
      resourceId,
      userId,
      changes,
    });
  }

  /**
   * Logs user authentication events
   */
  async logAuth(
    action: "LOGIN" | "LOGOUT" | "ACCESS_DENIED",
    userId: string,
    success: boolean,
    errorMessage?: string
  ): Promise<string> {
    return await this.logOperation({
      action,
      resource: "user",
      resourceId: userId,
      userId,
      success,
      errorMessage,
    });
  }

  /**
   * Logs sensitive operations (exports, redactions, etc.)
   */
  async logSensitiveOperation(
    action: "EXPORT" | "DOWNLOAD" | "REDACT" | "SHARE",
    resource: AuditResource,
    resourceId: string,
    userId: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    return await this.logOperation({
      action,
      resource,
      resourceId,
      userId,
      metadata,
    });
  }

  /**
   * Queries audit logs with filtering
   */
  async queryLogs(options: AuditQueryOptions = {}): Promise<AuditLogEntry[]> {
    const {
      userId,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      success,
      severity,
      limit = 100,
      offset = 0,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = options;

    let filtered = [...this.logs];

    // Apply filters
    if (userId) {
      filtered = filtered.filter((log) => log.userId === userId);
    }

    if (action) {
      const actions = Array.isArray(action) ? action : [action];
      filtered = filtered.filter((log) => actions.includes(log.action));
    }

    if (resource) {
      const resources = Array.isArray(resource) ? resource : [resource];
      filtered = filtered.filter((log) => resources.includes(log.resource));
    }

    if (resourceId) {
      filtered = filtered.filter((log) => log.resourceId === resourceId);
    }

    if (startDate) {
      filtered = filtered.filter((log) => log.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((log) => log.timestamp <= endDate);
    }

    if (success !== undefined) {
      filtered = filtered.filter((log) => log.success === success);
    }

    if (severity) {
      filtered = filtered.filter((log) => log.severity === severity);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "timestamp":
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case "action":
          comparison = a.action.localeCompare(b.action);
          break;
        case "resource":
          comparison = a.resource.localeCompare(b.resource);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    // Paginate
    return filtered.slice(offset, offset + limit);
  }

  /**
   * Gets audit statistics
   */
  async getStatistics(
    options: { startDate?: Date; endDate?: Date } = {}
  ): Promise<AuditStatistics> {
    const logs = await this.queryLogs(options);

    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    let totalDuration = 0;
    let durationCount = 0;
    let failureCount = 0;

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byResource[log.resource] = (byResource[log.resource] || 0) + 1;
      byUser[log.userId] = (byUser[log.userId] || 0) + 1;

      if (!log.success) failureCount++;

      if (log.duration !== undefined) {
        totalDuration += log.duration;
        durationCount++;
      }
    }

    return {
      totalLogs: logs.length,
      byAction,
      byResource,
      byUser,
      failureRate: logs.length > 0 ? failureCount / logs.length : 0,
      averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      timeRange: {
        start:
          options.startDate || (logs[logs.length - 1]?.timestamp ?? new Date()),
        end: options.endDate || (logs[0]?.timestamp ?? new Date()),
      },
    };
  }

  /**
   * Generates compliance report
   */
  async generateComplianceReport(period: {
    start: Date;
    end: Date;
  }): Promise<ComplianceReport> {
    const logs = await this.queryLogs({
      startDate: period.start,
      endDate: period.end,
      sortBy: "timestamp",
      sortOrder: "desc",
    });

    const sensitiveActions: AuditAction[] = [
      "EXPORT",
      "DOWNLOAD",
      "REDACT",
      "SHARE",
      "DELETE",
    ];
    const sensitiveOperations = logs.filter((log) =>
      sensitiveActions.includes(log.action)
    );
    const accessViolations = logs.filter(
      (log) => log.action === "ACCESS_DENIED"
    );
    const dataExports = logs.filter((log) => log.action === "EXPORT");
    const redactions = logs.filter((log) => log.action === "REDACT");

    return {
      reportId: `compliance-${Date.now()}`,
      generatedAt: new Date(),
      period,
      totalOperations: logs.length,
      sensitiveOperations: sensitiveOperations.length,
      accessViolations: accessViolations.length,
      dataExports: dataExports.length,
      redactions: redactions.length,
      logs: sensitiveOperations,
    };
  }

  /**
   * Exports audit trail to JSON
   */
  async exportLogs(options: AuditQueryOptions = {}): Promise<string> {
    const logs = await this.queryLogs(options);

    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalLogs: logs.length,
        filters: options,
        logs,
      },
      null,
      2
    );
  }

  /**
   * Exports audit trail to CSV
   */
  async exportLogsCSV(options: AuditQueryOptions = {}): Promise<string> {
    const logs = await this.queryLogs(options);

    const headers = [
      "Timestamp",
      "User ID",
      "User Name",
      "Action",
      "Resource",
      "Resource ID",
      "Success",
      "IP Address",
      "Session ID",
      "Duration (ms)",
      "Error Message",
    ];

    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.userId,
      log.userName || "",
      log.action,
      log.resource,
      log.resourceId || "",
      log.success ? "Yes" : "No",
      log.ipAddress || "",
      log.sessionId || "",
      log.duration?.toString() || "",
      log.errorMessage || "",
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  /**
   * Clears local audit logs (use with caution)
   */
  async clearLogs(): Promise<void> {
    this.logs = [];
    this.saveLogs();
  }

  /**
   * Gets activity timeline for a resource
   */
  async getResourceTimeline(
    resource: AuditResource,
    resourceId: string
  ): Promise<AuditLogEntry[]> {
    return await this.queryLogs({
      resource,
      resourceId,
      sortBy: "timestamp",
      sortOrder: "desc",
    });
  }

  /**
   * Gets user activity history
   */
  async getUserActivity(
    userId: string,
    limit?: number
  ): Promise<AuditLogEntry[]> {
    return await this.queryLogs({
      userId,
      limit,
      sortBy: "timestamp",
      sortOrder: "desc",
    });
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Persists log to backend API
   */
  private async persistLog(entry: AuditLogEntry): Promise<void> {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const url = `${baseUrl}/api/audit/logs`;

      await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthToken() || "",
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error("Failed to persist audit log to backend:", error);
    }
  }

  /**
   * Loads logs from localStorage
   */
  private loadLogs(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map(
          (log: { timestamp: string; [key: string]: unknown }) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })
        );
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      this.logs = [];
    }
  }

  /**
   * Saves logs to localStorage
   */
  private saveLogs(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error("Failed to save audit logs:", error);
    }
  }

  /**
   * Auto-flush to backend every 30 seconds
   */
  private startAutoFlush(): void {
    if (typeof window === "undefined") return;

    setInterval(() => {
      this.saveLogs();
    }, 30000);
  }

  /**
   * Generates unique log ID
   */
  private generateLogId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets client IP address (best effort)
   */
  private async getClientIP(): Promise<string | undefined> {
    if (typeof window === "undefined") return undefined;

    try {
      const response = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(2000),
      });
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  /**
   * Gets user agent string
   */
  private getUserAgent(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return navigator.userAgent;
  }

  /**
   * Gets authentication token
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return (
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")
      );
    } catch {
      return null;
    }
  }

  /**
   * Determines log severity based on action and success
   */
  private determineSeverity(
    action: AuditAction,
    success: boolean
  ): "info" | "warning" | "error" | "critical" {
    if (!success) {
      if (["DELETE", "REDACT"].includes(action)) return "critical";
      if (action === "ACCESS_DENIED") return "error";
      return "warning";
    }

    if (["DELETE", "REDACT", "EXPORT"].includes(action)) return "warning";
    return "info";
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AuditTrailService = new AuditTrailServiceClass();
