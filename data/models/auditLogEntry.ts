
import { AuditLogEntry } from '../../types';

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'l1', timestamp: '2024-03-12 14:30:22', userId: 'usr-partner-alex', user: 'Alexandra H.', action: 'VIEW_DOC', resource: 'D-001 (Confidential)', ip: '192.168.1.45' },
    { id: 'l2', timestamp: '2024-03-12 14:28:10', userId: 'usr-assoc-james', user: 'James Doe', action: 'EXPORT_REPORT', resource: 'Billing_Q1', ip: '192.168.1.22' },
    { id: 'l3', timestamp: '2024-03-12 14:15:00', userId: 'system', user: 'System', action: 'AUTO_BACKUP', resource: 'Database_Full', ip: 'localhost' },
    { id: 'l4', timestamp: '2024-03-12 16:00:00', userId: 'usr-admin-justin', user: 'Justin Saadein', action: 'USER_ADD', resource: 'New Staff', ip: '192.168.1.10' },
];
