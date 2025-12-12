import { Injectable } from '@nestjs/common';
import {
  AuditLogDto,
  CreateAuditLogDto,
  QueryAuditLogsDto,
  ExportAuditLogsDto,
  AuditAction,
  AuditEntityType,
  AuditRetentionPolicyDto,
  CreateRetentionPolicyDto,
  AuditSessionDto,
} from './dto/audit-log.dto';

@Injectable()
export class AuditLogsService {
  private auditLogs: Map<string, AuditLogDto> = new Map();
  private retentionPolicies: Map<string, AuditRetentionPolicyDto> = new Map();
  private sessions: Map<string, AuditSessionDto> = new Map();

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLogDto> {
    const auditLog: AuditLogDto = {
      id: this.generateId(),
      ...createAuditLogDto,
      timestamp: new Date(),
    };

    this.auditLogs.set(auditLog.id, auditLog);
    return auditLog;
  }

  async findAll(query: QueryAuditLogsDto): Promise<{
    data: AuditLogDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    let logs = Array.from(this.auditLogs.values());

    // Apply filters
    if (query.userId) {
      logs = logs.filter((log) => log.userId === query.userId);
    }
    if (query.entityType) {
      logs = logs.filter((log) => log.entityType === query.entityType);
    }
    if (query.entityId) {
      logs = logs.filter((log) => log.entityId === query.entityId);
    }
    if (query.action) {
      logs = logs.filter((log) => log.action === query.action);
    }
    if (query.startDate) {
      logs = logs.filter((log) => log.timestamp >= query.startDate);
    }
    if (query.endDate) {
      logs = logs.filter((log) => log.timestamp <= query.endDate);
    }

    // Sort
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    logs.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    // Paginate
    const page = query.page || 1;
    const limit = query.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    return {
      data: paginatedLogs,
      total: logs.length,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<AuditLogDto> {
    const log = this.auditLogs.get(id);
    if (!log) {
      throw new Error(`Audit log with ID ${id} not found`);
    }
    return log;
  }

  async findByEntity(
    entityType: AuditEntityType,
    entityId: string,
  ): Promise<AuditLogDto[]> {
    return Array.from(this.auditLogs.values())
      .filter(
        (log) => log.entityType === entityType && log.entityId === entityId,
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async findByUser(userId: string): Promise<AuditLogDto[]> {
    return Array.from(this.auditLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async export(exportDto: ExportAuditLogsDto): Promise<any> {
    const query: QueryAuditLogsDto = {
      startDate: exportDto.startDate,
      endDate: exportDto.endDate,
      userId: exportDto.userId,
      entityType: exportDto.entityType,
      action: exportDto.action,
    };

    const { data } = await this.findAll(query);

    switch (exportDto.format) {
      case 'json':
        return { data, format: 'json' };
      case 'csv':
        return this.convertToCSV(data);
      case 'pdf':
        return { data, format: 'pdf', message: 'PDF generation placeholder' };
      default:
        return { data, format: 'json' };
    }
  }

  private convertToCSV(logs: AuditLogDto[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'ID',
      'User',
      'Action',
      'Entity Type',
      'Entity ID',
      'Timestamp',
      'IP Address',
    ];
    const rows = logs.map((log) => [
      log.id,
      log.userName,
      log.action,
      log.entityType,
      log.entityId,
      log.timestamp.toISOString(),
      log.ipAddress || '',
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  }

  async findBySession(sessionId: string): Promise<AuditLogDto[]> {
    return Array.from(this.auditLogs.values())
      .filter((log) => log.metadata?.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Retention Policy Management
  async createRetentionPolicy(dto: CreateRetentionPolicyDto): Promise<AuditRetentionPolicyDto> {
    const policy: AuditRetentionPolicyDto = {
      id: this.generateId(),
      ...dto,
      createdAt: new Date(),
    };

    this.retentionPolicies.set(policy.id, policy);
    return policy;
  }

  async getRetentionPolicies(): Promise<AuditRetentionPolicyDto[]> {
    return Array.from(this.retentionPolicies.values());
  }

  async applyRetentionPolicies(): Promise<{
    deletedCount: number;
    archivedCount: number;
  }> {
    let deletedCount = 0;
    let archivedCount = 0;

    const now = new Date();
    const policies = Array.from(this.retentionPolicies.values());

    for (const log of this.auditLogs.values()) {
      for (const policy of policies) {
        // Check if policy applies to this log
        const matchesEntityType = !policy.entityTypes || policy.entityTypes.includes(log.entityType);
        const matchesAction = !policy.actions || policy.actions.includes(log.action);

        if (matchesEntityType && matchesAction) {
          const retentionDate = new Date(now.getTime() - policy.retentionDays * 24 * 60 * 60 * 1000);

          if (log.timestamp < retentionDate) {
            if (policy.archiveBeforeDelete) {
              // Archive log (in real implementation, this would move to archive storage)
              archivedCount++;
            }

            if (policy.autoDelete) {
              this.auditLogs.delete(log.id);
              deletedCount++;
            }
          }
        }
      }
    }

    return { deletedCount, archivedCount };
  }

  // Session Management
  async createSession(
    userId: string,
    userName: string,
    ipAddress: string,
    userAgent: string,
    loginMethod?: string,
  ): Promise<AuditSessionDto> {
    const session: AuditSessionDto = {
      sessionId: this.generateId(),
      userId,
      userName,
      startTime: new Date(),
      ipAddress,
      userAgent,
      loginMethod,
      activitiesCount: 0,
      organizationId: 'default',
    };

    this.sessions.set(session.sessionId, session);

    // Log session start
    await this.create({
      userId,
      userName,
      action: AuditAction.LOGIN,
      entityType: AuditEntityType.USER,
      entityId: userId,
      metadata: { sessionId: session.sessionId, loginMethod },
      ipAddress,
      userAgent,
      organizationId: 'default',
    });

    return session;
  }

  async endSession(
    sessionId: string,
    logoutMethod?: string,
  ): Promise<AuditSessionDto> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    session.endTime = new Date();
    session.logoutMethod = logoutMethod;

    this.sessions.set(sessionId, session);

    // Log session end
    await this.create({
      userId: session.userId,
      userName: session.userName,
      action: AuditAction.LOGOUT,
      entityType: AuditEntityType.USER,
      entityId: session.userId,
      metadata: {
        sessionId,
        logoutMethod,
        duration: session.endTime.getTime() - session.startTime.getTime(),
        activitiesCount: session.activitiesCount,
      },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      organizationId: session.organizationId,
    });

    return session;
  }

  async getActiveSessions(): Promise<AuditSessionDto[]> {
    return Array.from(this.sessions.values())
      .filter((session) => !session.endTime)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async getSessionById(sessionId: string): Promise<AuditSessionDto> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    return session;
  }

  async getUserSessions(userId: string): Promise<AuditSessionDto[]> {
    return Array.from(this.sessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && !session.endTime) {
      session.activitiesCount++;
      this.sessions.set(sessionId, session);
    }
  }

  // Statistics and Analytics
  async getAuditStatistics(organizationId: string): Promise<{
    totalLogs: number;
    logsLast24h: number;
    logsLast7d: number;
    logsLast30d: number;
    topUsers: Array<{ userId: string; userName: string; count: number }>;
    topActions: Array<{ action: AuditAction; count: number }>;
    topEntities: Array<{ entityType: AuditEntityType; count: number }>;
  }> {
    const logs = Array.from(this.auditLogs.values()).filter(
      (log) => log.organizationId === organizationId,
    );

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userCounts = new Map<string, { userName: string; count: number }>();
    const actionCounts = new Map<AuditAction, number>();
    const entityCounts = new Map<AuditEntityType, number>();

    logs.forEach((log) => {
      // User counts
      const userCount = userCounts.get(log.userId) || { userName: log.userName, count: 0 };
      userCount.count++;
      userCounts.set(log.userId, userCount);

      // Action counts
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);

      // Entity counts
      entityCounts.set(log.entityType, (entityCounts.get(log.entityType) || 0) + 1);
    });

    return {
      totalLogs: logs.length,
      logsLast24h: logs.filter((log) => log.timestamp >= last24h).length,
      logsLast7d: logs.filter((log) => log.timestamp >= last7d).length,
      logsLast30d: logs.filter((log) => log.timestamp >= last30d).length,
      topUsers: Array.from(userCounts.entries())
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topActions: Array.from(actionCounts.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topEntities: Array.from(entityCounts.entries())
        .map(([entityType, count]) => ({ entityType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
