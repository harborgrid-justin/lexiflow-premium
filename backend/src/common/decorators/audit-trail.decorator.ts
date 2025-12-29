import { SetMetadata } from '@nestjs/common';

export const AUDIT_TRAIL_KEY = 'auditTrail';

/**
 * Audit Event Severity
 */
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Audit Trail Options
 */
export interface AuditTrailOptions {
  action: string;
  resource?: string;
  severity?: AuditSeverity;
  logRequest?: boolean;
  logResponse?: boolean;
  captureUser?: boolean;
  captureIp?: boolean;
  persistToDisk?: boolean;
  alertOnFailure?: boolean;
}

/**
 * Audit Trail Decorator
 *
 * Logs security-relevant actions for compliance and forensic analysis.
 * Creates detailed audit logs with request/response data, user info, and timestamps.
 *
 * @example
 * @AuditTrail({
 *   action: 'DELETE_USER',
 *   resource: 'users',
 *   severity: AuditSeverity.HIGH,
 *   logRequest: true,
 *   persistToDisk: true
 * })
 * @Delete(':id')
 * async deleteUser(@Param('id') id: string) {}
 */
export const AuditTrail = (options: AuditTrailOptions) =>
  SetMetadata(AUDIT_TRAIL_KEY, options);
