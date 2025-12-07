


import { ConflictCheck, UUID, UserId } from '../../types';

export const MOCK_CONFLICTS: ConflictCheck[] = [
    // FIX: Cast string to branded type UUID and UserId
    { id: '1' as UUID, entityName: 'MegaCorp Inc.', date: '2024-03-10', status: 'Cleared', foundIn: [], checkedById: 'system' as UserId, checkedBy: 'System Auto-Check' },
    // FIX: Cast string to branded type UUID and UserId
    { id: '2' as UUID, entityName: 'John Smith', date: '2024-03-11', status: 'Flagged', foundIn: ['Former Client (2018)', 'Witness in C-2022-01'], checkedById: 'usr-admin-justin' as UserId, checkedBy: 'Admin User' },
];