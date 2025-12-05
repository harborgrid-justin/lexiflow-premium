
import { ConflictCheck } from '../../types';

export const MOCK_CONFLICTS: ConflictCheck[] = [
    { id: '1', entityName: 'MegaCorp Inc.', date: '2024-03-10', status: 'Cleared', foundIn: [], checkedById: 'system', checkedBy: 'System Auto-Check' },
    { id: '2', entityName: 'John Smith', date: '2024-03-11', status: 'Flagged', foundIn: ['Former Client (2018)', 'Witness in C-2022-01'], checkedById: 'usr-admin-justin', checkedBy: 'Admin User' },
];
