export class AuditLogDto {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  organizationId: string;
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  FILE = 'FILE',
  SEND = 'SEND',
}

export enum AuditEntityType {
  CASE = 'Case',
  DOCUMENT = 'Document',
  TIME_ENTRY = 'TimeEntry',
  INVOICE = 'Invoice',
  USER = 'User',
  CLIENT = 'Client',
  EVIDENCE = 'Evidence',
  DISCOVERY = 'Discovery',
  MOTION = 'Motion',
}

export class QueryAuditLogsDto {
  userId?: string;
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CreateAuditLogDto {
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  organizationId: string;
}

export class ExportAuditLogsDto {
  format: 'csv' | 'json' | 'pdf';
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  entityType?: AuditEntityType;
  action?: AuditAction;
}
