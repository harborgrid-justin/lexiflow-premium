
import { ConflictCheck, UUID, UserId } from '../types';
import { EthicalWall, CaseId, GroupId } from '../types';

export const MOCK_CONFLICTS: ConflictCheck[] = [
    // FIX: Cast string to branded type UUID and UserId
    { id: '1' as UUID, entityName: 'MegaCorp Inc.', date: '2024-03-10', status: 'Cleared', foundIn: [], checkedById: 'system' as UserId, checkedBy: 'System Auto-Check' },
    // FIX: Cast string to branded type UUID and UserId
    { id: '2' as UUID, entityName: 'John Smith', date: '2024-03-11', status: 'Flagged', foundIn: ['Former Client (2018)', 'Witness in C-2022-01'], checkedById: 'usr-admin-justin' as UserId, checkedBy: 'Admin User' },
];

export const MOCK_WALLS: EthicalWall[] = [
    // FIX: Cast string to branded types
    { id: 'w1' as UUID, caseId: 'M&A-Project-Blue' as CaseId, title: 'Project Blue Acquisition', restrictedGroups: ['Litigation Team A' as GroupId], authorizedUsers: ['M&A Partners' as UserId, 'Risk Committee' as UserId], status: 'Active' },
    // FIX: Cast string to branded types
    { id: 'w2' as UUID, caseId: 'LIT-Jones-v-Smith' as CaseId, title: 'Jones Conflict Wall', restrictedGroups: ['Partner Sarah Miller' as GroupId], authorizedUsers: ['All Staff' as UserId], status: 'Active' },
];