import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@common/services/audit-log.service';

export const AUDIT_LOG_KEY = 'AUDIT_LOG';

export interface AuditLogOptions {
  action: AuditAction | string;
  resource: string;
  description?: string;
}

export const AuditLog = (options: AuditLogOptions) =>
  SetMetadata(AUDIT_LOG_KEY, options);
