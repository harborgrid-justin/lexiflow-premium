import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  SoftRemoveEvent,
  RecoverEvent,
  DataSource,
} from 'typeorm';
import { Logger } from '@nestjs/common';

export interface AuditLogEntry {
  entityName: string;
  entityId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RECOVER';
  userId?: string;
  userName?: string;
  timestamp: Date;
  beforeValues?: Record<string, unknown>;
  afterValues?: Record<string, unknown>;
  changes?: Record<string, { old: unknown; new: any }>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditSubscriber.name);
  private static auditLogs: AuditLogEntry[] = [];
  private static maxBufferSize = 1000;
  private static flushInterval = 60000;
  private flushTimer?: NodeJS.Timeout;
  private dataSource?: DataSource;

  private readonly excludedEntities = ['AuditLog', 'Session', 'LoginAttempt', 'RefreshToken'];

  private readonly sensitiveFields = [
    'password',
    'passwordHash',
    'salt',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
    'encryptedData',
  ];

  constructor() {
    this.startFlushTimer();
    this.logger.log('Audit subscriber initialized');
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushAuditLogs();
    }, AuditSubscriber.flushInterval);
  }

  private getUserContext(): { userId?: string; userName?: string; ipAddress?: string; userAgent?: string } {
    try {
      const context = (global as any).requestContext;
      return {
        userId: context?.user?.id,
        userName: context?.user?.email || context?.user?.username,
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
      };
    } catch {
      return {};
    }
  }

  private shouldAudit(entityName: string): boolean {
    return !this.excludedEntities.includes(entityName);
  }

  private maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = { ...data };

    for (const field of this.sensitiveFields) {
      if (masked[field] !== undefined) {
        masked[field] = '[REDACTED]';
      }
    }

    return masked;
  }

  private extractEntityId(entity: unknown, dataSource?: DataSource): string {
    if ((entity as any).id) return (entity as any).id;
    if ((entity as any).uuid) return (entity as any).uuid;

    if (dataSource) {
      try {
        const metadata = dataSource.getMetadata((entity as any).constructor);
        const primaryColumn = metadata.primaryColumns[0];
        return primaryColumn?.propertyName ? (entity as any)[primaryColumn.propertyName] : 'unknown';
      } catch {
        return 'unknown';
      }
    }
    return 'unknown';
  }

  private calculateChanges(before: Record<string, unknown>, after: Record<string, unknown>): Record<string, { old: unknown; new: any }> {
    const changes: Record<string, { old: unknown; new: any }> = {};

    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      if (before[key] !== after[key]) {
        if (this.sensitiveFields.includes(key)) {
          changes[key] = { old: '[REDACTED]', new: '[REDACTED]' };
        } else {
          changes[key] = {
            old: this.serializeValue(before[key]),
            new: this.serializeValue(after[key]),
          };
        }
      }
    }

    return changes;
  }

  private serializeValue(value: unknown): any {
    if (value === undefined) return null;
    if (value === null) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return '[Complex Object]';
      }
    }
    return value;
  }

  private createAuditLog(
    entityName: string,
    entityId: string,
    action: AuditLogEntry['action'],
    beforeValues?: Record<string, unknown>,
    afterValues?: Record<string, unknown>,
  ): void {
    const context = this.getUserContext();

    const auditLog: AuditLogEntry = {
      entityName,
      entityId,
      action,
      timestamp: new Date(),
      ...context,
    };

    if (beforeValues) {
      auditLog.beforeValues = this.maskSensitiveData(beforeValues);
    }

    if (afterValues) {
      auditLog.afterValues = this.maskSensitiveData(afterValues);
    }

    if (beforeValues && afterValues) {
      auditLog.changes = this.calculateChanges(beforeValues, afterValues);
    }

    AuditSubscriber.auditLogs.push(auditLog);

    if (AuditSubscriber.auditLogs.length >= AuditSubscriber.maxBufferSize) {
      this.flushAuditLogs();
    }
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    try {
      const entityName = event.metadata.name;

      if (!this.shouldAudit(entityName)) {
        return;
      }

      // Store dataSource reference for later use
      if (!this.dataSource && event.connection) {
        this.dataSource = event.connection;
      }

      const entityId = this.extractEntityId(event.entity, event.connection);
      const afterValues = { ...event.entity };

      this.createAuditLog(entityName, entityId, 'INSERT', undefined, afterValues);

      this.logger.debug(`Audit: INSERT on ${entityName}`, { entityId });
    } catch (error) {
      this.logger.error('Error in afterInsert audit', error);
    }
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    try {
      const entityName = event.metadata.name;

      if (!this.shouldAudit(entityName)) {
        return;
      }

      if (!this.dataSource && event.connection) {
        this.dataSource = event.connection;
      }

      const entityId = this.extractEntityId(event.entity, event.connection);

      const beforeValues = event.databaseEntity || {};
      const afterValues = { ...event.entity };

      this.createAuditLog(entityName, entityId, 'UPDATE', beforeValues, afterValues);

      const changes = this.calculateChanges(beforeValues, afterValues);
      const changeCount = Object.keys(changes).length;

      this.logger.debug(`Audit: UPDATE on ${entityName}`, { entityId, changeCount });
    } catch (error) {
      this.logger.error('Error in afterUpdate audit', error);
    }
  }

  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    try {
      const entityName = event.metadata.name;

      if (!this.shouldAudit(entityName)) {
        return;
      }

      if (!this.dataSource && event.connection) {
        this.dataSource = event.connection;
      }

      const entityId = this.extractEntityId(event.entity || event.databaseEntity, event.connection);
      const beforeValues = event.databaseEntity || event.entity || {};

      this.createAuditLog(entityName, entityId, 'DELETE', beforeValues, undefined);

      this.logger.debug(`Audit: DELETE on ${entityName}`, { entityId });
    } catch (error) {
      this.logger.error('Error in afterRemove audit', error);
    }
  }

  async afterSoftRemove(event: SoftRemoveEvent<any>): Promise<void> {
    try {
      const entityName = event.metadata.name;

      if (!this.shouldAudit(entityName)) {
        return;
      }

      if (!this.dataSource && event.connection) {
        this.dataSource = event.connection;
      }

      const entityId = this.extractEntityId(event.entity, event.connection);
      const beforeValues = event.databaseEntity || {};
      const afterValues = { ...event.entity };

      this.createAuditLog(entityName, entityId, 'SOFT_DELETE', beforeValues, afterValues);

      this.logger.debug(`Audit: SOFT_DELETE on ${entityName}`, { entityId });
    } catch (error) {
      this.logger.error('Error in afterSoftRemove audit', error);
    }
  }

  async afterRecover(event: RecoverEvent<any>): Promise<void> {
    try {
      const entityName = event.metadata.name;

      if (!this.shouldAudit(entityName)) {
        return;
      }

      if (!this.dataSource && event.connection) {
        this.dataSource = event.connection;
      }

      const entityId = this.extractEntityId(event.entity, event.connection);
      const beforeValues = event.databaseEntity || {};
      const afterValues = { ...event.entity };

      this.createAuditLog(entityName, entityId, 'RECOVER', beforeValues, afterValues);

      this.logger.debug(`Audit: RECOVER on ${entityName}`, { entityId });
    } catch (error) {
      this.logger.error('Error in afterRecover audit', error);
    }
  }

  private async flushAuditLogs(): Promise<void> {
    if (AuditSubscriber.auditLogs.length === 0) {
      return;
    }

    const logsToFlush = [...AuditSubscriber.auditLogs];
    AuditSubscriber.auditLogs = [];

    try {
      this.logger.log(`Flushing ${logsToFlush.length} audit log entries`);

      for (const log of logsToFlush) {
        await this.persistAuditLog(log);
      }

      this.logger.debug(`Successfully flushed ${logsToFlush.length} audit logs`);
    } catch (error) {
      this.logger.error('Failed to flush audit logs', error);
      AuditSubscriber.auditLogs.unshift(...logsToFlush);
    }
  }

  private async persistAuditLog(log: AuditLogEntry): Promise<void> {
    try {
      if (!this.dataSource) {
        this.logger.debug('Audit log entry (dataSource not available)', log);
        return;
      }

      const auditLogRepository = this.dataSource.getRepository('AuditLog');

      if (auditLogRepository) {
        await auditLogRepository.save({
          entityType: log.entityName,
          entityId: log.entityId,
          action: log.action.toLowerCase(),
          userId: log.userId,
          userName: log.userName,
          timestamp: log.timestamp,
          oldValues: log.beforeValues,
          newValues: log.afterValues,
          changes: log.changes,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
        });
      } else {
        this.logger.debug('Audit log entry (repository not found)', log);
      }
    } catch (error) {
      this.logger.warn('Could not persist audit log, logging to console', { log, error: (error as Error).message });
    }
  }

  async getAuditLogs(options?: {
    entityName?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    let logs = [...AuditSubscriber.auditLogs];

    if (options?.entityName) {
      logs = logs.filter(log => log.entityName === options.entityName);
    }

    if (options?.entityId) {
      logs = logs.filter(log => log.entityId === options.entityId);
    }

    if (options?.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }

    if (options?.action) {
      logs = logs.filter(log => log.action === options.action);
    }

    if (options?.startDate) {
      logs = logs.filter(log => log.timestamp >= options.startDate!);
    }

    if (options?.endDate) {
      logs = logs.filter(log => log.timestamp <= options.endDate!);
    }

    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  clearAuditLogs(): void {
    AuditSubscriber.auditLogs = [];
    this.logger.log('Audit logs cleared');
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushAuditLogs();
  }
}
