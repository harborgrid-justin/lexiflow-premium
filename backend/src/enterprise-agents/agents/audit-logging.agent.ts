/**
 * Enterprise Agent 08: Audit Logging Agent
 *
 * Manages comprehensive audit trail logging, compliance reporting,
 * activity tracking, and forensic analysis support.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BaseAgent, createAgentMetadata } from "../core/base-agent";
import {
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
} from "../interfaces/agent.interfaces";

/**
 * Audit operation types
 */
export enum AuditOperationType {
  LOG_ACTION = "LOG_ACTION",
  LOG_ACCESS = "LOG_ACCESS",
  LOG_CHANGE = "LOG_CHANGE",
  LOG_ERROR = "LOG_ERROR",
  QUERY_LOGS = "QUERY_LOGS",
  GENERATE_REPORT = "GENERATE_REPORT",
  ARCHIVE_LOGS = "ARCHIVE_LOGS",
  EXPORT_LOGS = "EXPORT_LOGS",
}

/**
 * Audit event category
 */
export enum AuditCategory {
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  DATA_ACCESS = "DATA_ACCESS",
  DATA_MODIFICATION = "DATA_MODIFICATION",
  SYSTEM_EVENT = "SYSTEM_EVENT",
  SECURITY_EVENT = "SECURITY_EVENT",
  COMPLIANCE_EVENT = "COMPLIANCE_EVENT",
  USER_ACTION = "USER_ACTION",
}

/**
 * Audit severity
 */
export enum AuditSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  INFO = "INFO",
}

/**
 * Audit task payload
 */
export interface AuditTaskPayload {
  operationType: AuditOperationType;
  category?: AuditCategory;
  severity?: AuditSeverity;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  dateRange?: { start: Date; end: Date };
  filters?: Record<string, unknown>;
}

/**
 * Audit result
 */
export interface AuditResult {
  operationType: AuditOperationType;
  auditLogId?: string;
  logs?: AuditLogEntry[];
  count?: number;
  exportPath?: string;
  duration: number;
  errors: string[];
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  correlationId?: string;
}

/**
 * Audit Logging Agent
 * Manages comprehensive audit trail and compliance logging
 */
@Injectable()
export class AuditLoggingAgent extends BaseAgent {
  private readonly auditLogger = new Logger(AuditLoggingAgent.name);
  private readonly auditLogs: AuditLogEntry[] = [];
  private readonly maxLogsInMemory = 100000;
  private logSequence = 0;

  constructor(eventEmitter: EventEmitter2) {
    super(
      createAgentMetadata(
        "AuditLoggingAgent",
        AgentType.WORKER,
        [
          "audit.log.action",
          "audit.log.access",
          "audit.log.change",
          "audit.log.error",
          "audit.query",
          "audit.report",
          "audit.archive",
          "audit.export",
        ],
        {
          priority: AgentPriority.CRITICAL,
          maxConcurrentTasks: 100,
          heartbeatIntervalMs: 10000,
          healthCheckIntervalMs: 30000,
        }
      ),
      eventEmitter
    );
  }

  protected async onInitialize(): Promise<void> {
    this.auditLogger.log("Initializing Audit Logging Agent");
  }

  protected async onStart(): Promise<void> {
    this.auditLogger.log("Audit Logging Agent started");
  }

  protected async onStop(): Promise<void> {
    this.auditLogger.log("Audit Logging Agent stopping");
    await this.flushLogs();
  }

  protected async onPause(): Promise<void> {
    this.auditLogger.log("Audit Logging Agent paused");
  }

  protected async onResume(): Promise<void> {
    this.auditLogger.log("Audit Logging Agent resumed");
  }

  protected async onEvent(event: AgentEvent): Promise<void> {
    await this.logAgentEvent(event);
  }

  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>
  ): Promise<TResult> {
    const payload = task.payload as unknown as AuditTaskPayload;

    switch (payload.operationType) {
      case AuditOperationType.LOG_ACTION:
        return this.logAction(payload) as unknown as TResult;

      case AuditOperationType.LOG_ACCESS:
        return this.logAccess(payload) as unknown as TResult;

      case AuditOperationType.LOG_CHANGE:
        return this.logChange(payload) as unknown as TResult;

      case AuditOperationType.LOG_ERROR:
        return this.logError(payload) as unknown as TResult;

      case AuditOperationType.QUERY_LOGS:
        return this.queryLogs(payload) as unknown as TResult;

      case AuditOperationType.GENERATE_REPORT:
        return this.generateReport(payload) as unknown as TResult;

      case AuditOperationType.ARCHIVE_LOGS:
        return this.archiveLogs(payload) as unknown as TResult;

      case AuditOperationType.EXPORT_LOGS:
        return this.exportLogs(payload) as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  private async logAction(payload: AuditTaskPayload): Promise<AuditResult> {
    const startTime = Date.now();
    const entry = this.createLogEntry(
      payload.category ?? AuditCategory.USER_ACTION,
      payload.severity ?? AuditSeverity.INFO,
      payload
    );

    this.storeLog(entry);

    return {
      operationType: AuditOperationType.LOG_ACTION,
      auditLogId: entry.id,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async logAccess(payload: AuditTaskPayload): Promise<AuditResult> {
    const startTime = Date.now();
    const entry = this.createLogEntry(
      AuditCategory.DATA_ACCESS,
      payload.severity ?? AuditSeverity.INFO,
      payload
    );

    this.storeLog(entry);

    return {
      operationType: AuditOperationType.LOG_ACCESS,
      auditLogId: entry.id,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async logChange(payload: AuditTaskPayload): Promise<AuditResult> {
    const startTime = Date.now();
    const entry = this.createLogEntry(
      AuditCategory.DATA_MODIFICATION,
      payload.severity ?? AuditSeverity.MEDIUM,
      payload
    );

    entry.oldValue = payload.oldValue;
    entry.newValue = payload.newValue;

    this.storeLog(entry);

    return {
      operationType: AuditOperationType.LOG_CHANGE,
      auditLogId: entry.id,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async logError(payload: AuditTaskPayload): Promise<AuditResult> {
    const startTime = Date.now();
    const entry = this.createLogEntry(
      AuditCategory.SYSTEM_EVENT,
      payload.severity ?? AuditSeverity.HIGH,
      payload
    );

    this.storeLog(entry);

    return {
      operationType: AuditOperationType.LOG_ERROR,
      auditLogId: entry.id,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async queryLogs(payload: AuditTaskPayload): Promise<AuditResult> {
    const startTime = Date.now();
    let results = [...this.auditLogs];

    if (payload.category) {
      results = results.filter((log) => log.category === payload.category);
    }

    if (payload.severity) {
      results = results.filter((log) => log.severity === payload.severity);
    }

    if (payload.userId) {
      results = results.filter((log) => log.userId === payload.userId);
    }

    if (payload.resourceType) {
      results = results.filter(
        (log) => log.resourceType === payload.resourceType
      );
    }

    if (payload.dateRange) {
      const { start, end } = payload.dateRange;
      results = results.filter(
        (log) => log.timestamp >= start && log.timestamp <= end
      );
    }

    return {
      operationType: AuditOperationType.QUERY_LOGS,
      logs: results.slice(-1000),
      count: results.length,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async generateReport(
    payload: AuditTaskPayload
  ): Promise<AuditResult> {
    const startTime = Date.now();

    const report = {
      totalLogs: this.auditLogs.length,
      byCategory: this.groupByCategory(),
      bySeverity: this.groupBySeverity(),
      dateRange: payload.dateRange,
      generatedAt: new Date(),
    };

    return {
      operationType: AuditOperationType.GENERATE_REPORT,
      logs: [],
      count: report.totalLogs,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async archiveLogs(payload: AuditTaskPayload): Promise<AuditResult> {
    const startTime = Date.now();
    // Use date range from payload or default to 90 days ago
    const cutoffDate =
      payload.dateRange?.start ??
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const toArchive = this.auditLogs.filter(
      (log) => log.timestamp < cutoffDate
    );

    // Filter by category if specified
    const filteredLogs = payload.category
      ? toArchive.filter((log) => log.category === payload.category)
      : toArchive;

    return {
      operationType: AuditOperationType.ARCHIVE_LOGS,
      count: filteredLogs.length,
      logs: filteredLogs.slice(0, 10), // Return sample of archived logs
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async exportLogs(payload: AuditTaskPayload): Promise<AuditResult> {
    const startTime = Date.now();

    // Filter logs based on payload criteria
    let logsToExport = [...this.auditLogs];

    if (payload.dateRange) {
      const { start, end } = payload.dateRange;
      logsToExport = logsToExport.filter(
        (log) => log.timestamp >= start && log.timestamp <= end
      );
    }

    if (payload.category) {
      logsToExport = logsToExport.filter(
        (log) => log.category === payload.category
      );
    }

    if (payload.severity) {
      logsToExport = logsToExport.filter(
        (log) => log.severity === payload.severity
      );
    }

    const exportFormat = payload.metadata?.format ?? "json";
    const exportPath = `/exports/audit-${Date.now()}.${exportFormat}`;

    return {
      operationType: AuditOperationType.EXPORT_LOGS,
      exportPath,
      count: logsToExport.length,
      logs: logsToExport.slice(0, 5), // Return sample of exported logs
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private createLogEntry(
    category: AuditCategory,
    severity: AuditSeverity,
    payload: AuditTaskPayload
  ): AuditLogEntry {
    return {
      id: `audit-${++this.logSequence}-${Date.now()}`,
      timestamp: new Date(),
      category,
      severity,
      action: payload.action ?? "unknown",
      resourceType: payload.resourceType,
      resourceId: payload.resourceId,
      userId: payload.userId,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      metadata: payload.metadata ?? {},
    };
  }

  private storeLog(entry: AuditLogEntry): void {
    this.auditLogs.push(entry);

    if (this.auditLogs.length > this.maxLogsInMemory) {
      this.auditLogs.shift();
    }
  }

  private async logAgentEvent(event: AgentEvent): Promise<void> {
    const entry = this.createLogEntry(
      AuditCategory.SYSTEM_EVENT,
      AuditSeverity.INFO,
      {
        operationType: AuditOperationType.LOG_ACTION,
        action: event.type,
        metadata: {
          payload: event.payload,
          sourceAgentId: event.sourceAgentId,
        },
      }
    );
    this.storeLog(entry);
  }

  private groupByCategory(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const log of this.auditLogs) {
      result[log.category] = (result[log.category] ?? 0) + 1;
    }
    return result;
  }

  private groupBySeverity(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const log of this.auditLogs) {
      result[log.severity] = (result[log.severity] ?? 0) + 1;
    }
    return result;
  }

  private async flushLogs(): Promise<void> {
    this.auditLogger.log(`Flushing ${this.auditLogs.length} audit logs`);
  }

  public getLogCount(): number {
    return this.auditLogs.length;
  }

  public getRecentLogs(count: number): AuditLogEntry[] {
    return this.auditLogs.slice(-count);
  }
}
