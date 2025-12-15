import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'AUDIT_LOG';

export interface AuditLogOptions {
  action: string;
  resource: string;
  description?: string;
}

export const AuditLog = (options: AuditLogOptions) =>
  SetMetadata(AUDIT_LOG_KEY, options);
