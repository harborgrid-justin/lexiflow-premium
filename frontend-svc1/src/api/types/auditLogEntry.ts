/**
 * Audit Log Entry API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.admin.getAuditLogs() with queryKeys.admin.auditLogs() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/audit/entities/audit-log.entity.ts
 */

import { AuditLogEntry } from '@/types/compliance-risk';
import { UUID, UserId } from '@/types/primitives';

/**
 * @deprecated MOCK DATA - Use DataService.admin instead
 */
export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'l1' as UUID, timestamp: '2024-03-12 14:30:22', userId: 'usr-partner-alex' as UserId, user: 'Alexandra H.', action: 'VIEW_DOC', resource: 'D-001 (Confidential)', ip: '192.168.1.45' },
    { id: 'l2' as UUID, timestamp: '2024-03-12 14:28:10', userId: 'usr-assoc-james' as UserId, user: 'James Doe', action: 'EXPORT_REPORT', resource: 'Billing_Q1', ip: '192.168.1.22' },
    { id: 'l3' as UUID, timestamp: '2024-03-12 14:15:00', userId: 'system' as UserId, user: 'System', action: 'AUTO_BACKUP', resource: 'Database_Full', ip: 'localhost' },
    { id: 'l4' as UUID, timestamp: '2024-03-12 16:00:00', userId: 'usr-admin-justin' as UserId, user: 'Justin Saadein', action: 'USER_ADD', resource: 'New Staff', ip: '192.168.1.10' },
];
