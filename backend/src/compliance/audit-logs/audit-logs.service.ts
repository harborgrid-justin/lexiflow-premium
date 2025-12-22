import { Injectable } from '@nestjs/common';
import {
  AuditLogDto,
  CreateAuditLogDto,
  QueryAuditLogsDto,
  ExportAuditLogsDto, AuditAction,
  AuditEntityType,
} from './dto/audit-log.dto';

@Injectable()
export class AuditLogsService {
  private auditLogs: Map<string, AuditLogDto> = new Map();

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
    const sortBy = (query.sortBy || 'timestamp') as keyof AuditLogDto;
    const sortOrder = query.sortOrder || 'desc';
    logs.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') {
        return (aVal ?? 0) > (bVal ?? 0) ? 1 : -1;
      }
      return (aVal ?? 0) < (bVal ?? 0) ? 1 : -1;
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

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
