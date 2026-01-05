
import { AuditLogEntry } from '../../types.ts';

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'l1', timestamp: '2024-03-12 14:30:22', user: 'Alexandra H.', action: 'VIEW_DOC', resource: 'D-001 (Confidential)', ip: '192.168.1.45' },
    { id: 'l2', timestamp: '2024-03-12 14:28:10', user: 'James Doe', action: 'EXPORT_REPORT', resource: 'Billing_Q1', ip: '192.168.1.22' },
    { id: 'l3', timestamp: '2024-03-12 14:15:00', user: 'System', action: 'AUTO_BACKUP', resource: 'Database_Full', ip: 'localhost' },
];
