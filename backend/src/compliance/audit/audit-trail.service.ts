import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  SHARE = 'SHARE',
  DOWNLOAD = 'DOWNLOAD',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  CONFIGURATION = 'CONFIGURATION',
  SECURITY = 'SECURITY',
  COMPLIANCE = 'COMPLIANCE',
  BILLING = 'BILLING',
  ADMINISTRATION = 'ADMINISTRATION',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  sequenceNumber: number;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  organizationId: string;
  successful: boolean;
  errorMessage?: string;
  metadata: Record<string, any>;
  changes?: AuditChange[];
  hash: string;
  previousHash: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'ADDED' | 'MODIFIED' | 'REMOVED';
}

export interface AuditChain {
  entries: AuditEntry[];
  isValid: boolean;
  brokenAtSequence?: number;
  totalEntries: number;
}

@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);
  private auditEntries: AuditEntry[] = [];
  private sequenceCounter: number = 0;
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor(
    // @InjectRepository would be used for actual database entities
  ) {}

  /**
   * Create immutable audit log entry with blockchain-style hashing
   */
  async createAuditEntry(entryData: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    action: AuditAction;
    category: AuditCategory;
    severity: AuditSeverity;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    organizationId: string;
    successful: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
    changes?: AuditChange[];
  }): Promise<AuditEntry> {
    const timestamp = new Date();
    this.sequenceCounter++;

    const entry: Omit<AuditEntry, 'hash'> = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp,
      sequenceNumber: this.sequenceCounter,
      userId: entryData.userId,
      userName: entryData.userName,
      userEmail: entryData.userEmail,
      userRole: entryData.userRole,
      action: entryData.action,
      category: entryData.category,
      severity: entryData.severity,
      resourceType: entryData.resourceType,
      resourceId: entryData.resourceId,
      resourceName: entryData.resourceName,
      description: entryData.description,
      ipAddress: entryData.ipAddress,
      userAgent: entryData.userAgent,
      sessionId: entryData.sessionId,
      organizationId: entryData.organizationId,
      successful: entryData.successful,
      errorMessage: entryData.errorMessage,
      metadata: entryData.metadata || {},
      changes: entryData.changes,
      previousHash: this.lastHash,
    };

    // Calculate hash for this entry (blockchain-style)
    const hash = this.calculateHash(entry);
    const auditEntry: AuditEntry = { ...entry, hash };

    // Store entry
    this.auditEntries.push(auditEntry);
    this.lastHash = hash;

    // Log critical and error events
    if (entryData.severity === AuditSeverity.CRITICAL || entryData.severity === AuditSeverity.ERROR) {
      this.logger.error(
        `[${entryData.severity}] ${entryData.userName} (${entryData.userId}): ${entryData.description}`,
      );
    }

    // Log failed security events
    if (!entryData.successful && entryData.category === AuditCategory.SECURITY) {
      this.logger.warn(
        `Security event failed: ${entryData.description} by ${entryData.userName} from ${entryData.ipAddress}`,
      );
    }

    return auditEntry;
  }

  /**
   * Calculate cryptographic hash for audit entry
   */
  private calculateHash(entry: Omit<AuditEntry, 'hash'>): string {
    const data = JSON.stringify({
      sequenceNumber: entry.sequenceNumber,
      timestamp: entry.timestamp.toISOString(),
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      description: entry.description,
      previousHash: entry.previousHash,
      metadata: entry.metadata,
      changes: entry.changes,
    });

    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify integrity of audit chain
   */
  async verifyAuditChain(startSequence?: number, endSequence?: number): Promise<AuditChain> {
    const start = startSequence || 1;
    const end = endSequence || this.sequenceCounter;

    const entries = this.auditEntries.filter(
      e => e.sequenceNumber >= start && e.sequenceNumber <= end,
    );

    let isValid = true;
    let brokenAtSequence: number | undefined;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Recalculate hash
      const calculatedHash = this.calculateHash({
        ...entry,
        hash: undefined as any,
      });

      if (calculatedHash !== entry.hash) {
        isValid = false;
        brokenAtSequence = entry.sequenceNumber;
        this.logger.error(
          `Audit chain integrity violation at sequence ${entry.sequenceNumber}: Hash mismatch`,
        );
        break;
      }

      // Verify chain linkage
      if (i > 0) {
        const previousEntry = entries[i - 1];
        if (entry.previousHash !== previousEntry.hash) {
          isValid = false;
          brokenAtSequence = entry.sequenceNumber;
          this.logger.error(
            `Audit chain integrity violation at sequence ${entry.sequenceNumber}: Chain broken`,
          );
          break;
        }
      }
    }

    return {
      entries,
      isValid,
      brokenAtSequence,
      totalEntries: entries.length,
    };
  }

  /**
   * Get audit entries by criteria
   */
  async getAuditEntries(criteria: {
    userId?: string;
    organizationId?: string;
    action?: AuditAction;
    category?: AuditCategory;
    severity?: AuditSeverity;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    successful?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: AuditEntry[]; total: number }> {
    let filtered = [...this.auditEntries];

    if (criteria.userId) {
      filtered = filtered.filter(e => e.userId === criteria.userId);
    }

    if (criteria.organizationId) {
      filtered = filtered.filter(e => e.organizationId === criteria.organizationId);
    }

    if (criteria.action) {
      filtered = filtered.filter(e => e.action === criteria.action);
    }

    if (criteria.category) {
      filtered = filtered.filter(e => e.category === criteria.category);
    }

    if (criteria.severity) {
      filtered = filtered.filter(e => e.severity === criteria.severity);
    }

    if (criteria.resourceType) {
      filtered = filtered.filter(e => e.resourceType === criteria.resourceType);
    }

    if (criteria.resourceId) {
      filtered = filtered.filter(e => e.resourceId === criteria.resourceId);
    }

    if (criteria.startDate) {
      filtered = filtered.filter(e => e.timestamp >= criteria.startDate!);
    }

    if (criteria.endDate) {
      filtered = filtered.filter(e => e.timestamp <= criteria.endDate!);
    }

    if (criteria.successful !== undefined) {
      filtered = filtered.filter(e => e.successful === criteria.successful);
    }

    // Sort by timestamp descending (most recent first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filtered.length;
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 100;

    const paginated = filtered.slice(offset, offset + limit);

    return { entries: paginated, total };
  }

  /**
   * Get audit history for specific resource
   */
  async getResourceHistory(resourceType: string, resourceId: string): Promise<AuditEntry[]> {
    return this.auditEntries
      .filter(e => e.resourceType === resourceType && e.resourceId === resourceId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Chronological order
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalActions: number;
    actionsByType: Record<AuditAction, number>;
    failedActions: number;
    criticalEvents: number;
    lastActivity: Date | null;
    mostAccessedResources: Array<{ resourceType: string; resourceId: string; count: number }>;
  }> {
    const userEntries = this.auditEntries.filter(
      e => e.userId === userId && e.timestamp >= startDate && e.timestamp <= endDate,
    );

    const actionsByType: Record<AuditAction, number> = {} as any;
    Object.values(AuditAction).forEach(action => {
      actionsByType[action] = 0;
    });

    userEntries.forEach(entry => {
      actionsByType[entry.action]++;
    });

    const failedActions = userEntries.filter(e => !e.successful).length;
    const criticalEvents = userEntries.filter(e => e.severity === AuditSeverity.CRITICAL).length;

    const lastActivity = userEntries.length > 0
      ? userEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
      : null;

    // Count resource access
    const resourceCounts = new Map<string, number>();
    userEntries.forEach(entry => {
      const key = `${entry.resourceType}:${entry.resourceId}`;
      resourceCounts.set(key, (resourceCounts.get(key) || 0) + 1);
    });

    const mostAccessedResources = Array.from(resourceCounts.entries())
      .map(([key, count]) => {
        const [resourceType, resourceId] = key.split(':');
        return { resourceType, resourceId, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: userEntries.length,
      actionsByType,
      failedActions,
      criticalEvents,
      lastActivity,
      mostAccessedResources,
    };
  }

  /**
   * Get security events
   */
  async getSecurityEvents(
    startDate: Date,
    endDate: Date,
    failedOnly: boolean = false,
  ): Promise<AuditEntry[]> {
    let events = this.auditEntries.filter(
      e =>
        e.category === AuditCategory.SECURITY &&
        e.timestamp >= startDate &&
        e.timestamp <= endDate,
    );

    if (failedOnly) {
      events = events.filter(e => !e.successful);
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get recent critical events
   */
  async getCriticalEvents(hours: number = 24): Promise<AuditEntry[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.auditEntries
      .filter(e => e.severity === AuditSeverity.CRITICAL && e.timestamp >= since)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get compliance-related events
   */
  async getComplianceEvents(startDate: Date, endDate: Date): Promise<AuditEntry[]> {
    return this.auditEntries
      .filter(
        e =>
          e.category === AuditCategory.COMPLIANCE &&
          e.timestamp >= startDate &&
          e.timestamp <= endDate,
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(startDate: Date, endDate: Date): Promise<{
    totalEntries: number;
    uniqueUsers: number;
    actionDistribution: Record<AuditAction, number>;
    categoryDistribution: Record<AuditCategory, number>;
    severityDistribution: Record<AuditSeverity, number>;
    successRate: number;
    criticalEventsCount: number;
    securityEventsCount: number;
  }> {
    const entries = this.auditEntries.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate,
    );

    const uniqueUsers = new Set(entries.map(e => e.userId)).size;

    const actionDistribution: Record<AuditAction, number> = {} as any;
    const categoryDistribution: Record<AuditCategory, number> = {} as any;
    const severityDistribution: Record<AuditSeverity, number> = {} as any;

    Object.values(AuditAction).forEach(action => {
      actionDistribution[action] = 0;
    });
    Object.values(AuditCategory).forEach(category => {
      categoryDistribution[category] = 0;
    });
    Object.values(AuditSeverity).forEach(severity => {
      severityDistribution[severity] = 0;
    });

    entries.forEach(entry => {
      actionDistribution[entry.action]++;
      categoryDistribution[entry.category]++;
      severityDistribution[entry.severity]++;
    });

    const successfulEntries = entries.filter(e => e.successful).length;
    const successRate = entries.length > 0 ? (successfulEntries / entries.length) * 100 : 100;

    const criticalEventsCount = entries.filter(e => e.severity === AuditSeverity.CRITICAL).length;
    const securityEventsCount = entries.filter(e => e.category === AuditCategory.SECURITY).length;

    return {
      totalEntries: entries.length,
      uniqueUsers,
      actionDistribution,
      categoryDistribution,
      severityDistribution,
      successRate,
      criticalEventsCount,
      securityEventsCount,
    };
  }

  /**
   * Track data changes
   */
  async trackChanges(
    userId: string,
    userName: string,
    userEmail: string,
    userRole: string,
    resourceType: string,
    resourceId: string,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    organizationId: string,
  ): Promise<AuditEntry> {
    const changes: AuditChange[] = [];

    // Detect changes
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
      const oldValue = oldData[key];
      const newValue = newData[key];

      if (oldValue === undefined && newValue !== undefined) {
        changes.push({ field: key, oldValue: null, newValue, changeType: 'ADDED' });
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({ field: key, oldValue, newValue: null, changeType: 'REMOVED' });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue, changeType: 'MODIFIED' });
      }
    });

    return this.createAuditEntry({
      userId,
      userName,
      userEmail,
      userRole,
      action: AuditAction.UPDATE,
      category: AuditCategory.DATA_MODIFICATION,
      severity: AuditSeverity.INFO,
      resourceType,
      resourceId,
      description: `Updated ${resourceType} ${resourceId}: ${changes.length} fields changed`,
      ipAddress,
      userAgent,
      sessionId,
      organizationId,
      successful: true,
      changes,
      metadata: { changesCount: changes.length },
    });
  }
}
